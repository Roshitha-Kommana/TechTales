import { useState, useEffect } from 'react';
import { authApi } from '../services/auth';

export const useProfileImage = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const user = authApi.getUser();
    const storageKey = user ? `profileImage_${user.id}` : 'profileImage';

    // Initial load
    const savedImage = localStorage.getItem(storageKey);
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // Listen for custom event for same-window updates
    const handleProfileUpdate = () => {
      const currentUser = authApi.getUser();
      const currentKey = currentUser ? `profileImage_${currentUser.id}` : 'profileImage';
      const updatedImage = localStorage.getItem(currentKey);
      setProfileImage(updatedImage);
    };

    window.addEventListener('profileImageUpdated', handleProfileUpdate);
    
    // Listen for storage event for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      const currentUser = authApi.getUser();
      const currentKey = currentUser ? `profileImage_${currentUser.id}` : 'profileImage';
      if (e.key === currentKey) {
        setProfileImage(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateProfileImage = (newImage: string | null) => {
    const user = authApi.getUser();
    const storageKey = user ? `profileImage_${user.id}` : 'profileImage';

    if (newImage) {
      localStorage.setItem(storageKey, newImage);
    } else {
      localStorage.removeItem(storageKey);
    }
    setProfileImage(newImage);
    // Dispatch event so other components in the same window update instantly
    window.dispatchEvent(new Event('profileImageUpdated'));
  };

  return { profileImage, updateProfileImage };
};
