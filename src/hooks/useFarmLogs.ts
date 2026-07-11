import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface FarmLog {
  _id: string;
  plotId: string;
  userId: string;
  type: 'expense' | 'yield';
  category?: string;
  amount: number;
  unit?: string;
  date: string;
  note?: string;
}

const API_URL = 'http://localhost:5001/api';

export const useFarmLogs = () => {
  const [logs, setLogs] = useState<FarmLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchLogs = useCallback(async (plotId?: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      let query = '';
      if (plotId) query = `?plotId=${plotId}`;
      const res = await fetch(`${API_URL}/farmlogs${query}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch farm logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createLog = async (logData: Partial<FarmLog>) => {
    const res = await fetch(`${API_URL}/farmlogs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(logData)
    });
    if (!res.ok) throw new Error('Failed to create farm log');
    const newLog = await res.json();
    setLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  const updateLog = async (id: string, logData: Partial<FarmLog>) => {
    const res = await fetch(`${API_URL}/farmlogs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(logData)
    });
    if (!res.ok) throw new Error('Failed to update farm log');
    const updated = await res.json();
    setLogs(prev => prev.map(l => l._id === id ? updated : l));
    return updated;
  };

  const deleteLog = async (id: string) => {
    const res = await fetch(`${API_URL}/farmlogs/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete farm log');
    setLogs(prev => prev.filter(l => l._id !== id));
  };

  return {
    logs,
    isLoading,
    fetchLogs,
    createLog,
    updateLog,
    deleteLog
  };
};
