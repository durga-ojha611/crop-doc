import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  crop_type: string | null;
  created_at: string;
  updated_at: string;
  author_name: string | null;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_expert_answer: boolean;
  created_at: string;
  author_name: string | null;
}

const API_URL = 'http://localhost:5001/api';

export const useForum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/forum/posts`, { headers });
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      
      // Map _id to id if coming from mongo
      const formattedPosts = data.map((d: any) => ({ ...d, id: d._id || d.id, user_id: d.author_id }));
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    // In a real app we'd poll or use websockets here instead of onSnapshot
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const createPost = async (postData: { title: string; content: string; crop_type?: string; image?: File | null }): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to post');
      return false;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      if (postData.crop_type) formData.append('crop_type', postData.crop_type);
      if (postData.image) formData.append('image', postData.image);

      const res = await fetch(`${API_URL}/forum/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create post');
      
      await fetchPosts();
      toast.success('Post created successfully!');
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/forum/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleLike = async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
    if (!user) {
      toast.error('Sign in to like posts');
      return;
    }

    try {
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            user_has_liked: !hasLiked,
            likes_count: p.likes_count + (hasLiked ? -1 : 1)
          };
        }
        return p;
      }));

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hasLiked: !hasLiked })
      });
      
      if (!res.ok) throw new Error('Failed to toggle like');
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      fetchPosts();
    }
  };

  const editPost = async (postId: string, updates: { title: string; content: string; crop_type?: string; image?: File | null; current_image_url?: string | null }) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', updates.title);
      formData.append('content', updates.content);
      if (updates.crop_type) formData.append('crop_type', updates.crop_type);
      if (updates.image) formData.append('image', updates.image);
      if (updates.current_image_url) formData.append('current_image_url', updates.current_image_url);

      const res = await fetch(`${API_URL}/forum/posts/${postId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update post');
      
      await fetchPosts();
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
      throw error;
    }
  };

  return {
    posts,
    isLoading,
    createPost,
    isCreating,
    deletePost,
    isDeleting,
    toggleLike,
    editPost
  };
};

export const useForumComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/forum/posts/${postId}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      const formattedComments = data.map((d: any) => ({ ...d, id: d._id || d.id, user_id: d.author_id }));
      setComments(formattedComments);
    } catch (error) {
      console.error('Error loading comments', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const createComment = async (content: string) => {
    if (!user) {
      toast.error('Sign in to comment');
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!res.ok) throw new Error('Failed to add comment');
      
      await fetchComments();
      toast.success('Comment added');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/forum/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete comment');

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return {
    comments,
    isLoading,
    createComment,
    deleteComment,
    isCreating
  };
};