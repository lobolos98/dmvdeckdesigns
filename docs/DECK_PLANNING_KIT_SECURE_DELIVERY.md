# $49 Deck Planning Kit — Secure Delivery Setup

The Deck Planning Kit is intentionally **not stored in the public GitHub repository** because this repository is public.

## Production delivery architecture

1. Customer purchases the $49 Stripe Payment Link.
2. Stripe redirects the customer to:
   `https://dmvdeckdesigns.com/kit-success?session_id={CHECKOUT_SESSION_ID}`
3. The success page provides a download link containing the Checkout Session ID.
4. A Cloudflare Pages Function verifies the Checkout Session with Stripe using the server-side `STRIPE_SECRET_KEY` environment variable.
5. The function confirms `payment_status=paid` and that the session belongs to the $49 Deck Planning Kit payment link/product.
6. The function returns the PDF from a **private Cloudflare R2 bucket**. The PDF is never publicly exposed.

## Required Cloudflare configuration

Create a private R2 bucket and upload:

`DMV_Deck_Designs_Complete_Deck_Planning_Kit.pdf`

Bind the bucket to the Pages project as `KIT_BUCKET`.

Add this encrypted environment variable:

`STRIPE_SECRET_KEY`

Do not commit the Stripe secret key to GitHub.

## Stripe redirect

Configure the Payment Link's post-payment redirect as:

`https://dmvdeckdesigns.com/kit-success?session_id={CHECKOUT_SESSION_ID}`

The `{CHECKOUT_SESSION_ID}` placeholder must remain exactly as shown so Stripe supplies the paid Checkout Session ID.

## Launch checklist

- [ ] Upload the PDF to the private R2 bucket.
- [ ] Configure `KIT_BUCKET` binding.
- [ ] Configure `STRIPE_SECRET_KEY` as a Cloudflare secret/environment variable.
- [ ] Configure the Stripe Payment Link redirect.
- [ ] Deploy the Pages Function.
- [ ] Complete a real $49 test purchase.
- [ ] Confirm the download works after payment.
- [ ] Confirm an unpaid/invalid session is rejected.
