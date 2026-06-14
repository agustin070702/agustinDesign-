// ================================================================
//  Supabase Edge Function: generate-summary
//  Llama a la API de Anthropic desde el servidor (sin CORS).
//
//  SETUP (hacer UNA sola vez):
//  ──────────────────────────
//  1. Ir a supabase.com → tu proyecto → "Edge Functions" (menú izq.)
//  2. Click "New Function" → nombre: generate-summary
//  3. Borrar el código de ejemplo y pegar todo el contenido de este archivo
//  4. Click "Deploy"
//
//  5. Ir a Project Settings → "Secrets" (o "Environment Variables")
//  6. Agregar secret:
//       Nombre: ANTHROPIC_API_KEY
//       Valor:  sk-ant-xxxxxxxxxxxxxxxx  (tu key de console.anthropic.com)
//  7. Guardar → la función ya puede llamar a Claude
// ================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, systemPrompt } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-5",
        max_tokens: 1500,
        system:     systemPrompt,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
