import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  onComplete: () => void;
}

const StepSuccess = ({ onComplete }: Props) => {
  const [checking, setChecking] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    onComplete();

    let attempts = 0;
    const MAX_ATTEMPTS = 15; // 30 seconds total

    const poll = async () => {
      attempts++;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        // Not logged in — just navigate
        window.location.href = '/app';
        return;
      }

      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('subscribed')
        .eq('email', session.user.email)
        .maybeSingle();

      if (subscriber?.subscribed) {
        // Confirmed — full reload so AuthContext picks up fresh state
        window.location.href = '/app';
        return;
      }

      if (attempts >= MAX_ATTEMPTS) {
        setChecking(false);
        setTimedOut(true);
        return;
      }

      setTimeout(poll, 2000);
    };

    setTimeout(poll, 1500);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="text-6xl animate-pop-in">🎉</div>

        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-3xl font-bold">Welcome to ClipMixPro!</h2>
          <p className="text-muted-foreground">Your account is activated. Start saving time right away.</p>
        </div>

        <div
          className="bg-card/60 border border-border/50 rounded-xl p-6 text-left space-y-4 animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            Three steps to get started
          </h3>
          <div className="space-y-3">
            {[
              'Upload 1-3 competitor videos',
              'Let the app clip & shuffle automatically',
              'Pick your clips, export & publish',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="font-medium text-sm">{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          {checking ? (
            <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground text-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              Activating your account…
            </div>
          ) : timedOut ? (
            <button
              onClick={() => { window.location.href = '/app'; }}
              className="w-full py-6 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Open ClipMixPro →
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StepSuccess;
