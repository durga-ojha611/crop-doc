import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowLeft, Save, Loader2, Globe, Mail, CheckCircle, AlertCircle, Lock, Link2, Unlink, MapPin, User, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ProfileData {
  full_name: string;
  phone: string;
  location_district: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isEmailVerified, updateEmail, updatePassword, linkedProviders, linkProvider, unlinkProvider, updateProfile, updateAvatar } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    location_district: '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setProfile({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        location_district: user?.location_district || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
      setNewEmail(user.email || '');
    }
  }, [user, authLoading, navigate, fetchProfile]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        location_district: profile.location_district,
      });

      if (error) throw error;

      toast.success(t('profileUpdated') || 'Profile updated successfully');
      // No need to navigate away, users might want to change other settings
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : t('failedToUpdate');
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || newEmail === user?.email) return;

    setIsChangingEmail(true);
    try {
      const { error } = await updateEmail(newEmail);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification email sent to your new address. Please confirm both emails to complete the change.');
      }
    } catch (error) {
      toast.error('Failed to update email');
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  // Check if user signed in with OAuth
  const isOAuthUser = user?.app_metadata?.providers?.some((p: string) => p !== 'email');
  const isGoogleLinked = linkedProviders.includes('google');
  // const hasEmailIdentity = linkedProviders.includes('password');
  const canUnlinkGoogle = isGoogleLinked && linkedProviders.length > 1;

  const handleLinkGoogle = async () => {
    setIsLinkingGoogle(true);
    try {
      const { error } = await linkProvider('google');
      if (error) {
        toast.error(error.message);
      }
      // User will be redirected to Google for OAuth
    } catch (error) {
      toast.error('Failed to link Google account');
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!canUnlinkGoogle) {
      toast.error('You need at least one login method. Add a password before unlinking Google.');
      return;
    }

    setIsLinkingGoogle(true);
    try {
      const { error } = await unlinkProvider('google.com');
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Google account unlinked successfully');
      }
    } catch (error) {
      toast.error('Failed to unlink Google account');
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Use OpenStreetMap Nominatim for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );

          if (!response.ok) throw new Error('Failed to fetch location data');

          const data = await response.json();

          const city = data.address.city || data.address.town || data.address.village || data.address.state_district;
          const state = data.address.state;
          const formattedLocation = [city, state].filter(Boolean).join(', ');

          setProfile(prev => ({
            ...prev,
            location_district: formattedLocation || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
          toast.success('Location updated');
        } catch (error) {
          console.error('Error getting location:', error);
          toast.error('Failed to get address details');
          // Fallback to coordinates
          setProfile(prev => ({
            ...prev,
            location_district: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          }));
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Failed to get location';
        if (error.code === 1) errorMessage = 'Location permission denied';
        else if (error.code === 2) errorMessage = 'Location unavailable';
        else if (error.code === 3) errorMessage = 'Location request timed out';

        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
    } catch (error: unknown) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile picture';
      toast.error(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('settings')}</h1>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border shadow-sm">
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-xl overflow-hidden relative">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
                
                {/* Upload overlay */}
                <div 
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? 'Uploading...' : 'Change Profile Picture'}
            </Button>
          </div>

          <Separator />

          {/* Email Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Label className="text-base font-semibold">Email Address</Label>
            </div>

            {/* Current email status */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Current:</span>
              <span className="text-sm font-medium">{user?.email}</span>
              {isEmailVerified ? (
                <span className="flex items-center gap-1 text-xs text-success ml-auto">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-warning ml-auto">
                  <AlertCircle className="w-3 h-3" />
                  Unverified
                </span>
              )}
            </div>

            {/* Email change form */}
            {isOAuthUser ? (
              <p className="text-sm text-muted-foreground">
                Email is managed by your provider account and cannot be changed here.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new_email">New Email Address</Label>
                  <Input
                    id="new_email"
                    type="email"
                    placeholder="Enter new email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailChange}
                  disabled={isChangingEmail || newEmail === user?.email || !newEmail}
                >
                  {isChangingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending verification...
                    </>
                  ) : (
                    'Change Email'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You'll need to verify both your old and new email addresses to complete the change.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Password Section */}
          {!isOAuthUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Change Password</Label>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long.
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Connected Accounts Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <Label className="text-base font-semibold">Connected Accounts</Label>
            </div>

            {/* Google Account */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <div>
                  <p className="text-sm font-medium">Google</p>
                  {isGoogleLinked ? (
                    <p className="text-xs text-muted-foreground">Connected</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>

              {isGoogleLinked ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnlinkGoogle}
                  disabled={isLinkingGoogle || !canUnlinkGoogle}
                  className="text-destructive hover:text-destructive"
                >
                  {isLinkingGoogle ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Unlink className="w-4 h-4 mr-1" />
                      Unlink
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLinkGoogle}
                  disabled={isLinkingGoogle}
                >
                  {isLinkingGoogle ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-1" />
                      Link
                    </>
                  )}
                </Button>
              )}
            </div>

            {isGoogleLinked && !canUnlinkGoogle && (
              <p className="text-xs text-muted-foreground">
                To unlink Google, first add a password to your account using the password section above.
              </p>
            )}
          </div>

          <Separator />

          {/* Language Selector */}
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('language')}
            </Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.nativeName}</span>
                      <span className="text-muted-foreground text-sm">({lang.name})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{t('selectLanguage')}</p>
          </div>

          <Separator />

          {/* Profile fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('fullName')}</Label>
              <Input
                id="full_name"
                placeholder={t('enterFullName')}
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneNumber')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('enterPhone')}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="location_district">{t('locationDistrict')}</Label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="text-xs text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  {isGettingLocation ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <MapPin className="w-3 h-3" />
                  )}
                  {isGettingLocation ? 'Locating...' : 'Use Current Location'}
                </button>
              </div>
              <Input
                id="location_district"
                placeholder={t('enterLocation')}
                value={profile.location_district}
                onChange={(e) => setProfile({ ...profile, location_district: e.target.value })}
              />
            </div>
          </div>

          <Button
            className="w-full touch-target"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {t('save')}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
