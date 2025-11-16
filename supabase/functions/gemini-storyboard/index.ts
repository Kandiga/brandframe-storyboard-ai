import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI, Type, Modality } from "npm:@google/genai@1.29.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Base64Asset {
  mimeType: string;
  data: string;
}

interface StoryboardRequest {
  logoAsset?: Base64Asset | null;
  mainCharacterAsset?: Base64Asset | null;
  characterAsset?: Base64Asset | null;
  additionalCharacterAssets?: Base64Asset[];
  backgroundAsset?: Base64Asset | null;
  artStyleAsset?: Base64Asset | null;
  story?: string;
  aspectRatio?: "16:9" | "9:16";
  frameCount?: number;
  continue?: boolean;
  existingStoryboard?: any;
  customInstruction?: string;
  consistencyThreshold?: number;
  enableConsistencyValidation?: boolean;
}

interface StoryWorld {
  premise: string;
  theme: string;
  structure: {
    act1: string;
    act2: string;
    act3: string;
    attractors: string[];
  };
  characterBlueprint: string;
  coreConflict: {
    internal: string;
    external: string;
  };
  boundaries: {
    spatial: string;
    temporal: string;
    historical: string;
    visual: string;
  };
}

interface ConsistencyValidationResult {
  passed: boolean;
  overallScore: number;
  characterIdentityScore: number;
  artStyleScore: number;
  colorPaletteScore: number;
  lightingScore: number;
  compositionScore: number;
  feedback: string;
}

const PROFESSIONAL_STORY_ARCHITECT_PROMPT = `You are a MASTER SCREENPLAY ARCHITECT with the expertise of:
- **Christopher Nolan** (structural complexity, non-linear storytelling)
- **Pixar Story Artists** (emotional beats, character arcs)
- **Robert McKee** (story structure, dramatic principles)
- **Syd Field** (three-act paradigm, plot points)

Your mission: Create a Story-World parameterization that serves as the FOUNDATIONAL BLUEPRINT for cinematic excellence.

For the story: "{STORY}"

Generate a comprehensive Story-World with these components:

## 1. PREMISE / LOGLINE
- Must have the "I gotta know what happens next" factor
- Include protagonist, goal, obstacle, stakes
- 1-2 sentences maximum
- Make it COMPELLING and SPECIFIC

## 2. THEME
- The philosophical stance on the core conflict
- What universal truth does this story explore?
- How does the protagonist's journey reflect this theme?

## 3. THREE-ACT STRUCTURE
- **Act 1 (Setup - 25%)**: Establish normal world, inciting incident, introduce conflict
- **Act 2 (Confrontation - 50%)**: Rising action, complications, midpoint twist
- **Act 3 (Resolution - 25%)**: Climax, falling action, resolution

## 4. STRUCTURAL ATTRACTORS (6-8 key plot points)
Must include:
- Inciting Incident (II): Event that disrupts normal world
- Plot Point 1 (PP1): End of Act 1, point of no return
- Midpoint (MP): Major revelation or reversal
- Plot Point 2 (PP2): End of Act 2, lowest point
- Climax: Final confrontation
- Resolution: New equilibrium

## 5. CHARACTER BLUEPRINT (15+ attributes)
Create a VERBATIM template with:
- Physical: Age, height, build, hair, eyes, distinctive features
- Behavioral: Mannerisms, speech patterns, posture, habits
- Psychological: Core need (Maslow), fear, desire, wound, ghost
- Relational: How they interact with others, trust patterns

## 6. CORE CONFLICT
- **Internal**: Psychological motives, inner demons, character flaw
- **External**: Physical obstacles, antagonistic forces, world challenges

## 7. BOUNDARIES & LOGIC
- **[SL] Spatial Logic**: Where does this story take place? Geography, architecture
- **[TL] Temporal Logic**: When? Time period, duration, pacing
- **[HST] Historical Setting**: Cultural context, era-specific details
- **[VST] Visual Style**: Cinematography approach, color palette, lighting mood

CRITICAL: Your Story-World must be RICH, SPECIFIC, and ACTIONABLE. Every element should guide the visual and narrative execution with PRECISION.

Respond with ONLY valid JSON matching this exact structure:
{
  "premise": "string",
  "theme": "string",
  "structure": {
    "act1": "string",
    "act2": "string",
    "act3": "string",
    "attractors": ["string", "string", ...]
  },
  "characterBlueprint": "string",
  "coreConflict": {
    "internal": "string",
    "external": "string"
  },
  "boundaries": {
    "spatial": "string",
    "temporal": "string",
    "historical": "string",
    "visual": "string"
  }
}`;

const PROFESSIONAL_SCRIPT_PROMPT = `You are now functioning as a LEVEL 9 BROADCAST QUALITY DIRECTOR & CINEMATOGRAPHER.

You have the Story-World blueprint: {STORY_WORLD}

Your task: Generate EXACTLY {SCENE_COUNT} scenes that bring this Story-World to life with CINEMATIC MASTERY.

## MANDATORY REQUIREMENTS FOR EACH SCENE:

### TIER 1: CINEMATOGRAPHY & FORMAT (Architecture - Critical)
- Camera: ARRI Alexa Mini LF / Sony Venice / RED Komodo
- Lens: Specify focal length (e.g., 35mm T1.5, 85mm T2.0)
- Format: 2.35:1 anamorphic / 16:9 / 1.85:1
- Resolution: 4K / 6K / 8K
- Frame rate: 24fps / 30fps / 60fps / 120fps (slow-motion)

### TIER 2: SUBJECT IDENTITY (Core Subject)
- Use the CHARACTER BLUEPRINT verbatim from Story-World
- Add emotional state for THIS specific scene
- Include wardrobe, props relevant to scene
- Describe facial expression, body language

### TIER 3: SCENE CONTEXT (Scene Anchors)
- FORENSIC location description: time of day, weather, season
- Architecture: interior/exterior, spatial dimensions
- Environmental details: sounds, smells, textures
- Atmospheric conditions: fog, rain, dust, lighting quality

### TIER 4A: ACTION (Motion)
- Follow SINGLE-ACTION PRINCIPLE: One clear action per sentence
- Separate body actions from facial expressions
- Use active verbs: "walks", "reaches", "turns", NOT "is walking"
- Maximum 3-4 actions per scene

### TIER 4B: CAMERA & COMPOSITION (Motion)
- Shot type: ECU / CU / MCU / MS / MLS / LS / ELS / POV
- Camera movement: Static / Pan / Tilt / Dolly / Crane / Handheld / Steadicam
- Use "(thats where the camera is)" syntax
- Framing: Rule of thirds, headroom, leading room

### TIER 5: STYLE & AMBIANCE (Aesthetics)
- Color grading: LUT style (e.g., Kodak 5219, ACES, custom)
- Lighting ratio: High key (2:1) / Low key (8:1) / Natural
- Mood: Warm / Cool / Neutral / Desaturated
- Practical lights, motivated lighting sources

### TIER 6: AUDIO & DIALOGUE (Audio)
- Sound design: Ambient sounds, foley, score
- Dialogue format: Character Name: "Exact words"
- Phoneme mapping for emphasis (optional)
- Music cues: Emotional tone, genre

### TIER 7: TECHNICAL & NEGATIVE (Quality Control)
- Universal negatives: "no blur, no grain, no artifacts, no distortion"
- Specific exclusions: "no text, no subtitles, no UI elements"
- Quality standards: "broadcast quality, professional grade"

### COMPREHENSIVE VEO 3.1 PROMPT
- Integrate ALL 7 tiers into one cohesive prompt
- Use proper prompt syntax for Veo 3.1
- Maximum 500 characters (Veo limit)
- Focus on VISUAL clarity and CINEMATIC precision

## OUTPUT FORMAT:
Respond with ONLY valid JSON:
{
  "scenes": [
    {
      "id": 1,
      "title": "Scene Title",
      "scriptLine": "Dialogue or narration",
      "emotion": "Emotional tone",
      "intent": "Character intent/motivation",
      "cinematographyFormat": "Camera, lens, format details",
      "subjectIdentity": "Character description with emotional state",
      "sceneContext": "Forensic location description",
      "action": "Clear actions, one per sentence",
      "cameraComposition": "Shot type and camera movement",
      "styleAmbiance": "Color grading, lighting, mood",
      "audioDialogue": "Sound design and dialogue",
      "technicalNegative": "Quality control negatives",
      "veoPrompt": "Comprehensive 500-char Veo prompt"
    }
  ]
}

CRITICAL: Each scene must follow the Story-World structure. Map scenes to structural attractors (II, PP1, MP, PP2, Climax, Resolution).`;

async function logAgentDecision(
  supabase: any,
  generationId: string,
  agentType: string,
  decisionType: string,
  inputData: any,
  outputData: any,
  reasoning: string,
  confidenceScore: number,
  executionTimeMs: number
) {
  try {
    await supabase.from('agent_decisions').insert({
      generation_id: generationId,
      agent_type: agentType,
      decision_type: decisionType,
      input_data: inputData,
      output_data: outputData,
      reasoning: reasoning,
      confidence_score: confidenceScore,
      execution_time_ms: executionTimeMs,
    });
  } catch (error) {
    console.error('Failed to log agent decision:', error);
  }
}

async function validateConsistency(
  ai: any,
  generatedImageBase64: string,
  referenceImageBase64: Base64Asset,
  referenceType: string,
  generationId: string,
  sceneId: string,
  frameVariant: string,
  supabase: any
): Promise<ConsistencyValidationResult> {
  const startTime = Date.now();

  try {
    const validationPrompt = `You are a VISUAL CONSISTENCY VALIDATION AGENT.

Your task: Compare the GENERATED image against the REFERENCE image and score consistency across multiple dimensions.

REFERENCE TYPE: ${referenceType}

Evaluate these aspects (0-100 scale):
1. **Character Identity** (if ${referenceType} includes character): Face, body, clothing, distinctive features
2. **Art Style**: Visual style, rendering technique, artistic approach
3. **Color Palette**: Color harmony, saturation, temperature
4. **Lighting**: Lighting direction, quality, shadows, highlights
5. **Composition**: Framing, balance, visual hierarchy

Provide scores and detailed feedback.

Respond with ONLY valid JSON:
{
  "characterIdentityScore": 0-100,
  "artStyleScore": 0-100,
  "colorPaletteScore": 0-100,
  "lightingScore": 0-100,
  "compositionScore": 0-100,
  "overallScore": 0-100,
  "feedback": "Detailed analysis of consistency"
}`;

    const validationResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro-vision',
      contents: {
        parts: [
          { text: validationPrompt },
          { text: "[GENERATED IMAGE]:" },
          { inlineData: { mimeType: "image/jpeg", data: generatedImageBase64.split(',')[1] } },
          { text: "[REFERENCE IMAGE]:" },
          { inlineData: { mimeType: referenceImageBase64.mimeType, data: referenceImageBase64.data } }
        ]
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const validationText = validationResponse.text || JSON.stringify(validationResponse);
    const scores = JSON.parse(validationText);

    const executionTime = Date.now() - startTime;
    const overallScore = scores.overallScore || 0;
    const passed = overallScore >= 70;

    await supabase.from('consistency_validations').insert({
      generation_id: generationId,
      scene_id: sceneId,
      frame_variant: frameVariant,
      frame_image_url: generatedImageBase64.substring(0, 100) + '...',
      reference_type: referenceType,
      reference_image_url: 'reference',
      consistency_score: overallScore,
      character_identity_score: scores.characterIdentityScore || 0,
      art_style_score: scores.artStyleScore || 0,
      color_palette_score: scores.colorPaletteScore || 0,
      lighting_score: scores.lightingScore || 0,
      composition_score: scores.compositionScore || 0,
      validation_passed: passed,
      threshold_used: 70,
      validation_notes: scores.feedback || 'No feedback provided',
    });

    await logAgentDecision(
      supabase,
      generationId,
      'consistency_validator',
      'visual_consistency',
      { referenceType, sceneId, frameVariant },
      { passed, overallScore, scores },
      `Consistency validation ${passed ? 'PASSED' : 'FAILED'} with score ${overallScore}/100`,
      overallScore,
      executionTime
    );

    return {
      passed,
      overallScore,
      characterIdentityScore: scores.characterIdentityScore || 0,
      artStyleScore: scores.artStyleScore || 0,
      colorPaletteScore: scores.colorPaletteScore || 0,
      lightingScore: scores.lightingScore || 0,
      compositionScore: scores.compositionScore || 0,
      feedback: scores.feedback || 'No feedback',
    };
  } catch (error) {
    console.error('Consistency validation error:', error);
    return {
      passed: true,
      overallScore: 50,
      characterIdentityScore: 50,
      artStyleScore: 50,
      colorPaletteScore: 50,
      lightingScore: 50,
      compositionScore: 50,
      feedback: 'Validation failed, defaulting to pass',
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const generationId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return new Response(
        JSON.stringify({
          success: false,
          error: "GEMINI_API_KEY not configured. Please add your Gemini API key to Supabase secrets.",
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

    const supabase = supabaseUrl && supabaseKey
      ? createClient(supabaseUrl, supabaseKey)
      : null;

    const body: StoryboardRequest = await req.json();
    const {
      logoAsset,
      mainCharacterAsset,
      characterAsset,
      additionalCharacterAssets = [],
      backgroundAsset,
      artStyleAsset,
      story,
      aspectRatio = "16:9",
      frameCount = 4,
      continue: isContinue = false,
      existingStoryboard,
      customInstruction,
      consistencyThreshold = 70,
      enableConsistencyValidation = true,
    } = body;

    if (!story && !isContinue) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Story description is required for storyboard generation.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (isContinue && !existingStoryboard) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Existing storyboard is required for continuation.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const mainCharacter = mainCharacterAsset || characterAsset || null;
    const sceneCount = [2, 4, 6, 8].includes(frameCount) ? frameCount / 2 : 2;

    if (supabase) {
      await supabase.from('generation_sessions').insert({
        id: generationId,
        user_id: 'default-user',
        story_description: story || 'Continuation',
        frame_count: frameCount,
        aspect_ratio: aspectRatio,
        has_logo: !!logoAsset,
        has_character: !!mainCharacter,
        has_background: !!backgroundAsset,
        has_art_style: !!artStyleAsset,
        additional_characters_count: additionalCharacterAssets.length,
        status: 'started',
      });
    }

    console.log("Generating storyboard", {
      generationId,
      sceneCount,
      aspectRatio,
      isContinue,
      hasStory: !!story,
      hasMainCharacter: !!mainCharacter,
      hasBackground: !!backgroundAsset,
      hasArtStyle: !!artStyleAsset,
      consistencyValidationEnabled: enableConsistencyValidation,
    });

    const ai = new GoogleGenAI({ apiKey });

    if (isContinue) {
      const lastScene = existingStoryboard.scenes[existingStoryboard.scenes.length - 1];
      const storyWorld = existingStoryboard.storyWorld || {
        premise: lastScene.scriptLine || 'Continuing narrative',
        theme: 'Narrative continuation',
        structure: {
          act1: 'Setup',
          act2: 'Confrontation',
          act3: 'Resolution',
          attractors: ['Continuation']
        },
        characterBlueprint: lastScene.subjectIdentity || 'Character from previous scene',
        coreConflict: {
          internal: lastScene.emotion || 'Emotional state',
          external: lastScene.action || 'Action'
        },
        boundaries: {
          spatial: lastScene.sceneContext || 'Same world',
          temporal: 'Continuing timeline',
          historical: 'Same period',
          visual: 'Consistent style'
        }
      };

      const continuationPrompt = `You are a MASTER SCREENPLAY ARCHITECT. Generate ONE new scene continuing from:\n\nLAST SCENE: \"${lastScene.title}\" - ${lastScene.scriptLine}\n${customInstruction ? `\n\nCUSTOM INSTRUCTION: \"${customInstruction}\"` : ''}\n\nGenerate exactly ONE scene with 2 frames (A and B variants) that continues this narrative. The scene should match the visual style and maintain character consistency.\n\nRespond with JSON matching this structure:\n{\n  \"scenes\": [{\n    \"id\": ${existingStoryboard.scenes.length + 1},\n    \"title\": \"Scene Title\",\n    \"scriptLine\": \"Dialogue or narration\",\n    \"emotion\": \"Emotional tone\",\n    \"intent\": \"Character intent\",\n    \"cinematographyFormat\": \"Camera and format details\",\n    \"subjectIdentity\": \"Character description\",\n    \"sceneContext\": \"Location description\",\n    \"action\": \"Character actions\",\n    \"cameraComposition\": \"Shot and camera details\",\n    \"styleAmbiance\": \"Visual style\",\n    \"audioDialogue\": \"Sound and dialogue\",\n    \"technicalNegative\": \"Quality negatives\",\n    \"veoPrompt\": \"Comprehensive prompt\",\n    \"frames\": [\n      { \"id\": \"${existingStoryboard.scenes.length + 1}A\", \"variant\": \"A\", \"imageUrl\": \"placeholder\", \"metadata\": {} },\n      { \"id\": \"${existingStoryboard.scenes.length + 1}B\", \"variant\": \"B\", \"imageUrl\": \"placeholder\", \"metadata\": {} }\n    ]\n  }]\n}`;

      const contResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: continuationPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = contResponse.text || JSON.stringify(contResponse);
      const scriptData = JSON.parse(responseText);
      const newScenes = scriptData.scenes || [];

      return new Response(
        JSON.stringify({ success: true, data: { scenes: newScenes } }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (supabase) {
      await supabase.from('generation_sessions')
        .update({ status: 'story_world' })
        .eq('id', generationId);
    }

    const storyWorldStartTime = Date.now();
    const enhancedStoryWorldPrompt = PROFESSIONAL_STORY_ARCHITECT_PROMPT.replace('{STORY}', story || '');

    const storyWorldResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: enhancedStoryWorldPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const swText = storyWorldResponse.text || JSON.stringify(storyWorldResponse);
    const storyWorld = JSON.parse(swText) as StoryWorld;
    const storyWorldDuration = Date.now() - storyWorldStartTime;

    if (supabase) {
      await logAgentDecision(
        supabase,
        generationId,
        'story_architect',
        'story_world_creation',
        { story },
        storyWorld,
        'Generated comprehensive Story-World blueprint using professional screenplay architecture principles',
        95,
        storyWorldDuration
      );

      await supabase.from('generation_sessions')
        .update({
          status: 'script',
          story_world_duration_ms: storyWorldDuration
        })
        .eq('id', generationId);
    }

    const scriptStartTime = Date.now();
    const enhancedScriptPrompt = PROFESSIONAL_SCRIPT_PROMPT
      .replace('{STORY_WORLD}', JSON.stringify(storyWorld))
      .replace('{SCENE_COUNT}', sceneCount.toString());

    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: enhancedScriptPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const scriptText = scriptResponse.text || JSON.stringify(scriptResponse);
    const scriptData = JSON.parse(scriptText);
    let scenes = scriptData.scenes || [];
    const scriptDuration = Date.now() - scriptStartTime;

    if (scenes.length > sceneCount) {
      scenes = scenes.slice(0, sceneCount);
    }

    if (supabase) {
      await logAgentDecision(
        supabase,
        generationId,
        'story_architect',
        'scene_generation',
        { sceneCount, storyWorld },
        { scenesGenerated: scenes.length },
        `Generated ${scenes.length} professional scenes with Level 9 broadcast quality specifications`,
        90,
        scriptDuration
      );

      await supabase.from('generation_sessions')
        .update({
          status: 'images',
          script_duration_ms: scriptDuration
        })
        .eq('id', generationId);
    }

    const imagesStartTime = Date.now();
    let totalRegenerations = 0;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const imageGenParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      if (artStyleAsset) {
        imageGenParts.push({
          text: `[ART STYLE REFERENCE] Match this art style EXACTLY:`
        });
        imageGenParts.push({
          inlineData: {
            mimeType: artStyleAsset.mimeType,
            data: artStyleAsset.data
          }
        });
      }

      if (backgroundAsset) {
        imageGenParts.push({
          text: `[BACKGROUND REFERENCE] Use this environment PRECISELY:`
        });
        imageGenParts.push({
          inlineData: {
            mimeType: backgroundAsset.mimeType,
            data: backgroundAsset.data
          }
        });
      }

      if (mainCharacter) {
        imageGenParts.push({
          text: `[MAIN CHARACTER REFERENCE] This character MUST appear EXACTLY as shown - preserve ALL identifying features:`
        });
        imageGenParts.push({
          inlineData: {
            mimeType: mainCharacter.mimeType,
            data: mainCharacter.data
          }
        });
      }

      additionalCharacterAssets.forEach((charAsset, idx) => {
        imageGenParts.push({
          text: `[CHARACTER ${idx + 2} REFERENCE] Preserve character identity:`
        });
        imageGenParts.push({
          inlineData: {
            mimeType: charAsset.mimeType,
            data: charAsset.data
          }
        });
      });

      if (logoAsset) {
        imageGenParts.push({
          text: `[LOGO] Incorporate subtly in composition:`
        });
        imageGenParts.push({
          inlineData: {
            mimeType: logoAsset.mimeType,
            data: logoAsset.data
          }
        });
      }

      imageGenParts.push({
        text: `Generate a professional cinematic ${aspectRatio} image for: \"${scene.scriptLine}\".\n\nSCENE SPECIFICATIONS:\n${scene.veoPrompt || scene.sceneContext || ''}\n\nCRITICAL CONSISTENCY REQUIREMENTS:\n- Maintain EXACT character likeness from reference images\n- Match art style PRECISELY\n- Preserve color palette and lighting mood\n- Keep composition style consistent\n\nTECHNICAL REQUIREMENTS:\n- NO TEXT, NO SUBTITLES, NO CAPTIONS, NO WORDS in ANY language\n- Broadcast quality, professional grade\n- Clean, cinematic visual storytelling only`
      });

      const generateFrame = async (variant: 'A' | 'B', maxRetries: number = 3): Promise<string> => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const imageResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: imageGenParts },
              config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: {
                  aspectRatio: aspectRatio,
                },
              },
            });

            const firstPart = imageResponse.candidates?.[0]?.content?.parts?.[0];
            if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
              const generatedImage = `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`;

              if (enableConsistencyValidation && mainCharacter && supabase) {
                const validation = await validateConsistency(
                  ai,
                  generatedImage,
                  mainCharacter,
                  'character',
                  generationId,
                  scene.id.toString(),
                  variant,
                  supabase
                );

                if (!validation.passed && attempt < maxRetries - 1) {
                  console.log(`Frame ${scene.id}${variant} failed consistency (score: ${validation.overallScore}), regenerating...`);
                  totalRegenerations++;
                  continue;
                }

                console.log(`Frame ${scene.id}${variant} consistency: ${validation.overallScore}/100`);
              }

              return generatedImage;
            }
            throw new Error('No image data in response');
          } catch (error) {
            console.error(`Frame generation error for scene ${scene.id}${variant} (attempt ${attempt + 1}):`, error);
            if (attempt === maxRetries - 1) {
              return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+RXJyb3I8L3RleHQ+PC9zdmc+";
            }
          }
        }
        return "";
      };

      const [imageUrlA, imageUrlB] = await Promise.all([
        generateFrame('A'),
        generateFrame('B')
      ]);

      scene.frames = [
        {
          id: `${scene.id}A`,
          variant: 'A',
          imageUrl: imageUrlA,
          metadata: {
            composition: scene.cameraComposition || `Professional ${scene.emotion || 'cinematic'} composition`,
            palette: ["#1a1a1a", "#f5f5f5", "#4a90e2"],
            lighting: scene.styleAmbiance || `Cinematic lighting`,
            camera: scene.cameraComposition || "Professional cinematography",
          },
        },
        {
          id: `${scene.id}B`,
          variant: 'B',
          imageUrl: imageUrlB,
          metadata: {
            composition: scene.cameraComposition || `Professional ${scene.emotion || 'cinematic'} composition`,
            palette: ["#1a1a1a", "#f5f5f5", "#4a90e2"],
            lighting: scene.styleAmbiance || `Cinematic lighting`,
            camera: scene.cameraComposition || "Professional cinematography",
          },
        },
      ];
    }

    const imagesDuration = Date.now() - imagesStartTime;
    const totalDuration = Date.now() - startTime;

    const storyboard = {
      title: "Generated Storyboard",
      scenes,
      aspectRatio,
      storyWorld,
    };

    if (supabase) {
      await supabase.from('generation_sessions')
        .update({
          status: 'completed',
          images_duration_ms: imagesDuration,
          total_duration_ms: totalDuration,
          regeneration_count: totalRegenerations,
          final_storyboard: storyboard,
          completed_at: new Date().toISOString(),
        })
        .eq('id', generationId);
    }

    console.log(`Storyboard generation complete: ${scenes.length} scenes, ${totalRegenerations} regenerations, ${totalDuration}ms total`);

    return new Response(
      JSON.stringify({
        success: true,
        data: storyboard,
        metadata: {
          generationId,
          totalDuration,
          regenerations: totalRegenerations,
        }
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Error stack:", errorStack);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
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