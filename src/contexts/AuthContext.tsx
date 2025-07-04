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
  checkSubscription: () => Promise<void>;
  checkSubscriptionDirect: () => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [freeExportsUsed, setFreeExportsUsed] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!session) return;
    
    try {
      // Try the edge function first
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription via edge function:', error);
        // Fallback to direct database query
        return await checkSubscriptionDirect();
      }

      console.log('Subscription check result:', data);
      setSubscribed(data.subscribed || false);
      setFreeExportsUsed(data.free_exports_used || 0);
      setSubscriptionTier(data.subscription_tier);
      setSubscriptionEnd(data.subscription_end);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Fallback to direct database query
      await checkSubscriptionDirect();
    }
  };

  const checkSubscriptionDirect = async () => {
    if (!session?.user?.email) return;
    
    try {
      console.log('Checking subscription directly from database for:', session.user.email);
      const { data: subscriber, error } = await supabase
        .from("subscribers")
        .select("*")
        .eq("email", session.user.email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscriber directly:', error);
        return;
      }

      console.log('Direct database subscription result:', subscriber);
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
      console.error('Error in direct subscription check:', error);
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
    console.log('[AUTH] useEffect running. Initializing AuthContext.');
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setLoading(true);
          checkSubscription().finally(() => setLoading(false));
        } else {
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
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        checkSubscription().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
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