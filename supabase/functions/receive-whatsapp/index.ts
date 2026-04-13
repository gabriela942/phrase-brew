import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate shared secret — must be set via: supabase secrets set WHATSAPP_WEBHOOK_SECRET=<value>
  const expectedSecret = Deno.env.get("WHATSAPP_WEBHOOK_SECRET");
  const providedSecret = req.headers.get("x-webhook-secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // ManyChat sends data like:
    // { image_url, phone, name, message_text }
    const imageUrl = body.image_url || body.attachment_url || body.file_url || null;
    const phone = body.phone || body.user_phone || null;
    const name = body.name || body.user_name || body.first_name || null;
    const messageText = body.message_text || body.text || null;
    const templateType = body.template_type || "whatsapp";

    if (!imageUrl && !messageText) {
      return new Response(
        JSON.stringify({ error: "No image_url or message_text provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const submission: Record<string, unknown> = {
      source: "whatsapp",
      template_type: ["email", "whatsapp", "sms", "push"].includes(templateType)
        ? templateType
        : "whatsapp",
      status: "new",
      raw_from: phone ? `${name || "WhatsApp"} (${phone})` : name || "WhatsApp",
      raw_subject: messageText || "Print via WhatsApp",
      raw_body: imageUrl || messageText,
      language: "pt-br",
    };

    const { data, error } = await supabase
      .from("submissions")
      .insert(submission)
      .select("id")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If there's an image URL, download and store it in the bucket
    if (imageUrl) {
      try {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const ext = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
          const filePath = `whatsapp/${data.id}.${ext}`;

          await supabase.storage
            .from("submission-images")
            .upload(filePath, imageBlob, {
              contentType: imageBlob.type || "image/jpeg",
              upsert: true,
            });
        }
      } catch (imgErr) {
        console.error("Image download/upload error:", imgErr);
        // Non-fatal — submission is already saved
      }
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
