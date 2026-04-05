import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnboardingData {
  roles: string[];
  niches: string[];
  upload_volume: string | null;
  pain_points: string[];
  goals: string[];
  youtube_goal: string;
  selected_plan: 'monthly' | 'yearly' | null;
}

const EMPTY_DATA: OnboardingData = {
  roles: [],
  niches: [],
  upload_volume: null,
  pain_points: [],
  goals: [],
  youtube_goal: '',
  selected_plan: null,
};

export function useOnboarding() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setDataState] = useState<OnboardingData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [profileExists, setProfileExists] = useState(false);

  const stepParam = searchParams.get('step');
  const currentStep = stepParam !== null ? parseInt(stepParam, 10) : (user ? 1 : 0);

  // Set step in URL
  const setStep = useCallback((step: number) => {
    setSearchParams({ step: String(step) }, { replace: false });
  }, [setSearchParams]);

  // Load existing onboarding data on mount
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('onboarding_profiles' as any)
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile && !error) {
          setProfileExists(true);
          const p = profile as any;
          setDataState({
            roles: p.roles || [],
            niches: p.niches || [],
            upload_volume: p.upload_volume || null,
            pain_points: p.pain_points || [],
            goals: p.goals || [],
            youtube_goal: p.youtube_goal || '',
            selected_plan: p.selected_plan || null,
          });
          // Resume from saved step if no step in URL
          if (stepParam === null && p.current_step > 0) {
            setStep(p.current_step);
          }
        }
      } catch (err) {
        console.error('[ONBOARDING] Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Update data (partial merge)
  const setData = useCallback((partial: Partial<OnboardingData>) => {
    setDataState(prev => ({ ...prev, ...partial }));
  }, []);

  // Save current step data to Supabase
  const saveToDb = useCallback(async (nextStep: number) => {
    if (!user) return;
    setIsSaving(true);

    const payload = {
      user_id: user.id,
      roles: data.roles,
      niches: data.niches,
      upload_volume: data.upload_volume,
      pain_points: data.pain_points,
      goals: data.goals,
      youtube_goal: data.youtube_goal,
      selected_plan: data.selected_plan,
      current_step: nextStep,
      updated_at: new Date().toISOString(),
    };

    try {
      if (profileExists) {
        await supabase
          .from('onboarding_profiles' as any)
          .update(payload as any)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('onboarding_profiles' as any)
          .insert(payload as any);
        setProfileExists(true);
      }
    } catch (err) {
      console.error('[ONBOARDING] Error saving:', err);
    } finally {
      setIsSaving(false);
    }
  }, [user, data, profileExists]);

  // Create profile after account creation (step 0 -> 1)
  const createProfile = useCallback(async (userId: string) => {
    try {
      await supabase
        .from('onboarding_profiles' as any)
        .insert({
          user_id: userId,
          current_step: 1,
          updated_at: new Date().toISOString(),
        } as any);
      setProfileExists(true);
    } catch (err) {
      console.error('[ONBOARDING] Error creating profile:', err);
    }
  }, []);

  // Navigate forward
  const goNext = useCallback(async () => {
    const nextStep = currentStep + 1;
    setDirection('forward');
    if (currentStep >= 1 && currentStep <= 8) {
      await saveToDb(nextStep);
    }
    setStep(nextStep);
  }, [currentStep, saveToDb, setStep]);

  // Navigate backward
  const goBack = useCallback(() => {
    if (currentStep <= 1) return;
    setDirection('backward');
    setStep(currentStep - 1);
  }, [currentStep, setStep]);

  // Mark onboarding as completed
  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    try {
      await supabase
        .from('onboarding_profiles' as any)
        .update({
          onboarding_completed: true,
          current_step: 12,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('user_id', user.id);
    } catch (err) {
      console.error('[ONBOARDING] Error completing:', err);
    }
  }, [user]);

  // Determine if user can continue (has made at least 1 selection)
  const canContinue = (() => {
    switch (currentStep) {
      case 1: return data.roles.length > 0;
      case 2: return data.niches.length > 0;
      case 3: return data.upload_volume !== null;
      case 4: return data.pain_points.length > 0;
      case 5: return data.goals.length > 0;
      case 6: return true; // Facts — informational
      case 7: return true; // Free-text — skippable
      case 8: return true; // Commitment
      default: return true;
    }
  })();

  return {
    currentStep,
    data,
    setData,
    goNext,
    goBack,
    setStep,
    createProfile,
    completeOnboarding,
    saveToDb,
    isLoading,
    isSaving,
    canContinue,
    direction,
  };
}
