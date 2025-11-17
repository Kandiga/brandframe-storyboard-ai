// Enhanced Consistency Module for BrandFrame Studio
// This module provides ultra-detailed visual analysis and consistency enforcement

export interface DetailedVisualAnalysis {
  character: {
    clothing: string[];
    accessories: string[];
    hairstyle: string;
    facialFeatures: string[];
    bodyType: string;
    pose: string;
  };
  environment: {
    background: string;
    architecture: string[];
    lighting: string;
    colorPalette: string[];
    atmosphere: string;
    props: string[];
  };
  technical: {
    cameraAngle: string;
    composition: string;
    depth: string;
  };
}

export async function extractDetailedVisualInfo(
  ai: any,
  imageAsset: { mimeType: string; data: string },
  imageType: 'character' | 'background' | 'art_style'
): Promise<DetailedVisualAnalysis> {
  const analysisPrompt = `You are a FORENSIC VISUAL ANALYST. Analyze this image with EXTREME DETAIL.

Extract ALL visual information:

## CHARACTER (if present):
- **Clothing**: List EVERY item of clothing, colors, patterns, textures, style (e.g., "black leather jacket with silver zippers, dark blue jeans, white sneakers")
- **Accessories**: List ALL accessories visible (jewelry, watches, bags, glasses, etc.)
- **Hairstyle**: Exact description (length, color, style, texture)
- **Facial Features**: Detailed face description (eye color, nose shape, face structure, expressions)
- **Body Type**: Build, height estimate, posture
- **Pose**: Exact body position and gesture

## ENVIRONMENT:
- **Background**: Detailed description of what's behind the subject
- **Architecture**: All architectural elements (walls, floors, ceilings, structures)
- **Lighting**: Light sources, direction, quality, shadows, highlights
- **Color Palette**: ALL dominant colors with hex values if possible
- **Atmosphere**: Mood, weather, time of day, environmental effects (fog, rain, etc.)
- **Props**: ALL objects visible in the scene

## TECHNICAL:
- **Camera Angle**: POV, height, distance
- **Composition**: Framing, rule of thirds, balance
- **Depth**: Foreground, midground, background separation

Respond with ONLY valid JSON:
{
  "character": {
    "clothing": ["item1", "item2", ...],
    "accessories": ["item1", ...],
    "hairstyle": "description",
    "facialFeatures": ["feature1", ...],
    "bodyType": "description",
    "pose": "description"
  },
  "environment": {
    "background": "description",
    "architecture": ["element1", ...],
    "lighting": "description",
    "colorPalette": ["#color1", ...],
    "atmosphere": "description",
    "props": ["prop1", ...]
  },
  "technical": {
    "cameraAngle": "description",
    "composition": "description",
    "depth": "description"
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro-vision',
      contents: {
        parts: [
          { text: analysisPrompt },
          { inlineData: { mimeType: imageAsset.mimeType, data: imageAsset.data } }
        ]
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const analysisText = response.text || JSON.stringify(response);
    return JSON.parse(analysisText);
  } catch (error) {
    console.error('Failed to extract detailed visual info:', error);
    return {
      character: {
        clothing: [],
        accessories: [],
        hairstyle: 'Unknown',
        facialFeatures: [],
        bodyType: 'Unknown',
        pose: 'Unknown'
      },
      environment: {
        background: 'Unknown',
        architecture: [],
        lighting: 'Unknown',
        colorPalette: [],
        atmosphere: 'Unknown',
        props: []
      },
      technical: {
        cameraAngle: 'Unknown',
        composition: 'Unknown',
        depth: 'Unknown'
      }
    };
  }
}

export function buildEnhancedConsistencyPrompt(
  visualAnalysis: DetailedVisualAnalysis,
  sceneDescription: string,
  aspectRatio: string
): string {
  const clothingList = visualAnalysis.character.clothing.join(', ');
  const accessoriesList = visualAnalysis.character.accessories.length > 0
    ? visualAnalysis.character.accessories.join(', ')
    : 'none';
  const propsList = visualAnalysis.environment.props.length > 0
    ? visualAnalysis.environment.props.join(', ')
    : 'none';
  const architectureList = visualAnalysis.environment.architecture.join(', ');
  const colorPalette = visualAnalysis.environment.colorPalette.join(', ');

  // Extract frame position indicators
  const isFirstFrame = sceneDescription.includes('[FIRST FRAME - OPENING SHOT]');
  const isLastFrame = sceneDescription.includes('[LAST FRAME - CLOSING SHOT]');
  const cleanDescription = sceneDescription
    .replace(/\[FIRST FRAME - OPENING SHOT\]\s*/g, '')
    .replace(/\[LAST FRAME - CLOSING SHOT\]\s*/g, '');

  let framePositionNote = '';
  if (isFirstFrame) {
    framePositionNote = '\n[FRAME POSITION: FIRST FRAME - OPENING SHOT]\nThis is the opening frame. Establish visual tone, introduce main character/setting, create strong opening hook.\n';
  } else if (isLastFrame) {
    framePositionNote = '\n[FRAME POSITION: LAST FRAME - CLOSING SHOT]\nThis is the closing frame. Provide resolution, emotional closure, memorable final image.\n';
  }

  return `Generate a professional cinematic ${aspectRatio} image with ABSOLUTE CONSISTENCY to these specifications:
${framePositionNote}
${cleanDescription}

═══════════════════════════════════════════════════════════
MANDATORY VISUAL CONSISTENCY REQUIREMENTS - DO NOT DEVIATE
═══════════════════════════════════════════════════════════

## CHARACTER CONSISTENCY (CRITICAL - MUST MATCH EXACTLY):
✓ CLOTHING (EXACT MATCH REQUIRED):
  ${clothingList}
  [CRITICAL: Character MUST wear these EXACT items. NO substitutions allowed]

✓ ACCESSORIES (EXACT MATCH REQUIRED):
  ${accessoriesList}
  [CRITICAL: Include ONLY these accessories. Nothing more, nothing less]

✓ HAIRSTYLE (EXACT MATCH REQUIRED):
  ${visualAnalysis.character.hairstyle}
  [CRITICAL: Hair must look IDENTICAL - same length, color, style]

✓ FACIAL FEATURES (EXACT MATCH REQUIRED):
  ${visualAnalysis.character.facialFeatures.join(', ')}
  [CRITICAL: Face MUST be identical. Same person, same features]

✓ BODY TYPE & POSE:
  ${visualAnalysis.character.bodyType} - ${visualAnalysis.character.pose}
  [CRITICAL: Same body proportions and general posture]

## ENVIRONMENT CONSISTENCY (CRITICAL - MUST MATCH EXACTLY):
✓ BACKGROUND (EXACT MATCH REQUIRED):
  ${visualAnalysis.environment.background}
  [CRITICAL: Background must be IDENTICAL or extremely similar]

✓ ARCHITECTURE (EXACT MATCH REQUIRED):
  ${architectureList}
  [CRITICAL: Same architectural style, materials, and structures]

✓ LIGHTING (EXACT MATCH REQUIRED):
  ${visualAnalysis.environment.lighting}
  [CRITICAL: Same light sources, direction, and quality]

✓ COLOR PALETTE (EXACT MATCH REQUIRED):
  ${colorPalette}
  [CRITICAL: Use these EXACT colors throughout the image]

✓ ATMOSPHERE (EXACT MATCH REQUIRED):
  ${visualAnalysis.environment.atmosphere}
  [CRITICAL: Same mood, weather, time of day]

✓ PROPS (EXACT MATCH REQUIRED):
  ${propsList}
  [CRITICAL: Include relevant props from reference]

## TECHNICAL CONSISTENCY:
✓ Camera Angle: ${visualAnalysis.technical.cameraAngle}
✓ Composition: ${visualAnalysis.technical.composition}
✓ Depth: ${visualAnalysis.technical.depth}

═══════════════════════════════════════════════════════════
QUALITY REQUIREMENTS
═══════════════════════════════════════════════════════════
• NO TEXT, NO SUBTITLES, NO CAPTIONS, NO WORDS in ANY language
• Broadcast quality, professional grade
• Clean, cinematic visual storytelling
• Sharp focus on character
• Natural, realistic rendering

REMEMBER: This is frame ${sceneDescription.includes('Frame B') ? 'B' : 'A'} of the SAME scene.
Character clothing, accessories, hair, and background MUST be IDENTICAL to Frame A.
Only the character's ACTION/POSE changes between frames - NOTHING ELSE.`;
}
