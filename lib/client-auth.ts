"use client"

import { Session } from './auth';

// Add import for auth-utils
import { getCurrentUser, isUserLoggedIn } from './auth-utils';

// Check client-side session status
export async function checkClientSession(): Promise<Session | null> {
  try {
    // First try server-side session
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.session?.user) {
        console.log('Found server-side session');
        return data.session;
      }
    }
    
    // If server session not found, check localStorage
    console.log('Checking localStorage authentication');
    if (isUserLoggedIn()) {
      const user = getCurrentUser();
      if (user) {
        console.log('Found localStorage user session');
        // Convert localStorage user to Session format
        return { 
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
            enrolledCourseIds: user.enrolledCourseIds
          }
        };
      }
    }
    
    console.log('No authentication found');
    return null;
  } catch (error) {
    console.error('Error checking client session:', error);
    return null;
  }
} 