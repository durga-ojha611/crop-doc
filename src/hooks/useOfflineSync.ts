import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PendingScan {
  id: string;
  imageDataUrl: string;
  diseaseName: string;
  cropName: string;
  confidence: number;
  plotId?: string;
  diagnosisCandidates?: any[];
  treatmentPlan?: any[];
  createdAt: string;
}

const PENDING_SCANS_KEY = 'crop-doc-pending-scans';
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingScans, setPendingScans] = useState<PendingScan[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem(PENDING_SCANS_KEY);
    if (stored) {
      try {
        setPendingScans(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse pending scans:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(pendingScans));
  }, [pendingScans]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addPendingScan = useCallback((scan: Omit<PendingScan, 'id' | 'createdAt'>) => {
    const newScan: PendingScan = {
      ...scan,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setPendingScans(prev => [...prev, newScan]);
    return newScan.id;
  }, []);

  const removePendingScan = useCallback((id: string) => {
    setPendingScans(prev => prev.filter(scan => scan.id !== id));
  }, []);

  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl);
    return response.blob();
  };

  const syncPendingScans = useCallback(async () => {
    if (!user || !isOnline || pendingScans.length === 0 || isSyncing) {
      return { synced: 0, failed: 0 };
    }

    setIsSyncing(true);
    let synced = 0;
    let failed = 0;
    const token = localStorage.getItem('token');

    for (const scan of pendingScans) {
      try {
        const blob = await dataUrlToBlob(scan.imageDataUrl);
        
        // 1. Get pre-signed URL
        const uploadUrlRes = await fetch(`${API_URL}/scans/upload-url`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fileType: blob.type || 'image/jpeg' })
        });
        
        let key = undefined;
        let fallbackImageUrl = undefined;

        if (uploadUrlRes.ok) {
          const { uploadUrl, key: uploadKey } = await uploadUrlRes.json();

          // 2. Upload directly to S3
          const s3UploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': blob.type || 'image/jpeg' },
            body: blob,
          });

          if (s3UploadRes.ok) {
            key = uploadKey;
          } else {
            console.warn('Failed to upload offline scan image to S3, falling back to base64.');
            fallbackImageUrl = scan.imageDataUrl;
          }
        } else {
          console.warn('S3 upload URL generation failed for offline scan. Falling back to base64 image.');
          fallbackImageUrl = scan.imageDataUrl;
        }

        // 3. Confirm with backend
        const scanPayload = {
          imageKey: key,
          image_url: fallbackImageUrl,
          disease_detected: scan.diseaseName,
          crop_name: scan.cropName,
          confidence_score: scan.confidence,
          plotId: scan.plotId,
          diagnosisCandidates: scan.diagnosisCandidates,
          treatmentPlan: scan.treatmentPlan
        };

        const res = await fetch(`${API_URL}/scans`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(scanPayload),
        });

        if (!res.ok) throw new Error('Sync failed');

        removePendingScan(scan.id);
        synced++;
      } catch (error) {
        console.error('Failed to sync scan:', scan.id, error);
        failed++;
      }
    }

    setIsSyncing(false);
    return { synced, failed };
  }, [user, isOnline, pendingScans, isSyncing, removePendingScan]);

  useEffect(() => {
    if (isOnline && user && pendingScans.length > 0) {
      const timer = setTimeout(() => {
        syncPendingScans();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, user, pendingScans.length, syncPendingScans]);

  return {
    isOnline,
    pendingScans,
    pendingCount: pendingScans.length,
    isSyncing,
    addPendingScan,
    removePendingScan,
    syncPendingScans,
  };
};
