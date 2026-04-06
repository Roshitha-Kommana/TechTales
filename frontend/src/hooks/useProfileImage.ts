import { useState, useEffect } from 'react';

export const useProfileImage = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Initial load
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // Listen for custom event for same-window updates
    const handleProfileUpdate = () => {
      const updatedImage = localStorage.getItem('profileImage');
      setProfileImage(updatedImage);
    };

    window.addEventListener('profileImageUpdated', handleProfileUpdate);
    
    // Listen for storage event for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileImage') {
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
    if (newImage) {
      localStorage.setItem('profileImage', newImage);
    } else {
      localStorage.removeItem('profileImage');
    }
    setProfileImage(newImage);
    // Dispatch event so other components in the same window update instantly
    window.dispatchEvent(new Event('profileImageUpdated'));
  };

  return { profileImage, updateProfileImage };
};
