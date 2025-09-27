'use client';

import { useEffect, useState } from 'react';

export interface AuthToken {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuthToken(): AuthToken {
  const [tokenData, setTokenData] = useState<AuthToken>({
    token: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const getToken = () => {
      try {
        // Method 1: Try to get from document.cookie (client-side)
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split('; ');
          const authCookie = cookies.find(row => row.startsWith('auth-token='));
          
          if (authCookie) {
            const token = authCookie.split('=')[1];
            if (token && token !== 'undefined' && token !== 'null') {
              setTokenData({
                token: token,
                isLoading: false,
                error: null,
              });
              return;
            }
          }
        }

        // Method 2: Try localStorage as fallback
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('auth-token');
          if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
            setTokenData({
              token: storedToken,
              isLoading: false,
              error: null,
            });
            return;
          }
        }

        // No token found
        setTokenData({
          token: null,
          isLoading: false,
          error: 'No authentication token found',
        });
      } catch (error) {
        console.error('Error getting auth token:', error);
        setTokenData({
          token: null,
          isLoading: false,
          error: 'Error retrieving authentication token',
        });
      }
    };

    getToken();
  }, []);

  return tokenData;
}

// Utility function to get token synchronously (for use in API calls)
export function getAuthToken(): string | null {
  try {
    // Try cookies first
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split('; ');
      const authCookie = cookies.find(row => row.startsWith('auth-token='));
      
      if (authCookie) {
        const token = authCookie.split('=')[1];
        if (token && token !== 'undefined' && token !== 'null') {
          return token;
        }
      }
    }

    // Try localStorage as fallback
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth-token');
      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        return storedToken;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Function to set token in both cookie and localStorage
export function setAuthToken(token: string): void {
  try {
    // Set in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }

    // Set in cookie
    if (typeof document !== 'undefined') {
      // Set cookie with secure options
      const expires = new Date();
      expires.setTime(expires.getTime() + (60 * 60 * 1000)); // 1 hour
      
      document.cookie = `auth-token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

// Function to clear token
export function clearAuthToken(): void {
  try {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }

    // Clear cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
    }
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}