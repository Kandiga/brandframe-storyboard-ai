import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI } from "npm:@google/genai@1.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

// Helper function to parse SRT captions
function parseSRT(srtText: string): Array<{ start: number; end: number; text: string }> {
  const blocks = srtText.trim().split(/\n\s*\n/);
  const captions: Array<{ start: number; end: number; text: string }> = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const timecodeLine = lines[1];
    const match = timecodeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!match) continue;

    const start = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000;
    const end = parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000;
    const text = lines.slice(2).join(' ').replace(/<[^>]+>/g, '').trim();

    if (text) {
      captions.push({ start, end, text });
    }
  }

  return captions;
}

// Helper function to extract script from captions
function extractScript(captions: Array<{ start: number; end: number; text: string }>): string {
  return captions.map(c => c.text).join(' ');
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
    const { videoId } = body;

    if (!videoId) {
      throw new Error("videoId is required");
    }

    console.log(`Analyzing video: ${videoId}`);

    // Step 1: Get video metadata
    const videoUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${youtubeApiKey}`;
    const videoResponse = await fetch(videoUrl);
    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = videoData.items[0];
    const videoTitle = video.snippet.title;
    const videoDescription = video.snippet.description;
    const thumbnailUrl = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url;

    // Step 2: Get captions
    const captionsListUrl = `${YOUTUBE_API_BASE_URL}/captions?part=snippet&videoId=${videoId}&key=${youtubeApiKey}`;
    const captionsListResponse = await fetch(captionsListUrl);
    const captionsListData = await captionsListResponse.json();

    let script = "";
    let captions: Array<{ start: number; end: number; text: string }> = [];

    if (captionsListData.items && captionsListData.items.length > 0) {
      // Get the first available caption track (prefer English)
      const captionTrack = captionsListData.items.find((item: any) =>
        item.snippet.language === "en" || item.snippet.language.startsWith("en")
      ) || captionsListData.items[0];

      if (captionTrack) {
        // Download the caption track
        const captionDownloadUrl = `${YOUTUBE_API_BASE_URL}/captions/${captionTrack.id}?tfmt=srt&key=${youtubeApiKey}`;
        const captionDownloadResponse = await fetch(captionDownloadUrl);
        const captionText = await captionDownloadResponse.text();
        captions = parseSRT(captionText);
        script = extractScript(captions);
      }
    }

    // If no captions, use description as script
    if (!script && videoDescription) {
      script = videoDescription.substring(0, 1000);
    }

    // Step 3: Analyze with Gemini AI
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const analysisPrompt = `Analyze this video script and provide a comprehensive analysis in JSON format:

Video Title: ${videoTitle}
Video Description: ${videoDescription.substring(0, 500)}
Script: ${script.substring(0, 2000)}

Please provide a JSON response with the following structure:
{
  "script": "Full extracted script text",
  "keyMoments": [
    {
      "timestamp": 10.5,
      "description": "Brief description of what happens at this moment",
      "thumbnail": "URL or description"
    }
  ],
  "detectedCharacters": [
    {
      "description": "Character description",
      "appearance": "Physical appearance details",
      "frequency": 5
    }
  ],
  "detectedBackgrounds": [
    {
      "description": "Background description",
      "style": "Visual style",
      "frequency": 3
    }
  ],
  "visualStyle": {
    "dominantColors": ["#color1", "#color2"],
    "composition": "Description of composition style",
    "lighting": "Description of lighting"
  },
  "suggestedStoryboard": {
    "scenes": [
      {
        "title": "Scene title",
        "scriptLine": "Key dialogue or action",
        "timestamp": 15.0,
        "thumbnail": "Description or URL",
        "framePosition": "first" | "middle" | "last"
      }
    ]
  }
}

Extract 4-8 key moments evenly distributed throughout the video. Identify main characters and backgrounds. Suggest 4-6 scenes for a storyboard.

IMPORTANT: For suggestedStoryboard.scenes:
- The FIRST scene (index 0) must have "framePosition": "first" - this is the opening shot
- The LAST scene (final index) must have "framePosition": "last" - this is the closing shot
- All middle scenes should have "framePosition": "middle"
- Frame position indicators help with Veo 3.1 prompt generation and narrative structure.`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text();

    // Extract JSON from response
    let analysis: any;
    try {
      // Try to find JSON in the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (e) {
      console.error("Failed to parse analysis JSON:", e);
      // Fallback: create basic analysis
      analysis = {
        script: script || videoDescription.substring(0, 500),
        keyMoments: captions.slice(0, 8).map((c, i) => ({
          timestamp: c.start,
          description: c.text.substring(0, 100),
          thumbnail: thumbnailUrl,
        })),
        detectedCharacters: [],
        detectedBackgrounds: [],
        visualStyle: {
          dominantColors: ["#000000", "#FFFFFF"],
          composition: "Standard video composition",
          lighting: "Natural lighting",
        },
        suggestedStoryboard: {
          scenes: captions.slice(0, 6).map((c, i) => ({
            title: `Scene ${i + 1}`,
            scriptLine: c.text.substring(0, 100),
            timestamp: c.start,
            thumbnail: thumbnailUrl,
          })),
        },
      };
    }

    // Enhance key moments with thumbnails
    analysis.keyMoments = analysis.keyMoments.map((moment: any) => ({
      ...moment,
      thumbnail: moment.thumbnail || thumbnailUrl,
    }));

    // Enhance suggested scenes with thumbnails and frame positions
    if (analysis.suggestedStoryboard && analysis.suggestedStoryboard.scenes) {
      const scenes = analysis.suggestedStoryboard.scenes;
      analysis.suggestedStoryboard.scenes = scenes.map((scene: any, index: number) => ({
        ...scene,
        thumbnail: scene.thumbnail || thumbnailUrl,
        framePosition: scene.framePosition || (index === 0 ? 'first' : index === scenes.length - 1 ? 'last' : 'middle'),
      }));
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          script: analysis.script || script,
          keyMoments: analysis.keyMoments || [],
          detectedCharacters: analysis.detectedCharacters || [],
          detectedBackgrounds: analysis.detectedBackgrounds || [],
          visualStyle: analysis.visualStyle || {
            dominantColors: [],
            composition: "",
            lighting: "",
          },
          suggestedStoryboard: analysis.suggestedStoryboard || {
            scenes: [],
          },
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

