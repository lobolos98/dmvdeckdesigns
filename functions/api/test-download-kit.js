export async function onRequestGet(context) {
  // Development/QA-only delivery test. This endpoint is inert unless
  // KIT_TEST_TOKEN is explicitly configured in the Cloudflare environment.
  const url = new URL(context.request.url);
  const token = url.searchParams.get("token");
  const expectedToken = context.env.KIT_TEST_TOKEN;
  const bucket = context.env.KIT_BUCKET;

  if (!expectedToken || !bucket || !token || token !== expectedToken) {
    return new Response("Not found.", { status: 404 });
  }

  try {
    const object = await bucket.get(
      "DMV_Deck_Designs_Complete_Deck_Planning_Kit.pdf",
    );

    if (!object) {
      return new Response("Product file is temporarily unavailable.", {
        status: 404,
      });
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
