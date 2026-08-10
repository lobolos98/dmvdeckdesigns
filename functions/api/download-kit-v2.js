export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return new Response("Missing payment session.", { status: 400 });

  const secretKey = context.env.STRIPE_SECRET_KEY;
  const bucket = context.env.KIT_BUCKET;
  if (!secretKey || !bucket) return new Response("Digital delivery is not configured.", { status: 503 });

  try {
    const authHeaders = { Authorization: `Bearer ${secretKey}` };
    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, { headers: authHeaders });
    if (!stripeResponse.ok) return new Response("Unable to verify payment.", { status: 403 });
    const session = await stripeResponse.json();
    if (session.payment_status !== "paid") return new Response("Payment has not been completed.", { status: 403 });

    const linksResponse = await fetch("https://api.stripe.com/v1/payment_links?active=true&limit=100", { headers: authHeaders });
    if (!linksResponse.ok) return new Response("Unable to verify the product payment link.", { status: 403 });
    const links = await linksResponse.json();
    const expectedLink = links.data?.find((link) => link.url === "https://buy.stripe.com/9B600ke6FdEN21H1Cg3Nm05");
    if (!expectedLink || session.payment_link !== expectedLink.id) return new Response("This payment is not associated with the Deck Planning Kit.", { status: 403 });
    if (session.amount_total !== 4900 || session.currency !== "usd") return new Response("This payment does not match the Deck Planning Kit.", { status: 403 });

    const object = await bucket.get("DMV_Deck_Designs_Complete_Deck_Planning_Kit.pdf");
    if (!object) return new Response("Product file is temporarily unavailable.", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", 'attachment; filename="DMV_Deck_Designs_Complete_Deck_Planning_Kit.pdf"');
    headers.set("Cache-Control", "private, no-store");
    return new Response(object.body, { headers });
  } catch (error) {
    console.error("Kit delivery error", error);
    return new Response("Unable to deliver the product.", { status: 500 });
  }
}
