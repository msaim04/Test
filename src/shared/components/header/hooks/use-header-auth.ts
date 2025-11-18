/**
 * Header Auth Hook
 * Optimized hook for header authentication state with caching
 * DRY: Centralized header auth logic with memoization
 * Performance: Caches user data computations to prevent unnecessary recalculations
 */

import { useMemo } from 'react';

interface HeaderUserData {
  userName: string | null;
  userEmail: string;
  userInitials: string;
}

/**
 * Get user name from user object with priority order
 * Cached to prevent unnecessary recalculations
 * 
 * Priority order:
 * 1. username - Specific username field (highest priority for manual signup/login)
 * 2. name - Full name field (from social login or other sources)
 * 3. first_name + last_name - Combined name from manual signup
 * 
 * IMPORTANT: Does NOT fall back to email prefix to avoid showing email in both username and email fields
 */
export function getUserName(user: Record<string, unknown> | null): string | null {
  if (!user) return null;
  
  // Debug: Log user object in development
  if (process.env.NODE_ENV === 'development') {
    console.log('getUserName - User object keys:', Object.keys(user));
    console.log('getUserName - User object:', user);
  }
  
  // Priority 1: Try username field first (specific username from manual signup/login)
  if (user.username && typeof user.username === 'string' && user.username.trim()) {
    const username = user.username.trim();
    if (process.env.NODE_ENV === 'development') {
      console.log('getUserName - Found username field:', username);
    }
    return username;
  }
  
  // Priority 2: Try name field (full name from social login or other sources)
  if (user.name && typeof user.name === 'string' && user.name.trim()) {
    const name = user.name.trim();
    if (process.env.NODE_ENV === 'development') {
      console.log('getUserName - Found name field:', name);
    }
    return name;
  }
  
  // Priority 3: Try first_name and last_name (from manual signup)
  const firstName = user.first_name;
  const lastName = user.last_name;
  if (firstName || lastName) {
    const parts = [
      typeof firstName === 'string' ? firstName.trim() : '',
      typeof lastName === 'string' ? lastName.trim() : ''
    ].filter(Boolean);
    if (parts.length > 0) {
      const fullName = parts.join(' ');
      if (process.env.NODE_ENV === 'development') {
        console.log('getUserName - Found first_name/last_name:', fullName);
      }
      return fullName;
    }
  }
  
  // Debug: Log when no name is found
  if (process.env.NODE_ENV === 'development') {
    console.log('getUserName - No name found in user object');
  }
  
  // Don't fall back to email prefix - return null so we can show email separately
  // This prevents both username and email from showing email-related content
  return null;
}

/**
 * Header Auth Hook
 * Provides optimized, cached user data for header components
 * 
 * Features:
 * - Memoized user data computations
 * - Cached user name, email, and initials
 * - Prevents unnecessary recalculations on re-renders
 * 
 * @param user - User object from auth state
 */
export function useHeaderAuth(user: Record<string, unknown> | null): HeaderUserData {
  // Memoize user data computations to prevent recalculation
  const headerUserData = useMemo<HeaderUserData>(() => {
    const userObj = user || null;
    const userName = getUserName(userObj);
    const userEmail = (typeof userObj?.email === 'string' ? userObj.email : '') || '';
    
    // Get initials from userName if available, otherwise from email, otherwise 'U'
    let userInitials = 'U';
    if (userName) {
      userInitials = userName.charAt(0).toUpperCase();
    } else if (userEmail) {
      userInitials = userEmail.charAt(0).toUpperCase();
    }
    
    return {
      userName,
      userEmail,
      userInitials,
    };
  }, [user]);
  
  return headerUserData;
}

