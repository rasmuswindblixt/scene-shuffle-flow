-- Enhance subscribers table with comprehensive trial and subscription tracking
-- Migration: Add detailed trial and subscription management columns
-- Date: 2025-08-25

-- Add comprehensive trial and subscription tracking columns
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS active_trial BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS number_of_exports INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_export_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_videos_processed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES public.subscribers(email),
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_subscribers_active_trial ON public.subscribers(active_trial);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_tier ON public.subscribers(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer_id ON public.subscribers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_subscription_id ON public.subscribers(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_trial_expires_at ON public.subscribers(trial_expires_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_next_billing_date ON public.subscribers(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscribers_account_status ON public.subscribers(account_status);
CREATE INDEX IF NOT EXISTS idx_subscribers_referral_code ON public.subscribers(referral_code);

-- Update existing users with proper trial status
UPDATE public.subscribers 
SET 
    active_trial = false,
    subscription_tier = 'premium',
    subscription_started_at = updated_at,
    number_of_exports = COALESCE(free_exports_used, 0)
WHERE subscribed = true;

UPDATE public.subscribers 
SET 
    active_trial = CASE 
        WHEN COALESCE(free_exports_used, 0) >= 3 THEN false 
        ELSE true 
    END,
    subscription_tier = 'free',
    number_of_exports = COALESCE(free_exports_used, 0)
WHERE subscribed = false OR subscribed IS NULL;

UPDATE public.subscribers 
SET trial_started_at = COALESCE(created_at, NOW())
WHERE trial_started_at IS NULL;

UPDATE public.subscribers 
SET trial_expires_at = trial_started_at + INTERVAL '30 days'
WHERE active_trial = true AND trial_expires_at IS NULL;

UPDATE public.subscribers 
SET referral_code = UPPER(LEFT(email, 3)) || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
WHERE referral_code IS NULL;

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := UPPER(LEFT(NEW.email, 3)) || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_referral_code ON public.subscribers;
CREATE TRIGGER trigger_generate_referral_code
    BEFORE INSERT ON public.subscribers
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code();
