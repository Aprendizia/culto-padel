import { stripe } from './client';

// Create a Connect account for a new tenant (club)
export async function createConnectAccount(tenantName: string, email: string) {
  const account = await stripe.accounts.create({
    type: 'standard',
    country: 'MX',
    email,
    business_profile: {
      name: tenantName,
      mcc: '7941', // Sports clubs
    },
  });
  return account;
}

// Generate onboarding link for the club
export async function createOnboardingLink(accountId: string, returnUrl: string) {
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: 'account_onboarding',
    return_url: returnUrl,
    refresh_url: `${returnUrl}?refresh=true`,
  });
  return link;
}

// Check if account has completed onboarding
export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  };
}

// Create a login link for the Express dashboard
export async function createDashboardLink(accountId: string) {
  const link = await stripe.accounts.createLoginLink(accountId);
  return link;
}
