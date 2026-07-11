import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:5001/api';

export interface ChatMessage {
  _id?: string;
  role: 'user' | 'ai' | 'assistant' | 'model';
  content: string;
  retrievedContext?: {
    plotIds: string[];
    scanIds: string[];
  };
  created_at?: string;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: ChatMessage[];
  plotId?: { _id: string, name: string };
  updated_at: string;
}

export const useChat = (conversationId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(conversationId);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch list of conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return await res.json() as Conversation[];
    },
    enabled: !!user
  });

  // Load a specific conversation
  const loadConversation = useCallback(async (id: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chat/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load conversation');
      const data = await res.json() as Conversation;
      setMessages(data.messages);
      setActiveConversationId(data._id);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete conversation');
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      if (activeConversationId === id) {
        setActiveConversationId(undefined);
        setMessages([]);
      }
    }
  });

  const sendMessage = useCallback(async (text: string, plotId?: string, scanContext?: { cropName: string, diseaseName: string }) => {
    if (!text.trim()) return;

    try {
      setIsTyping(true);
      setError(null);

      // Optimistic UI update
      const userMsg: ChatMessage = { role: 'user', content: text };
      setMessages(prev => [...prev, userMsg]);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: text, 
          conversationId: activeConversationId,
          plotId,
          scanContext
        })
      });

      if (!res.ok) throw new Error('Failed to send message');
      
      const data = await res.json();
      
      // If this is a new conversation, set ID and refresh list
      if (!activeConversationId && data.conversationId) {
        setActiveConversationId(data.conversationId);
        queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      }

      const aiMsg: ChatMessage = { 
        role: 'ai', 
        content: data.reply,
        retrievedContext: data.retrievedContext
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      const errorMsg: ChatMessage = { 
        role: 'ai', 
        content: "Sorry, I'm having trouble connecting right now. Please try again." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [activeConversationId, user?.id, queryClient]);

  const clearChat = () => {
    setActiveConversationId(undefined);
    setMessages([]);
  };

  // If initial ID provided, load it
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId, loadConversation, activeConversationId]);

  return {
    messages,
    conversations,
    isLoadingConversations,
    activeConversationId,
    isTyping,
    error,
    sendMessage,
    loadConversation,
    deleteConversation: deleteConversationMutation.mutateAsync,
    clearChat,
    setMessages
  };
};
