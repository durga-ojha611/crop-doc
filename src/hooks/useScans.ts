import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Scan {
  id: string;
  user_id: string;
  image_url: string;
  imageKey?: string;
  disease_detected: string;
  crop_name: string | null;
  confidence_score: number;
  geo_lat: number | null;
  geo_long: number | null;
  created_at: string;
  diagnosisCandidates?: { diseaseName: string; confidence: number }[];
  treatmentPlan?: { step: string; description: string }[];
  plotId?: { _id: string, name: string, location?: string } | string;
}

let API_URL = import.meta.env.VITE_API_URL || '/api';
if (API_URL && !API_URL.endsWith('/api') && API_URL !== '/api') API_URL += '/api';

export const useScans = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['scans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/scans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch scans');
      const data = await res.json();
      return data.map((d: any) => ({ ...d, id: d._id }));
    },
    enabled: !!user,
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (imageDataUrl: string) => {
      return imageDataUrl;
    }
  });

  const saveScanMutation = useMutation({
    mutationFn: async (data: {
      imageUrl: string;
      diseaseDetected: string;
      cropName: string | null;
      confidenceScore: number;
      plotId?: string;
      diagnosisCandidates?: any[];
      treatmentPlan?: any[];
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const token = localStorage.getItem('token');

      // Convert dataUrl to blob
      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      
      // 1. Ask backend for a pre-signed URL
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
          console.warn('Failed to upload image to S3, falling back to base64.');
          fallbackImageUrl = data.imageUrl;
        }
      } else {
        console.warn('S3 upload URL generation failed. Ensure AWS S3 is configured. Falling back to base64 image.');
        fallbackImageUrl = data.imageUrl;
      }

      // 3. Tell backend the upload is done, create the Scan record
      const scanPayload = {
        imageKey: key,
        image_url: fallbackImageUrl,
        disease_detected: data.diseaseDetected,
        crop_name: data.cropName,
        confidence_score: data.confidenceScore,
        plotId: data.plotId,
        diagnosisCandidates: data.diagnosisCandidates,
        treatmentPlan: data.treatmentPlan
      };

      const res = await fetch(`${API_URL}/scans`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(scanPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save scan');
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans', user?.id] });
      toast.success('Scan saved', {
        description: 'Your diagnosis has been saved to your history',
      });
    },
    onError: (error: any) => {
      console.error('Error saving scan:', error);
      toast.error('Save failed', {
        description: error.message || 'Could not save scan to database',
      });
    }
  });

  const deleteScanMutation = useMutation({
    mutationFn: async (scanId: string) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/scans/${scanId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete scan');
      return scanId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans', user?.id] });
      toast.success('Scan deleted', {
        description: 'The scan has been removed from your history',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting scan:', error);
      toast.error('Delete failed', {
        description: error.message || 'Could not delete scan',
      });
    }
  });

  return {
    scans,
    isLoading,
    uploadImage: uploadImageMutation.mutateAsync,
    saveScan: async (
      imageUrl: string, 
      diseaseDetected: string, 
      cropName: string | null, 
      confidenceScore: number, 
      plotId?: string,
      diagnosisCandidates?: any[],
      treatmentPlan?: any[]
    ) => {
      return await saveScanMutation.mutateAsync({ imageUrl, diseaseDetected, cropName, confidenceScore, plotId, diagnosisCandidates, treatmentPlan });
    },
    deleteScan: deleteScanMutation.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['scans', user?.id] }),
  };
};
