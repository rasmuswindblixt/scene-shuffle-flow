import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';

import OnboardingShell from '@/components/onboarding/OnboardingShell';
import StepCreateAccount from '@/components/onboarding/StepCreateAccount';
import StepRoleSelection from '@/components/onboarding/StepRoleSelection';
import StepNicheSelection from '@/components/onboarding/StepNicheSelection';
import StepUploadVolume from '@/components/onboarding/StepUploadVolume';
import StepPainPoints from '@/components/onboarding/StepPainPoints';
import StepGoals from '@/components/onboarding/StepGoals';
import StepFacts from '@/components/onboarding/StepFacts';
import StepYouTubeGoal from '@/components/onboarding/StepYouTubeGoal';
import StepCommitment from '@/components/onboarding/StepCommitment';
import StepLoading from '@/components/onboarding/StepLoading';
import StepReveal from '@/components/onboarding/StepReveal';
import StepPaywall from '@/components/onboarding/StepPaywall';
import StepSuccess from '@/components/onboarding/StepSuccess';

const Onboarding = () => {
  const { user, subscribed, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const onboarding = useOnboarding();

  // Already subscribed -> skip to app
  useEffect(() => {
    if (!authLoading && user && subscribed) {
      navigate('/app', { replace: true });
    }
  }, [user, subscribed, authLoading, navigate]);

  // If user just logged in (e.g. Google OAuth redirect) and is on step 0, advance
  useEffect(() => {
    if (user && onboarding.currentStep === 0) {
      onboarding.createProfile(user.id).then(() => {
        onboarding.setStep(1);
      });
    }
  }, [user, onboarding.currentStep]);

  // Returning user who completed survey but didn't pay — skip to paywall
  useEffect(() => {
    if (user && !subscribed && !onboarding.isLoading && onboarding.currentStep >= 9 && onboarding.currentStep <= 10) {
      onboarding.setStep(11);
    }
  }, [user, subscribed, onboarding.isLoading, onboarding.currentStep]);

  if (authLoading || onboarding.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const renderStep = () => {
    switch (onboarding.currentStep) {
      case 0:
        return (
          <StepCreateAccount
            onComplete={async (userId) => {
              await onboarding.createProfile(userId);
              onboarding.setStep(1);
            }}
          />
        );
      case 1:
        return <StepRoleSelection data={onboarding.data} setData={onboarding.setData} />;
      case 2:
        return <StepNicheSelection data={onboarding.data} setData={onboarding.setData} />;
      case 3:
        return <StepUploadVolume data={onboarding.data} setData={onboarding.setData} />;
      case 4:
        return <StepPainPoints data={onboarding.data} setData={onboarding.setData} />;
      case 5:
        return <StepGoals data={onboarding.data} setData={onboarding.setData} />;
      case 6:
        return <StepFacts />;
      case 7:
        return <StepYouTubeGoal data={onboarding.data} setData={onboarding.setData} />;
      case 8:
        return <StepCommitment data={onboarding.data} />;
      case 9:
        return (
          <StepLoading
            onComplete={() => onboarding.setStep(10)}
          />
        );
      case 10:
        return (
          <StepReveal
            uploadVolume={onboarding.data.upload_volume}
            onNext={() => {
              onboarding.setData({ selected_plan: 'yearly' });
              onboarding.setStep(11);
            }}
          />
        );
      case 11:
        return (
          <StepPaywall
            selectedPlan={onboarding.data.selected_plan}
            onPlanChange={(plan) => onboarding.setData({ selected_plan: plan })}
          />
        );
      case 12:
        return <StepSuccess onComplete={onboarding.completeOnboarding} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingShell
      currentStep={onboarding.currentStep}
      canContinue={onboarding.canContinue}
      isSaving={onboarding.isSaving}
      direction={onboarding.direction}
      onNext={onboarding.goNext}
      onBack={onboarding.goBack}
    >
      {renderStep()}
    </OnboardingShell>
  );
};

export default Onboarding;
