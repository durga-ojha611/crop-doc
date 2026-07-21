import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Recurrence {
  frequency: 'daily' | 'weekly' | 'custom_days';
  interval: number;
}

export interface Task {
  _id: string;
  userId: string;
  plotId?: string;
  title: string;
  type: 'watering' | 'fertilizing' | 'spraying' | 'weeding' | 'planting' | 'harvesting' | 'custom';
  scheduledDate: string;
  recurrence?: Recurrence;
  status: 'pending' | 'done' | 'missed' | 'snoozed';
  completedAt?: string;
  notes?: string;
  photoUrl?: string;
}

const PENDING_COMPLETED_TASKS_KEY = 'crop-doc-pending-completed-tasks';
let API_URL = import.meta.env.VITE_API_URL || '/api';
if (API_URL && !API_URL.endsWith('/api') && API_URL !== '/api') API_URL += '/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Offline sync states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCompletedTasks, setOfflineCompletedTasks] = useState<{id: string, notes?: string, imageDataUrl?: string}[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load offline queue on mount
  useEffect(() => {
    const stored = localStorage.getItem(PENDING_COMPLETED_TASKS_KEY);
    if (stored) {
      try {
        setOfflineCompletedTasks(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse offline completed tasks:', e);
      }
    }
  }, []);

  // Save offline queue
  useEffect(() => {
    localStorage.setItem(PENDING_COMPLETED_TASKS_KEY, JSON.stringify(offlineCompletedTasks));
  }, [offlineCompletedTasks]);

  // Online listener
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

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTasks = useCallback(async (filters?: { from?: string; to?: string; status?: string; plotId?: string }) => {
    if (!user || !isOnline) return;
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters?.from) query.append('from', filters.from);
      if (filters?.to) query.append('to', filters.to);
      if (filters?.status) query.append('status', filters.status);
      if (filters?.plotId) query.append('plotId', filters.plotId);

      const res = await fetch(`${API_URL}/tasks?${query.toString()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isOnline]);

  const fetchTodayTasks = useCallback(async () => {
    if (!user || !isOnline) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks/today`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch today tasks');
      const data = await res.json();
      
      // Optimistically hide offline-completed tasks from today's list
      const completedIds = offlineCompletedTasks.map(t => t.id);
      setTodayTasks(data.filter((t: Task) => !completedIds.includes(t._id)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isOnline, offlineCompletedTasks]);

  const createTask = async (taskData: Partial<Task>) => {
    if (!isOnline) throw new Error('Must be online to create tasks');
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData)
    });
    if (!res.ok) throw new Error('Failed to create task');
    const newTask = await res.json();
    setTasks(prev => [...prev, newTask]);
    if (new Date(newTask.scheduledDate).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)) {
      setTodayTasks(prev => [...prev, newTask]);
    }
    return newTask;
  };

  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl);
    return response.blob();
  };

  const completeTask = async (id: string, notes?: string, imageDataUrl?: string) => {
    if (!isOnline) {
      // Queue for offline
      setOfflineCompletedTasks(prev => [...prev, { id, notes, imageDataUrl }]);
      setTodayTasks(prev => prev.filter(t => t._id !== id));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (notes) formData.append('notes', notes);
      
      if (imageDataUrl) {
        const blob = await dataUrlToBlob(imageDataUrl);
        formData.append('image', blob, 'task-completion.jpg');
      }

      const res = await fetch(`${API_URL}/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to complete task');
      
      const { task, nextTask } = await res.json();
      
      setTasks(prev => prev.map(t => t._id === id ? task : t));
      if (nextTask) setTasks(prev => [...prev, nextTask]);
      
      setTodayTasks(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      console.error('Complete task error', error);
      throw error;
    }
  };

  const snoozeTask = async (id: string, days: number = 1) => {
    if (!isOnline) throw new Error('Must be online to snooze');
    const res = await fetch(`${API_URL}/tasks/${id}/snooze`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ days })
    });
    if (!res.ok) throw new Error('Failed to snooze task');
    const updated = await res.json();
    setTasks(prev => prev.map(t => t._id === id ? updated : t));
    setTodayTasks(prev => prev.filter(t => t._id !== id)); // snoozing removes it from today
  };

  const syncOfflineTasks = useCallback(async () => {
    if (!user || !isOnline || offlineCompletedTasks.length === 0 || isSyncing) return;
    setIsSyncing(true);
    
    const toRemove: string[] = [];
    const token = localStorage.getItem('token');

    for (const offlineTask of offlineCompletedTasks) {
      try {
        const formData = new FormData();
        if (offlineTask.notes) formData.append('notes', offlineTask.notes);
        if (offlineTask.imageDataUrl) {
          const blob = await dataUrlToBlob(offlineTask.imageDataUrl);
          formData.append('image', blob, 'task-completion.jpg');
        }

        const res = await fetch(`${API_URL}/tasks/${offlineTask.id}/complete`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (res.ok) {
          toRemove.push(offlineTask.id);
        }
      } catch (err) {
        console.error('Failed to sync task', offlineTask.id, err);
      }
    }

    if (toRemove.length > 0) {
      setOfflineCompletedTasks(prev => prev.filter(t => !toRemove.includes(t.id)));
      fetchTasks();
    }
    
    setIsSyncing(false);
  }, [user, isOnline, offlineCompletedTasks, isSyncing, fetchTasks]);

  useEffect(() => {
    if (isOnline && user && offlineCompletedTasks.length > 0) {
      const timer = setTimeout(() => syncOfflineTasks(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, user, offlineCompletedTasks.length, syncOfflineTasks]);

  return {
    tasks,
    todayTasks,
    isLoading,
    isOnline,
    offlineQueueCount: offlineCompletedTasks.length,
    fetchTasks,
    fetchTodayTasks,
    createTask,
    completeTask,
    snoozeTask
  };
};
