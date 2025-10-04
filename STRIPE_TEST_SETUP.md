# Stripe Integration Test Setup

## Overview
This document provides instructions for testing the complete Stripe integration including credit purchases, subscriptions, and webhooks.

## Prerequisites
1. Stripe account (test mode)
2. Clerk account for authentication
3. PostgreSQL database

## Environment Variables Setup

### 1. Stripe Configuration
```bash
# Get these from your Stripe Dashboard (Test mode)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Clerk Configuration
```bash
# Get these from your Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### 3. Database Configuration
```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## Stripe Dashboard Setup

### 1. Create Products and Prices
You need to create the following products in your Stripe Dashboard:

#### Subscription Plans:
- **Pro Plan**: $19/month
- **Enterprise Plan**: $49/month

#### Credit Packages:
- **Small Package**: 500 credits for $9
- **Medium Package**: 1500 credits for $19  
- **Large Package**: 3000 credits for $29

### 2. Update Price IDs
After creating products, update your `.env.local` with the actual price IDs:

```bash
# Subscription Plans
STRIPE_PRO_PLAN_PRICE_ID=price_...
STRIPE_ENTERPRISE_PLAN_PRICE_ID=price_...

# Credit Packages
STRIPE_CREDITS_SMALL_PRICE_ID=price_...
STRIPE_CREDITS_MEDIUM_PRICE_ID=price_...
STRIPE_CREDITS_LARGE_PRICE_ID=price_...
```

### 3. Configure Webhooks
Set up a webhook endpoint in Stripe Dashboard:
- **URL**: `http://localhost:3000/api/stripe/webhook` (use ngrok for local testing)
- **Events to listen for**:
  - `payment_intent.succeeded`
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## Database Setup

### 1. Run Prisma Migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### 2. Seed Database (Optional)
```bash
npx prisma db seed
```

## Testing Scenarios

### 1. Credit Purchase Flow
1. Navigate to `/dashboard/settings`
2. Click on any credit package
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Verify credits are added to user account

### 2. Subscription Flow
1. Navigate to `/dashboard/settings`
2. Click "Upgrade" on Pro or Enterprise plan
3. Complete checkout with test card
4. Verify subscription is active
5. Test subscription management via customer portal

### 3. Webhook Testing
1. Use Stripe CLI for local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. Trigger test events and verify database updates

## Test Cards
Use these test cards for different scenarios:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## Troubleshooting

### Common Issues:
1. **Webhook signature verification fails**: Check `STRIPE_WEBHOOK_SECRET`
2. **Authentication errors**: Verify Clerk configuration
3. **Database connection issues**: Check `DATABASE_URL`
4. **CORS errors**: Ensure proper domain configuration

### Logs to Check:
- Browser console for client-side errors
- Server logs for API errors
- Stripe Dashboard for webhook delivery status

## API Endpoints Created

### Stripe Integration:
- `POST /api/stripe/create-checkout-session` - Create checkout sessions
- `POST /api/stripe/manage-subscription` - Manage subscriptions
- `POST /api/stripe/create-portal-session` - Customer portal access
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### User Management:
- `GET /api/user/settings` - Get user settings and subscription info
- `POST /api/user/settings` - Update user settings

## Features Implemented

✅ Credit purchase with Stripe Checkout
✅ Subscription management (upgrade/downgrade/cancel)
✅ Webhook handling for payment processing
✅ Customer portal integration
✅ Plan change notifications
✅ Real-time UI updates
✅ Error handling and user feedback

## Next Steps for Production

1. Switch to live Stripe keys
2. Configure production webhook endpoints
3. Set up proper error monitoring
4. Implement additional security measures
5. Add comprehensive logging