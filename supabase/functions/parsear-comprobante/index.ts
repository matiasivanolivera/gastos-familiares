import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const VISION_API_KEY = Deno.env.get('GOOGLE_VISION_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
}

Deno.serve(async (req) => {

  // Responder al preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { imagen, tipo } = await req.json()

  const visionRes = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imagen },
          features: [{ type: 'TEXT_DETECTION' }]
        }]
      })
    }
  )

  const visionData = await visionRes.json()
  const textoCompleto = visionData.responses?.[0]?.fullTextAnnotation?.text ?? ''

  return new Response(
    JSON.stringify({ texto: textoCompleto }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})