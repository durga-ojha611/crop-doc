import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Plot {
  _id: string;
  userId: string;
  name: string;
  cropType: string;
  location?: { lat: number; lng: number; label: string };
  plantingDate?: string;
  areaSize?: number;
  areaUnit?: string;
  isActive: boolean;
  createdAt: string;
}

const API_URL = 'http://localhost:5001/api';

export const usePlots = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchPlots = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/plots`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch plots');
      const data = await res.json();
      setPlots(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createPlot = async (plotData: Partial<Plot>) => {
    const res = await fetch(`${API_URL}/plots`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(plotData)
    });
    if (!res.ok) throw new Error('Failed to create plot');
    const newPlot = await res.json();
    setPlots(prev => [newPlot, ...prev]);
    return newPlot;
  };

  const updatePlot = async (id: string, plotData: Partial<Plot>) => {
    const res = await fetch(`${API_URL}/plots/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(plotData)
    });
    if (!res.ok) throw new Error('Failed to update plot');
    const updated = await res.json();
    setPlots(prev => prev.map(p => p._id === id ? updated : p));
    return updated;
  };

  const deletePlot = async (id: string) => {
    const res = await fetch(`${API_URL}/plots/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete plot');
    setPlots(prev => prev.filter(p => p._id !== id));
  };

  const getTimeline = async (id: string) => {
    const res = await fetch(`${API_URL}/plots/${id}/timeline`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return await res.json();
  };

  return {
    plots,
    isLoading,
    fetchPlots,
    createPlot,
    updatePlot,
    deletePlot,
    getTimeline
  };
};
