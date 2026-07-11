import { useState, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { User, Mail, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import { useForum } from '@/hooks/useForum';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, signOut, isLoading, updateAvatar } = useAuth();
  const { scans } = useScans();
  const { posts } = useForum();
  const navigate = useNavigate();
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const healthyCount = scans.filter(s => s.disease_detected.toLowerCase().includes('healthy')).length;
  const myPosts = posts.filter(post => post.user_id === user?.id);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { error } = await updateAvatar(file);
      if (error) throw error;
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to update profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="p-4 pb-24 min-h-[80vh] flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
            <User className="w-10 h-10 opacity-50" />
          </div>
          <h2 className="text-xl font-bold mb-2">Not Signed In</h2>
          <p className="text-muted-foreground text-center mb-6">Sign in to view your profile details, scans, and posts.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 pb-24 min-h-[80vh]">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="space-y-6">
          {/* Main User Card */}
          <div className="flex flex-col items-center p-6 bg-card rounded-2xl border border-border shadow-sm">
            <div 
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-background shadow-xl overflow-hidden relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
              
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <h2 className="text-2xl font-bold text-foreground mb-1">
              {user.full_name || 'Farmer'}
            </h2>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5 mb-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>

          <h3 className="font-bold text-lg mt-8 mb-4">Your Activity Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
              <p className="text-3xl font-black text-primary">{scans.length}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Scans</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
              <p className="text-3xl font-black text-success">{healthyCount}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Healthy</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
              <p className="text-3xl font-black text-blue-500">{myPosts.length}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Posts</p>
            </div>
          </div>
          
          <div className="bg-card/50 rounded-xl p-6 border border-border text-center shadow-sm mt-4">
            <p className="text-muted-foreground text-sm">More profile details can be added here in the future.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
