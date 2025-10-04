-- MVP Subscription Plans Seed Data
-- Run this after migration: psql -d your_database -f seed.sql

INSERT INTO subscription_plans (id, name, description, price, currency, interval, interval_count, is_active, features, limits, created_at, updated_at) VALUES 
(
  'plan_free_mvp',
  'Free Plan',
  'Perfect for getting started with basic SEO tools',
  0.00,
  'USD',
  'month',
  1,
  true,
  '["Keyword Research (Limited)", "Backlink Checker (Limited)", "SSL Checker", "Page Speed Test", "Basic SEO Analysis"]',
  '{
    "monthlyCredits": 100,
    "keywordResearch": 10,
    "backlinkChecker": 5,
    "sslChecker": 20,
    "pageSpeedTest": 20,
    "seoAnalysis": 5,
    "aiTools": 10
  }',
  NOW(),
  NOW()
),
(
  'plan_pro_mvp',
  'Pro Plan',
  'Advanced SEO tools for professionals and agencies',
  29.99,
  'USD',
  'month',
  1,
  true,
  '["Unlimited Keyword Research", "Advanced Backlink Analysis", "SSL Monitoring", "Unlimited Page Speed Tests", "Advanced SEO Audits", "AI Content Tools", "Priority Support"]',
  '{
    "monthlyCredits": 2000,
    "keywordResearch": 500,
    "backlinkChecker": 200,
    "sslChecker": -1,
    "pageSpeedTest": -1,
    "seoAnalysis": 100,
    "aiTools": 500
  }',
  NOW(),
  NOW()
);

-- Note: -1 in limits means unlimited for that feature