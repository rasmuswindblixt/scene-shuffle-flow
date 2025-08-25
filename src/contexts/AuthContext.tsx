import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscribed: boolean;
  exportCount: number;
  trialStatus: 'active' | 'expired' | 'converted';
  subscriptionStatus: 'none' | 'active' | 'cancelled' | 'past_due';
  remainingExports: number;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkSubscription: (sessionParam?: Session | null) => Promise<void>;
  checkSubscriptionDirect: (sessionParam?: Session | null) => Promise<void>;
  updateExportCount: (count: number) => void;
  refreshTrialStatus: () => Promise<void>;
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
  const [exportCount, setExportCount] = useState(0);
  const [trialStatus, setTrialStatus] = useState<'active' | 'expired' | 'converted'>('active');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'none' | 'active' | 'cancelled' | 'past_due'>('none');
  const [remainingExports, setRemainingExports] = useState(3);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(getInitialTier());
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authListenerActive, setAuthListenerActive] = useState(true);
  const [permanentlyInitialized, setPermanentlyInitialized] = useState(false);

  // Priority effect: Handle test users if flags are set
  React.useEffect(() => {
    if (isDev && typeof window !== 'undefined') {
      const testUser1Active = window.localStorage.getItem(TEST_USER_KEY) === '1';
      const testUser2Active = window.localStorage.getItem(TEST_USER_2_KEY) === '1';
      
      if (testUser1Active) {
        setUser(TEST_USER as any);
        setSubscribed(true);
        setSubscriptionTier('premium');
        setExportCount(0);
        setTrialStatus('converted');
        setSubscriptionStatus('active');
        setRemainingExports(-1); // Unlimited for paid users
        setSession(null);
        setLoading(false);
      } else if (testUser2Active) {
        setUser(TEST_USER_2 as any);
        setSubscribed(true); // FULL ACCESS - admin_2 now has premium subscription
        setSubscriptionTier('premium'); // FULL ACCESS - admin_2 now has premium tier
        setExportCount(0);
        setTrialStatus('converted');
        setSubscriptionStatus('active');
        setRemainingExports(-1); // Unlimited for paid users
        setSession(null);
        setLoading(false);
      }
    }
  }, []);

  const checkSubscription = async (sessionParam?: Session | null, retryCount = 0) => {
    console.log('[AUTH] checkSubscription called, retry count:', retryCount, 'initialized:', isInitialized);
    
    // Skip if user is permanently initialized (prevents tab switch calls)
    if (permanentlyInitialized) {
      console.log('[AUTH] User permanently initialized, skipping subscription check');
      return;
    }
    
    // Skip if any test user is active
    if (isDev && typeof window !== 'undefined' && 
        (window.localStorage.getItem(TEST_USER_KEY) === '1' || 
         window.localStorage.getItem(TEST_USER_2_KEY) === '1')) {
      console.log('[AUTH] Skipping subscription check - test user active');
      return;
    }
    
    // Get current session directly from Supabase instead of relying on state
    let currentSession = sessionParam;
    if (!currentSession) {
      console.log('[AUTH] No session parameter, getting fresh session from Supabase...');
      const { data: { session: freshSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[AUTH] Error getting fresh session:', error);
        return;
      }
      currentSession = freshSession;
    }
    
    console.log('[AUTH] Using session exists:', !!currentSession);
    console.log('[AUTH] Current user email:', currentSession?.user?.email);
    
    if (!currentSession?.user?.email) {
      // If no session and retry count is less than 3, wait and retry
      if (retryCount < 3) {
        console.log('[AUTH] No session available, will retry in 1000ms...');
        setTimeout(() => {
          checkSubscription(null, retryCount + 1);
        }, 1000);
        return;
      }
      console.log('[AUTH] No session or user email available after retries');
      return;
    }
    
    // Temporarily bypass edge function and use direct fallback
    console.log('[AUTH] Bypassing edge function, using direct fallback for now');
    await checkSubscriptionDirect(currentSession);
    
    // Ensure loading is set to false after subscription check
    setLoading(false);
  };

  const checkSubscriptionDirect = async (sessionParam?: Session | null) => {
    console.log('[AUTH] Setting immediate defaults to unblock UI, loading subscription data in background');
    
    const currentSession = sessionParam || session;
    if (!currentSession?.user?.email) {
      console.log('[AUTH] No session in fallback, setting defaults');
      setSubscribed(false);
      setExportCount(0);
      setTrialStatus('active');
      setSubscriptionStatus('none');
      setRemainingExports(3);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    // Set immediate trial defaults to unblock UI
    setSubscribed(false);
    setExportCount(0);
    setTrialStatus('active');
    setSubscriptionStatus('none');
    setRemainingExports(3);
    setSubscriptionTier(null);
    setSubscriptionEnd(null);
    setLoading(false);

    // Load real subscription data in background (non-blocking)
    setTimeout(async () => {
      try {
        console.log('[AUTH] Background: Checking database for user subscription status:', currentSession.user.email);
        
        const { data: subscriber, error } = await supabase
          .from("subscribers")
          .select("*")
          .eq("email", currentSession.user.email)
          .maybeSingle();

        if (subscriber && !error) {
          console.log('[AUTH] Background: Found subscriber data:', subscriber);
          const usedExports = subscriber.free_exports_used || 0;
          const isSubscribed = subscriber.subscribed || false;
          
          if (isSubscribed) {
            // Premium user - update to premium status
            console.log('[AUTH] Background: User is premium subscriber');
            setSubscribed(true);
            setExportCount(-1); // Unlimited for premium
            setTrialStatus('converted');
            setSubscriptionStatus('active');
            setRemainingExports(-1); // Unlimited
            setSubscriptionTier('Premium');
            setSubscriptionEnd(subscriber.subscription_end);
          } else {
            // Free trial user - update with actual usage
            console.log('[AUTH] Background: User is on free trial with', usedExports, 'exports used');
            setSubscribed(false);
            setExportCount(usedExports);
            setTrialStatus(usedExports >= 3 ? 'expired' : 'active');
            setSubscriptionStatus('none');
            setRemainingExports(Math.max(0, 3 - usedExports));
            setSubscriptionTier(null);
            setSubscriptionEnd(null);
          }
        } else {
          console.log('[AUTH] Background: No subscriber data found or error:', error);
        }
      } catch (error) {
        console.error('[AUTH] Background: Error checking subscription status:', error);
      }
    }, 100);
  };

  const updateExportCount = (count: number) => {
    console.log('[AUTH] updateExportCount called with count:', count);
    console.log('[AUTH] Current exportCount before update:', exportCount);
    setExportCount(count);
    
    // Update remaining exports and trial status
    const remaining = subscribed ? -1 : Math.max(0, 3 - count);
    setRemainingExports(remaining);
    
    // Update trial status if needed
    if (!subscribed && count >= 3 && trialStatus === 'active') {
      console.log('[AUTH] Setting trial status to expired after reaching limit');
      setTrialStatus('expired');
    }
    
    console.log('[AUTH] Updated exportCount:', count, 'remainingExports:', remaining, 'trialStatus:', count >= 3 ? 'expired' : trialStatus);
  };

  const refreshTrialStatus = async () => {
    if (session?.user) {
      await checkSubscription(session);
    }
  };

  // Throttling is now handled in the auth state listener above

  useEffect(() => {
    setLoading(true);
    // Skip Supabase session if any test user is active
    if (isDev && typeof window !== 'undefined' && 
        (window.localStorage.getItem(TEST_USER_KEY) === '1' || 
         window.localStorage.getItem(TEST_USER_2_KEY) === '1')) {
      setLoading(false);
      setIsInitialized(true);
      setPermanentlyInitialized(true);
      setAuthListenerActive(false);
      return;
    }
    
    console.log('[AUTH] useEffect running. Initializing AuthContext.');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] Auth state changed:', event, 'session exists:', !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('[AUTH] User logged in, checking subscription...');
          setLoading(true);
          try {
            await checkSubscription(session);
          } catch (error) {
            console.error('[AUTH] Error checking subscription:', error);
          } finally {
            setLoading(false);
            setIsInitialized(true);
          }
        } else {
          console.log('[AUTH] No user session, resetting state');
          setSubscribed(false);
          setExportCount(0);
          setTrialStatus('active');
          setSubscriptionStatus('none');
          setRemainingExports(3);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
          setLoading(false);
          setIsInitialized(true);
        }
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[AUTH] Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('[AUTH] Initial session has user, checking subscription...');
        setLoading(true);
        try {
          await checkSubscription(session);
        } catch (error) {
          console.error('[AUTH] Error checking initial subscription:', error);
        } finally {
          setLoading(false);
          setIsInitialized(true);
        }
      } else {
        console.log('[AUTH] No initial session found');
        setLoading(false);
        setIsInitialized(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Note: Subscription checking is now handled in the auth state listener above

  const signIn = async (email: string, password: string) => {
    if (isDev && email === 'admin' && password === 'eqsZvy6d89!') {
      setUser(TEST_USER as any);
      setSubscribed(true);
      setSubscriptionTier('premium');
      setExportCount(0);
      setTrialStatus('converted');
      setSubscriptionStatus('active');
      setRemainingExports(-1);
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
      setExportCount(0);
      setTrialStatus('converted');
      setSubscriptionStatus('active');
      setRemainingExports(-1);
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
        setExportCount(0);
        setTrialStatus('active');
        setSubscriptionStatus('none');
        setRemainingExports(3);
        setSession(null);
        setIsInitialized(true);
        setLoading(false);
        return;
      }
    }
    
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    subscribed,
    exportCount,
    trialStatus,
    subscriptionStatus,
    remainingExports,
    subscriptionTier,
    subscriptionEnd,
    loading,
    signIn,
    signUp,
    signOut,
    checkSubscription,
    checkSubscriptionDirect,
    updateExportCount,
    refreshTrialStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};