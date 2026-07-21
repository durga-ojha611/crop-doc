import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Alert {
  _id: string;
  plotId: string;
  userId: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: string;
  isRead: boolean;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useAlerts = (plotId?: string) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const url = plotId ? `${API_URL}/alerts/plot/${plotId}` : `${API_URL}/alerts`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json();
      setAlerts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, plotId]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/alerts/${id}/read`, {
        method: 'PUT',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error(error);
    }
  };

  return {
    alerts,
    isLoading,
    fetchAlerts,
    markAsRead
  };
};
