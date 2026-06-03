// Proxy images du Mushaf de Médine avec headers CORS
// Permet au canvas du navigateur de charger et exporter les pages annotées
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const page = url.searchParams.get("page");
  if (!page || isNaN(Number(page)) || Number(page) < 1 || Number(page) > 604) {
    return new Response("page param required (1-604)", { status: 400, headers: corsHeaders });
  }

  const padded = String(page).padStart(3, "0");
  const imgUrl = `https://www.mp3quran.net/api/quran_pages_arabic/${padded}.png`;

  try {
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) {
      return new Response(`Image not found: ${imgRes.status}`, { status: 404, headers: corsHeaders });
    }
    const blob = await imgRes.arrayBuffer();
    return new Response(blob, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return new Response(`Error: ${e}`, { status: 500, headers: corsHeaders });
  }
});
