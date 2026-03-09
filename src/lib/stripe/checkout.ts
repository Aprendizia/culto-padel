import { stripe } from './client';

interface CreateTournamentCheckoutParams {
  tournamentName: string;
  entryFee: number; // in MXN
  commissionRate: number; // e.g. 0.05 for 5%
  tenantStripeAccountId: string;
  registrationId: string;
  tournamentId: string;
  tenantId: string;
  playerEmail: string;
  playerName: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createTournamentCheckoutSession({
  tournamentName,
  entryFee,
  commissionRate,
  tenantStripeAccountId,
  registrationId,
  tournamentId,
  tenantId,
  playerEmail,
  playerName,
  successUrl,
  cancelUrl,
}: CreateTournamentCheckoutParams) {
  const applicationFee = Math.round(entryFee * commissionRate * 100); // in centavos

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: playerEmail,
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `Inscripción: ${tournamentName}`,
            description: 'Registro al torneo de pádel',
          },
          unit_amount: Math.round(entryFee * 100), // centavos
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: tenantStripeAccountId,
      },
    },
    metadata: {
      registration_id: registrationId,
      tournament_id: tournamentId,
      tenant_id: tenantId,
      player_name: playerName,
    },
    locale: 'es',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

interface CreateProductCheckoutParams {
  items: Array<{
    name: string;
    unitAmount: number; // centavos
    quantity: number;
  }>;
  tenantStripeAccountId: string;
  commissionRate: number;
  orderId: string;
  tenantId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createProductCheckoutSession({
  items,
  tenantStripeAccountId,
  commissionRate,
  orderId,
  tenantId,
  customerEmail,
  successUrl,
  cancelUrl,
}: CreateProductCheckoutParams) {
  const totalAmount = items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  const applicationFee = Math.round(totalAmount * commissionRate);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: items.map((item) => ({
      price_data: {
        currency: 'mxn',
        product_data: { name: item.name },
        unit_amount: item.unitAmount,
      },
      quantity: item.quantity,
    })),
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: tenantStripeAccountId,
      },
    },
    metadata: {
      order_id: orderId,
      tenant_id: tenantId,
    },
    locale: 'es',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}
