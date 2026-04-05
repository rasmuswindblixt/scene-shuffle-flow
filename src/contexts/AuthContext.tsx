import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscribed: boolean;
  subscriptionStatus: 'none' | 'active' | 'cancelled' | 'past_due';
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<void>;
  checkSubscription: (sessionParam?: Session | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Complimentary premium accounts — treated identically to Stripe subscribers
const COMPLIMENTARY_PREMIUM_EMAILS = ['pptskolan@gmail.com'];

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

  const getInitialUser = () => {
    if (initialTestUser) return TEST_USER as any;
    if (initialTestUser2) return TEST_USER_2 as any;
    return null;
  };

  const getInitialSubscription = () => {
    if (initialTestUser || initialTestUser2) return true;
    return false;
  };

  const getInitialTier = () => {
    if (initialTestUser || initialTestUser2) return 'premium';
    return null;
  };

  const [user, setUser] = useState<User | null>(getInitialUser());
  const [session, setSession] = useState<Session | null>(null);
  const [subscribed, setSubscribed] = useState(getInitialSubscription());
  const [subscriptionStatus, setSubscriptionStatus] = useState<'none' | 'active' | 'cancelled' | 'past_due'>(
    getInitialSubscription() ? 'active' : 'none'
  );
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(getInitialTier());
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
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
        setSubscriptionStatus('active');
        setSession(null);
        setLoading(false);
      } else if (testUser2Active) {
        setUser(TEST_USER_2 as any);
        setSubscribed(true);
        setSubscriptionTier('premium');
        setSubscriptionStatus('active');
        setSession(null);
        setLoading(false);
      }
    }
  }, []);

  const setPremiumState = (end?: string | null) => {
    setSubscribed(true);
    setSubscriptionStatus('active');
    setSubscriptionTier('Premium');
    setSubscriptionEnd(end ?? null);
  };

  const setFreeState = () => {
    setSubscribed(false);
    setSubscriptionStatus('none');
    setSubscriptionTier(null);
    setSubscriptionEnd(null);
  };

  const checkSubscription = async (sessionParam?: Session | null, retryCount = 0) => {
    console.log('[AUTH] checkSubscription called, retry count:', retryCount);

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

    let currentSession = sessionParam;
    if (!currentSession) {
      const { data: { session: freshSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[AUTH] Error getting fresh session:', error);
        return;
      }
      currentSession = freshSession;
    }

    if (!currentSession?.user?.email) {
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

    // Complimentary premium accounts — grant full access immediately
    if (COMPLIMENTARY_PREMIUM_EMAILS.includes(currentSession.user.email.toLowerCase())) {
      console.log('[AUTH] Complimentary premium account detected:', currentSession.user.email);
      setPremiumState();
      setLoading(false);
      return;
    }

    // Set defaults to unblock UI
    setFreeState();
    setLoading(false);

    // Load real subscription data in background (non-blocking)
    const email = currentSession.user.email;
    setTimeout(async () => {
      try {
        console.log('[AUTH] Background: Checking database for subscription:', email);

        const { data: subscriber, error } = await supabase
          .from("subscribers")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (subscriber && !error) {
          if (subscriber.subscribed) {
            console.log('[AUTH] Background: User is premium subscriber');
            setPremiumState(subscriber.subscription_end);
          } else {
            console.log('[AUTH] Background: User is not subscribed');
            setFreeState();
          }
        } else {
          console.log('[AUTH] Background: No subscriber data found or error:', error);
        }
      } catch (error) {
        console.error('[AUTH] Background: Error checking subscription status:', error);
      }
    }, 100);
  };

  useEffect(() => {
    setLoading(true);
    // Skip Supabase session if any test user is active
    if (isDev && typeof window !== 'undefined' &&
        (window.localStorage.getItem(TEST_USER_KEY) === '1' ||
         window.localStorage.getItem(TEST_USER_2_KEY) === '1')) {
      setLoading(false);
      setIsInitialized(true);
      setPermanentlyInitialized(true);
      return;
    }

    console.log('[AUTH] useEffect running. Initializing AuthContext.');

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
          setFreeState();
          setLoading(false);
          setIsInitialized(true);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[AUTH] Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
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
        setLoading(false);
        setIsInitialized(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isDev && email === 'admin' && password === 'eqsZvy6d89!') {
      setUser(TEST_USER as any);
      setSubscribed(true);
      setSubscriptionTier('premium');
      setSubscriptionStatus('active');
      setSession(null);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TEST_USER_KEY, '1');
      }
      return { error: null };
    }

    if (isDev && email === 'admin_2' && password === 'eqsZvy6d89!') {
      setUser(TEST_USER_2 as any);
      setSubscribed(true);
      setSubscriptionTier('premium');
      setSubscriptionStatus('active');
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    if (isDev && typeof window !== 'undefined') {
      const testUser1Active = window.localStorage.getItem(TEST_USER_KEY) === '1';
      const testUser2Active = window.localStorage.getItem(TEST_USER_2_KEY) === '1';

      if (testUser1Active || testUser2Active) {
        window.localStorage.removeItem(TEST_USER_KEY);
        window.localStorage.removeItem(TEST_USER_2_KEY);
        setUser(null);
        setFreeState();
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
    subscriptionStatus,
    subscriptionTier,
    subscriptionEnd,
    loading,
    signIn,
    signUp,
    signOut,
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
