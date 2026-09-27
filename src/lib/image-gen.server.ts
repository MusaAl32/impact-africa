const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";

/** Generates one image via the Lovable AI Gateway. Returns a data URL or a friendly error. */
export async function generateNuruImage(prompt: string): Promise<{ image: string } | { error: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { error: "Image creation isn't set up yet." };
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: IMAGE_MODEL, prompt, size: "1024x1024", quality: "medium" }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Nuru image generation failed", res.status, body.slice(0, 300));
    if (res.status === 402) return { error: "Image creation is paused because the workspace is out of AI credits." };
    if (res.status === 429) return { error: "Image creation is busy right now — please try again in a minute." };
    if (res.status === 400) return { error: "That image request couldn't be made. Try describing it differently." };
    return { error: "The image could not be created right now." };
  }
  const json = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
  const first = json.data?.[0];
  if (first?.b64_json) return { image: `data:image/png;base64,${first.b64_json}` };
  if (first?.url) return { image: first.url };
  return { error: "The image could not be created right now." };
}
