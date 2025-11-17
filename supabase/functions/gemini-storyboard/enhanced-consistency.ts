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

/**
 * Validates if character analysis contains valid data
 */
export function isValidCharacterAnalysis(analysis: DetailedVisualAnalysis | null, imageType: 'character' | 'background' | 'art_style'): boolean {
  if (!analysis) return false;
  
  if (imageType === 'character') {
    // For character analysis, check if we have meaningful character data
    const hasValidClothing = analysis.character.clothing.length > 0;
    const hasValidHairstyle = analysis.character.hairstyle && analysis.character.hairstyle !== 'Unknown';
    const hasValidFacialFeatures = analysis.character.facialFeatures.length > 0;
    const hasValidBodyType = analysis.character.bodyType && analysis.character.bodyType !== 'Unknown';
    
    // At least 2 of these should be valid for a good character analysis
    const validCount = [hasValidClothing, hasValidHairstyle, hasValidFacialFeatures, hasValidBodyType].filter(Boolean).length;
    return validCount >= 2;
  }
  
  // For background/art_style, check environment data
  const hasValidBackground = analysis.environment.background && analysis.environment.background !== 'Unknown';
  const hasValidLighting = analysis.environment.lighting && analysis.environment.lighting !== 'Unknown';
  
  return hasValidBackground || hasValidLighting;
}

export async function extractDetailedVisualInfo(
  ai: any,
  imageAsset: { mimeType: string; data: string },
  imageType: 'character' | 'background' | 'art_style',
  retryCount: number = 0
): Promise<DetailedVisualAnalysis> {
  const maxRetries = 2;
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
    const analysis = JSON.parse(analysisText);
    
    // Validate the analysis result
    if (!isValidCharacterAnalysis(analysis, imageType) && retryCount < maxRetries) {
      console.warn(`Character analysis returned invalid data (attempt ${retryCount + 1}/${maxRetries + 1}), retrying...`, {
        imageType,
        characterData: {
          clothingCount: analysis.character?.clothing?.length || 0,
          hairstyle: analysis.character?.hairstyle,
          facialFeaturesCount: analysis.character?.facialFeatures?.length || 0,
          bodyType: analysis.character?.bodyType
        }
      });
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return extractDetailedVisualInfo(ai, imageAsset, imageType, retryCount + 1);
    }
    
    return analysis;
  } catch (error) {
    console.error(`Failed to extract detailed visual info (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
    
    // Retry on error if we haven't exceeded max retries
    if (retryCount < maxRetries) {
      console.log(`Retrying character analysis (attempt ${retryCount + 2}/${maxRetries + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return extractDetailedVisualInfo(ai, imageAsset, imageType, retryCount + 1);
    }
    
    // Return fallback data after all retries exhausted
    console.error(`All retry attempts exhausted for ${imageType} analysis, returning fallback data`);
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
  aspectRatio: string,
  hasCharacterImage: boolean = false,
  customInstruction?: string
): string {
  // Check if character analysis data is valid or if we need to rely on image reference
  const hasValidCharacterData = visualAnalysis.character.clothing.length > 0 ||
    (visualAnalysis.character.hairstyle && visualAnalysis.character.hairstyle !== 'Unknown') ||
    visualAnalysis.character.facialFeatures.length > 0 ||
    (visualAnalysis.character.bodyType && visualAnalysis.character.bodyType !== 'Unknown');
  
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

  // Build character consistency section based on data availability
  let characterConsistencySection = '';
  if (hasValidCharacterData) {
    // We have valid analysis data, use it
    characterConsistencySection = `## CHARACTER CONSISTENCY (CRITICAL - MUST MATCH EXACTLY):
✓ CLOTHING (EXACT MATCH REQUIRED):
  ${clothingList || 'See character reference image above'}
  [CRITICAL: Character MUST wear these EXACT items. NO substitutions allowed]

✓ ACCESSORIES (EXACT MATCH REQUIRED):
  ${accessoriesList}
  [CRITICAL: Include ONLY these accessories. Nothing more, nothing less]

✓ HAIRSTYLE (EXACT MATCH REQUIRED):
  ${visualAnalysis.character.hairstyle !== 'Unknown' ? visualAnalysis.character.hairstyle : 'See character reference image above'}
  [CRITICAL: Hair must look IDENTICAL - same length, color, style]

✓ FACIAL FEATURES (EXACT MATCH REQUIRED):
  ${visualAnalysis.character.facialFeatures.length > 0 ? visualAnalysis.character.facialFeatures.join(', ') : 'See character reference image above'}
  [CRITICAL: Face MUST be identical. Same person, same features]

✓ BODY TYPE & POSE:
  ${visualAnalysis.character.bodyType !== 'Unknown' ? `${visualAnalysis.character.bodyType} - ${visualAnalysis.character.pose}` : 'See character reference image above'}
  [CRITICAL: Same body proportions and general posture]`;
  } else if (hasCharacterImage) {
    // No valid analysis data, but we have character image - emphasize using it directly
    characterConsistencySection = `## CHARACTER CONSISTENCY (CRITICAL - MUST MATCH EXACTLY):
⚠️ CHARACTER ANALYSIS DATA UNAVAILABLE - USING DIRECT IMAGE REFERENCE

[CRITICAL INSTRUCTION]: The character reference image provided above is your PRIMARY and ONLY source for character appearance.

YOU MUST MATCH THE CHARACTER IMAGE EXACTLY:
✓ CLOTHING: Match EXACTLY what the character is wearing in the reference image
✓ ACCESSORIES: Include ALL accessories visible in the reference image
✓ HAIRSTYLE: Match the EXACT hairstyle (length, color, style, texture) from the reference
✓ FACIAL FEATURES: The face MUST be the EXACT SAME PERSON - same eyes, nose, face shape, features
✓ BODY TYPE: Match the EXACT body proportions, build, and posture from the reference
✓ POSE: While pose may vary, all other features MUST remain identical

[CRITICAL]: Look at the character reference image carefully. Every detail matters. The generated character MUST be recognizable as the SAME PERSON with the SAME appearance.`;
  } else {
    // No character image and no data - minimal instructions
    characterConsistencySection = `## CHARACTER CONSISTENCY:
[Note: No character reference provided. Generate character based on scene description.]`;
  }

  // Add custom instruction section if provided
  const customInstructionSection = customInstruction
    ? `\n\n═══════════════════════════════════════════════════════════\n🎯 USER'S CUSTOM INSTRUCTION (HIGHEST PRIORITY):\n═══════════════════════════════════════════════════════════\n"${customInstruction}"\n═══════════════════════════════════════════════════════════\n\n[CRITICAL]: This custom instruction is the USER'S SPECIFIC CREATIVE DIRECTION.\nIt MUST take ABSOLUTE PRIORITY in image generation.\nThe generated image MUST reflect and incorporate this instruction.\nEvery visual element, composition, and narrative element must align with this instruction.\n═══════════════════════════════════════════════════════════\n`
    : '';

  return `Generate a professional cinematic ${aspectRatio} image with ABSOLUTE CONSISTENCY to these specifications:
${framePositionNote}
${cleanDescription}
${customInstructionSection}

═══════════════════════════════════════════════════════════
MANDATORY VISUAL CONSISTENCY REQUIREMENTS - DO NOT DEVIATE
═══════════════════════════════════════════════════════════

${characterConsistencySection}

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
