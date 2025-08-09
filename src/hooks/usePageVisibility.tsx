
import { useState, useEffect, useRef } from 'react';

export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(() => {
    // Safe initial state check
    if (typeof document === 'undefined') return true;
    return !document.hidden;
  });
  
  // Track last visibility state to prevent rapid switches
  const lastVisibilityRef = useRef(isVisible);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden;
      
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // If the visibility changed, apply a small debounce to prevent 
      // rapid state changes that can happen during tab switching
      if (newVisibility !== lastVisibilityRef.current) {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(newVisibility);
          lastVisibilityRef.current = newVisibility;
        }, 50); // Small debounce to handle browser quirks
      }
    };

    // Set up the event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus/blur as backup for older browsers
    window.addEventListener('focus', () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!document.hidden) {
          setIsVisible(true);
          lastVisibilityRef.current = true;
        }
      }, 50);
    });
    
    window.addEventListener('blur', () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (document.hidden) {
          setIsVisible(false);
          lastVisibilityRef.current = false;
        }
      }, 50);
    });
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};
