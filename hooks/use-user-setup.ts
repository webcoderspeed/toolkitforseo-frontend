import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function useUserSetup() {
  const { user, isLoaded } = useUser();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user && !isSetupComplete) {
      setupUser();
    }
  }, [isLoaded, user, isSetupComplete]);

  const setupUser = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        }),
      });

      if (response.ok) {
        setIsSetupComplete(true);
        console.log('User setup completed successfully');
      } else {
        console.error('Failed to setup user');
      }
    } catch (error) {
      console.error('Error setting up user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSetupComplete,
    isLoading,
    setupUser,
  };
}