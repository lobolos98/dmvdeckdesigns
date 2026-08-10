export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const suppliedToken = url.searchParams.get("token");
  const testToken = context.env.KIT_TEST_TOKEN;
  const bucket = context.env.KIT_BUCKET;

  // QA-only route. It requires a Cloudflare secret that is intentionally
  // separate from Stripe and should only be configured on the preview environment.
  if (!testToken || !suppliedToken || suppliedToken !== testToken) {
    return new Response("Not found.", { status: 404 });
  }

  if (!bucket) {
    return new Response("Digital delivery is not configured.", { status: 503 });
  }

  try {
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
    console.error("Kit QA delivery error", error);
    return new Response("Unable to deliver the product.", { status: 500 });
  }
}
