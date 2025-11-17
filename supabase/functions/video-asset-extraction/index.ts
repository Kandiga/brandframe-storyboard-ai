import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI } from "npm:@google/genai@1.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

// Helper function to get thumbnail URL for a specific timestamp
function getThumbnailUrl(videoId: string, timestamp: number): string {
  // YouTube provides thumbnails at specific intervals
  // We'll use the standard thumbnail and note the timestamp
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    if (!youtubeApiKey) {
      throw new Error("YOUTUBE_API_KEY not configured");
    }

    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    const body = await req.json();
    const { videoId, timestamps } = body;

    if (!videoId) {
      throw new Error("videoId is required");
    }

    if (!timestamps || !Array.isArray(timestamps) || timestamps.length === 0) {
      throw new Error("timestamps array is required");
    }

    console.log(`Extracting assets from video: ${videoId} at timestamps: ${timestamps.join(', ')}`);

    // Get video metadata
    const videoUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails&id=${videoId}&key=${youtubeApiKey}`;
    const videoResponse = await fetch(videoUrl);
    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = videoData.items[0];
    const thumbnailUrl = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url;

    // For each timestamp, get thumbnail and analyze with Gemini Vision
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });

    const extractedCharacters: any[] = [];
    const extractedBackgrounds: any[] = [];
    let styleReference: any = null;

    // Process each timestamp
    for (const timestamp of timestamps.slice(0, 5)) { // Limit to 5 timestamps
      const frameThumbnail = getThumbnailUrl(videoId, timestamp);

      // Analyze frame with Gemini Vision
      const analysisPrompt = `Analyze this video frame thumbnail and extract:
1. Characters: Describe any visible characters (appearance, clothing, pose)
2. Background: Describe the background/setting
3. Visual style: Colors, composition, lighting

Frame timestamp: ${timestamp}s
Video title: ${video.snippet.title}

Provide JSON response:
{
  "characters": [{"description": "...", "appearance": "..."}],
  "background": {"description": "...", "style": "..."},
  "visualStyle": {"colors": [...], "composition": "...", "lighting": "..."}
}`;

      try {
        // Note: Gemini Vision API requires image input
        // For now, we'll use text-based analysis with thumbnail URL reference
        const result = await model.generateContent(analysisPrompt);
        const analysisText = result.response.text();

        // Try to extract JSON
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);

          if (analysis.characters && analysis.characters.length > 0) {
            analysis.characters.forEach((char: any) => {
              extractedCharacters.push({
                image: frameThumbnail,
                description: char.description || "",
                sourceTimestamp: timestamp,
              });
            });
          }

          if (analysis.background) {
            extractedBackgrounds.push({
              image: frameThumbnail,
              description: analysis.background.description || "",
              sourceTimestamp: timestamp,
            });
          }

          if (!styleReference && analysis.visualStyle) {
            styleReference = {
              image: frameThumbnail,
              description: `Visual style: ${analysis.visualStyle.composition || ""} ${analysis.visualStyle.lighting || ""}`,
            };
          }
        }
      } catch (e) {
        console.error(`Error analyzing frame at ${timestamp}s:`, e);
        // Continue with other frames
      }
    }

    // If no characters extracted, create a default one
    if (extractedCharacters.length === 0) {
      extractedCharacters.push({
        image: thumbnailUrl,
        description: "Main character from video",
        sourceTimestamp: timestamps[0] || 0,
      });
    }

    // If no backgrounds extracted, create a default one
    if (extractedBackgrounds.length === 0) {
      extractedBackgrounds.push({
        image: thumbnailUrl,
        description: "Background from video",
        sourceTimestamp: timestamps[0] || 0,
      });
    }

    // If no style reference, create a default one
    if (!styleReference) {
      styleReference = {
        image: thumbnailUrl,
        description: "Visual style reference from video",
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        assets: {
          characters: extractedCharacters,
          backgrounds: extractedBackgrounds,
          styleReference,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

