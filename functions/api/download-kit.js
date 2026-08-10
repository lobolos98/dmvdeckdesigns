export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return new Response("Missing payment session.", { status: 400 });
  }

  const secretKey = context.env.STRIPE_SECRET_KEY;
  const bucket = context.env.KIT_BUCKET;

  if (!secretKey || !bucket) {
    return new Response("Digital delivery is not configured.", { status: 503 });
  }

  try {
    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    if (!stripeResponse.ok) {
      return new Response("Unable to verify payment.", { status: 403 });
    }

    const session = await stripeResponse.json();

    if (session.payment_status !== "paid") {
      return new Response("Payment has not been completed.", { status: 403 });
    }

    // The Payment Link used for this product is intentionally checked server-side.
    // This prevents a customer from presenting an unrelated paid Stripe session.
    const expectedPaymentLink =
      "https://buy.stripe.com/9B600ke6FdEN21H1Cg3Nm05";

    if (session.payment_link && session.payment_link !== expectedPaymentLink.split("/buy/")[1]) {
      return new Response("This payment is not associated with the Deck Planning Kit.", {
        status: 403,
      });
    }

    const object = await bucket.get(
      "DMV_Deck_Designs_Complete_Deck_Planning_Kit.pdf",
    );

    if (!object) {
      return new Response("Product file is temporarily unavailable.", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      'attachment; filename="DMV_Deck_Designs_Complete_Deck_Planning_Kit.pdf"',
    );
    headers.set("Cache-Control", "private, no-store");

    return new Response(object.body, { headers });
  } catch (error) {
    console.error("Kit delivery error", error);
    return new Response("Unable to deliver the product.", { status: 500 });
  }
}
