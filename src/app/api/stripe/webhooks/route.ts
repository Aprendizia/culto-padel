import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const registrationId = session.metadata?.registration_id;
      const orderId = session.metadata?.order_id;

      if (registrationId) {
        // Tournament registration payment
        await supabaseAdmin
          .from('tournament_registrations')
          .update({
            status: 'paid',
            payment_status: 'succeeded',
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_checkout_session_id: session.id,
            amount_paid: (session.amount_total || 0) / 100,
            paid_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', registrationId);
      }

      if (orderId) {
        // Product order payment
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_checkout_session_id: session.id,
            paid_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }
      break;
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      // Update tenant's stripe onboarding status
      await supabaseAdmin
        .from('tenants')
        .update({
          stripe_onboarding_complete:
            account.charges_enabled && account.details_submitted,
        })
        .eq('stripe_account_id', account.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const registrationId = paymentIntent.metadata?.registration_id;
      if (registrationId) {
        await supabaseAdmin
          .from('tournament_registrations')
          .update({ payment_status: 'failed' })
          .eq('id', registrationId);
      }
      break;
    }
  }

  // Log every event
  await supabaseAdmin.from('stripe_events').insert({
    id: event.id,
    type: event.type,
    data: event.data.object as Record<string, unknown>,
    processed: true,
    processed_at: new Date().toISOString(),
  });

  return NextResponse.json({ received: true });
}
