import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscribed: boolean;
  freeExportsUsed: number;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkSubscription: (sessionParam?: Session | null) => Promise<void>;
  checkSubscriptionDirect: (sessionParam?: Session | null) => Promise<void>;
  updateFreeExportsUsed: (count: number) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const TEST_USER = {
  email: 'admin',
  id: 'dev-admin',
};
const TEST_USER_2 = {
  email: 'admin_2',
  id: 'dev-admin-2',
};
const TEST_USER_KEY = 'dev_test_user_active';
const TEST_USER_2_KEY = 'dev_test_user_2_active';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check localStorage for test users on initialization
  const initialTestUser = isDev && typeof window !== 'undefined' && window.localStorage.getItem(TEST_USER_KEY) === '1';
  const initialTestUser2 = isDev && typeof window !== 'undefined' && window.localStorage.getItem(TEST_USER_2_KEY) === '1';
  
  // Determine initial user and subscription status
  const getInitialUser = () => {
    if (initialTestUser) return TEST_USER as any;
    if (initialTestUser2) return TEST_USER_2 as any;
    return null;
  };
  
  const getInitialSubscription = () => {
    if (initialTestUser) return true; // admin is premium
    if (initialTestUser2) return true; // admin_2 is now also premium (FULL ACCESS)
    return false;
  };
  
  const getInitialTier = () => {
    if (initialTestUser) return 'premium'; // admin is premium
    if (initialTestUser2) return 'premium'; // admin_2 is now also premium (FULL ACCESS)
    return null;
  };

  const [user, setUser] = useState<User | null>(getInitialUser());
  const [session, setSession] = useState<Session | null>(null);
  const [subscribed, setSubscribed] = useState(getInitialSubscription());
  const [freeExportsUsed, setFreeExportsUsed] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(getInitialTier());
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Priority effect: Handle test users if flags are set
  React.useEffect(() => {
    if (isDev && typeof window !== 'undefined') {
      const testUser1Active = window.localStorage.getItem(TEST_USER_KEY) === '1';
      const testUser2Active = window.localStorage.getItem(TEST_USER_2_KEY) === '1';
      
      if (testUser1Active) {
        setUser(TEST_USER as any);
        setSubscribed(true);
        setSubscriptionTier('premium');
        setFreeExportsUsed(0);
        setSession(null);
        setLoading(false);
      } else if (testUser2Active) {
        setUser(TEST_USER_2 as any);
        setSubscribed(true); // FULL ACCESS - admin_2 now has premium subscription
        setSubscriptionTier('premium'); // FULL ACCESS - admin_2 now has premium tier
        setFreeExportsUsed(0);
        setSession(null);
        setLoading(false);
      }
    }
  }, []);

  const checkSubscription = async (sessionParam?: Session | null, retryCount = 0) => {
    // Use the passed session or fall back to state
    const currentSession = sessionParam || session;
    console.log('[AUTH] checkSubscription called, session exists:', !!currentSession);
    console.log('[AUTH] Current user email:', currentSession?.user?.email);
    console.log('[AUTH] Retry count:', retryCount);
    
    // Skip if any test user is active
    if (isDev && typeof window !== 'undefined' && 
        (window.localStorage.getItem(TEST_USER_KEY) === '1' || 
         window.localStorage.getItem(TEST_USER_2_KEY) === '1')) {
      console.log('[AUTH] Skipping subscription check - test user active');
      return;
    }
    
    if (!currentSession?.user?.email) {
      // If no session and retry count is less than 3, wait and retry
      if (retryCount < 3) {
        console.log('[AUTH] No session available, will retry in 500ms...');
        setTimeout(() => {
          checkSubscription(sessionParam, retryCount + 1);
        }, 500);
        return;
      }
      console.log('[AUTH] No session or user email available after retries');
      return;
    }
    
    try {
      console.log('[AUTH] Attempting subscription check via edge function');
      // Try the edge function first
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (error) {
        console.error('[AUTH] Error checking subscription via edge function:', error);
        // Fallback to direct database query
        return await checkSubscriptionDirect(currentSession);
      }

      console.log('[AUTH] Subscription check result:', data);
      setSubscribed(data.subscribed || false);
      setFreeExportsUsed(data.free_exports_used || 0);
      setSubscriptionTier(data.subscription_tier);
      setSubscriptionEnd(data.subscription_end);
    } catch (error) {
      console.error('[AUTH] Error checking subscription:', error);
      // Fallback to direct database query
      await checkSubscriptionDirect(currentSession);
    }
  };

  const checkSubscriptionDirect = async (sessionParam?: Session | null) => {
    const currentSession = sessionParam || session;
    if (!currentSession?.user?.email) return;
    
    try {
      console.log('[AUTH] Checking subscription directly from database for:', currentSession.user.email);
      const { data: subscriber, error } = await supabase
        .from("subscribers")
        .select("*")
        .eq("email", currentSession.user.email)
        .maybeSingle();

      if (error) {
        console.error('[AUTH] Error fetching subscriber directly:', error);
        return;
      }

      console.log('[AUTH] Direct database subscription result:', subscriber);
      if (subscriber) {
        setSubscribed(subscriber.subscribed || false);
        setFreeExportsUsed(subscriber.free_exports_used || 0);
        setSubscriptionTier(subscriber.subscription_tier);
        setSubscriptionEnd(subscriber.subscription_end);
      } else {
        // No record found, set defaults
        setSubscribed(false);
        setFreeExportsUsed(0);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
      }
    } catch (error) {
      console.error('[AUTH] Error in direct subscription check:', error);
    }
  };

  const updateFreeExportsUsed = (count: number) => {
    console.log('[AUTH] updateFreeExportsUsed called with count:', count);
    console.log('[AUTH] Current freeExportsUsed before update:', freeExportsUsed);
    setFreeExportsUsed(count);
    console.log('[AUTH] setFreeExportsUsed called with:', count);
  };

  useEffect(() => {
    setLoading(true);
    // Skip Supabase session if any test user is active
    if (isDev && typeof window !== 'undefined' && 
        (window.localStorage.getItem(TEST_USER_KEY) === '1' || 
         window.localStorage.getItem(TEST_USER_2_KEY) === '1')) {
      setLoading(false);
      return;
    }
    console.log('[AUTH] useEffect running. Initializing AuthContext.');
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AUTH] Auth state changed:', event, 'session exists:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('[AUTH] User logged in, will check subscription...');
          setLoading(true);
          // Use setTimeout to avoid blocking the auth flow
          setTimeout(() => {
            checkSubscription(session).finally(() => setLoading(false));
          }, 100);
        } else {
          console.log('[AUTH] No user session, resetting subscription state');
          setSubscribed(false);
          setFreeExportsUsed(0);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('[AUTH] Initial session has user, will check subscription...');
        setLoading(true);
        // Use setTimeout to avoid race conditions
        setTimeout(() => {
          checkSubscription(session).finally(() => setLoading(false));
        }, 100);
      } else {
        console.log('[AUTH] No initial session found');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Separate effect to check subscription when session becomes available
  useEffect(() => {
    if (session?.user?.email && !loading) {
      console.log('[AUTH] Session available, triggering subscription check for:', session.user.email);
      checkSubscription(session);
    }
  }, [session?.user?.email]);

  const signIn = async (email: string, password: string) => {
    if (isDev && email === 'admin' && password === 'eqsZvy6d89!') {
      setUser(TEST_USER as any);
      setSubscribed(true);
      setSubscriptionTier('premium');
      setFreeExportsUsed(0);
      setSession(null);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TEST_USER_KEY, '1');
      }
      return { error: null };
    }
    
    if (isDev && email === 'admin_2' && password === 'eqsZvy6d89!') {
      setUser(TEST_USER_2 as any);
      setSubscribed(true); // FULL ACCESS - admin_2 now has premium subscription
      setSubscriptionTier('premium'); // FULL ACCESS - admin_2 now has premium tier
      setFreeExportsUsed(0);
      setSession(null);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TEST_USER_2_KEY, '1');
      }
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/app`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    if (isDev && typeof window !== 'undefined') {
      const testUser1Active = window.localStorage.getItem(TEST_USER_KEY) === '1';
      const testUser2Active = window.localStorage.getItem(TEST_USER_2_KEY) === '1';
      
      if (testUser1Active || testUser2Active) {
        window.localStorage.removeItem(TEST_USER_KEY);
        window.localStorage.removeItem(TEST_USER_2_KEY);
        setUser(null);
        setSubscribed(false);
        setSubscriptionTier(null);
        setFreeExportsUsed(0);
        setSession(null);
        return;
      }
    }
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    subscribed,
    freeExportsUsed,
    subscriptionTier,
    subscriptionEnd,
    loading,
    signIn,
    signUp,
    signOut,
    checkSubscription,
    checkSubscriptionDirect,
    updateFreeExportsUsed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};