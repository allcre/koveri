import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Generate Profile Edge Function
 *
 * This function generates/tweaks dating profiles using AI.
 *
 * PROMPT REFERENCE: The prompts used here are defined in:
 * - src/prompts/ai-prompts.ts (PROFILE_GENERATOR_SYSTEM_PROMPT, buildProfileGeneratePrompt, buildProfileTweakPrompt)
 *
 * If you update prompts here, please also update the centralized versions
 * in the prompts folder to keep documentation in sync.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateProfileRequest {
  type: "generate" | "tweak";
  yellowcakeData?: any;
  targetAudience: string;
  aboutMe?: string;
  highlights?: string;
  currentProfile?: any;
  tweakRequest?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, yellowcakeData, targetAudience, aboutMe, highlights, currentProfile, tweakRequest } = 
      await req.json() as GenerateProfileRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a witty, data-driven matchmaker. You create engaging, authentic profiles that highlight someone's quirks and personality based on their data and preferences. You write in a warm, playful tone that feels genuine. You never sound cheesy or try-hard.`;

    let userPrompt = "";

    if (type === "generate") {
      userPrompt = `Create a profile inspired by dating profiles these characteristics:

**Target Audience (who they want to connect with and what this profile is themed around):** ${targetAudience}

**About Themselves:** ${aboutMe || "Not provided"}

**What They Want to Highlight:** ${highlights || "Not provided"}

**Their Digital Footprint Data:**
${yellowcakeData ? JSON.stringify(yellowcakeData, null, 2) : "No data available"} Use this data as prompt answers and fun facts. 
For users targetting a hackathon buddy reference interesting repos and coding languages (which can often be found in the description of the repo).
For users targetting a date, reference details that make them stand out (e.g. their favorite genres, interesting substack articles written, etc.).
For users targetting a friend, reference group activities they enjoy (e.g. Steam for games played, Twitter for interesting tweets, etc.).
Of course, you are not constrained by these examples and can use your imagination to create a profile that is unique and engaging.

Generate a complete profile with:

1. **bio**: A personal, authentic bio (CRITICAL: 150 character hard-limit) that must appeal to their target audience. Must reference their data naturally.

2. **promptAnswers**: 2-3 prompt answers. Pick prompts that showcase their personality based on the data and avoid prompts that don't align with their target audience (example: somneone looking for a hackathon partner should not have a prompt discussing their perfect first date). Each should have:
   - promptId: a snake_case identifier
   - promptText: the prompt question
   - answerText: a clever, authentic answer (CRITICAL: keep it concise, 75 characters hard-limit)

3. **funFacts**: 3-4 short and punchy superlatives and one-word descriptors derived from their data. Format as { label: "Category", value: "Specific thing" }. Examples: "Most played artist: Mitski", "Top language: TypeScript", "Films this year: 47"

4. **dataInsights**: 1-2 data-backed insights that would intrigue their target audience. Each has:
   - type: "stat" | "badge" | "chart"
   - title: short title
   - description: short bullet point explanation, no need to use pronouns, just describe the data
   - metricValue: the key number or label

5. **bestFeatures**: 3 compelling features to highlight as badges

Return ONLY valid JSON in this exact format:
{
  "bio": "...",
  "promptAnswers": [...],
  "funFacts": [...],
  "dataInsights": [...],
  "bestFeatures": [...]
}`;
    } else if (type === "tweak") {
      userPrompt = `The user wants to tweak their dating profile.

**Current Profile:**
${JSON.stringify(currentProfile, null, 2)}

**User's Request:** ${tweakRequest}

Make the requested changes while maintaining the same JSON structure and target audience. Keep what works, only modify what they asked for.

Return ONLY valid JSON with the full updated profile:
{
  "bio": "...",
  "promptAnswers": [...],
  "funFacts": [...],
  "dataInsights": [...],
  "bestFeatures": [...]
}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "API credits depleted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const profileData = JSON.parse(jsonStr);

    return new Response(JSON.stringify(profileData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-profile error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
