-- Add trial system columns to profiles table
-- Migration: Add free trial functionality
-- Date: 2025-08-22

-- Add trial-related columns to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS export_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_status TEXT DEFAULT 'active' CHECK (trial_status IN ('active', 'expired', 'converted')),
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'cancelled', 'past_due'));

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_trial_status ON profiles(trial_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Update existing users: set trial_started_at to their created_at date if available
UPDATE profiles 
SET trial_started_at = created_at 
WHERE trial_started_at IS NULL AND created_at IS NOT NULL;

-- For users without created_at, use current timestamp
UPDATE profiles 
SET trial_started_at = NOW() 
WHERE trial_started_at IS NULL;

-- Comment: Existing paid subscribers will need manual status update via admin or webhook
-- This can be handled in the check-subscription function
