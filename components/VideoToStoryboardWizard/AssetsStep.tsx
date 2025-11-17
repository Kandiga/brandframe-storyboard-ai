import React from 'react';
import { ExtractedAssets, VideoAnalysis } from '../../types';
import { VideoWizardFormData } from '../VideoToStoryboardWizard';
import ImageUpload from '../ImageUpload';

interface AssetsStepProps {
  extractedAssets: ExtractedAssets | null;
  isExtracting: boolean;
  formData: VideoWizardFormData;
  onFormDataChange: (data: VideoWizardFormData) => void;
  onExtract: () => void;
  analysis: VideoAnalysis | null;
}

const AssetsStep: React.FC<AssetsStepProps> = ({
  extractedAssets,
  isExtracting,
  formData,
  onFormDataChange,
  onExtract,
  analysis,
}) => {
  const handleLogoChange = (file: File | null) => {
    if (formData.logoPreview && formData.logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.logoPreview);
    }
    onFormDataChange({
      ...formData,
      logoFile: file,
      logoPreview: file ? URL.createObjectURL(file) : null,
    });
  };

  const handleCharacterChange = (file: File | null) => {
    if (formData.characterPreview && formData.characterPreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.characterPreview);
    }
    onFormDataChange({
      ...formData,
      characterFile: file,
      characterPreview: file ? URL.createObjectURL(file) : null,
      characterFiles: file ? [file] : [],
      characterPreviews: file ? [URL.createObjectURL(file)] : [],
    });
  };

  const handleBackgroundChange = (file: File | null) => {
    if (formData.backgroundPreview && formData.backgroundPreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.backgroundPreview);
    }
    onFormDataChange({
      ...formData,
      backgroundFile: file,
      backgroundPreview: file ? URL.createObjectURL(file) : null,
    });
  };

  const handleArtStyleChange = (file: File | null) => {
    if (formData.artStylePreview && formData.artStylePreview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.artStylePreview);
    }
    onFormDataChange({
      ...formData,
      artStyleFile: file,
      artStylePreview: file ? URL.createObjectURL(file) : null,
    });
  };

  const useExtractedCharacter = async (character: any) => {
    try {
      // Convert image URL to File if needed
      if (character.image.startsWith('http')) {
        const response = await fetch(character.image);
        const blob = await response.blob();
        const file = new File([blob], 'character.jpg', { type: blob.type });
        handleCharacterChange(file);
      }
    } catch (error) {
      console.error('Failed to load extracted character:', error);
    }
  };

  const useExtractedBackground = async (background: any) => {
    try {
      if (background.image.startsWith('http')) {
        const response = await fetch(background.image);
        const blob = await response.blob();
        const file = new File([blob], 'background.jpg', { type: blob.type });
        handleBackgroundChange(file);
      }
    } catch (error) {
      console.error('Failed to load extracted background:', error);
    }
  };

  const useExtractedStyle = async (style: any) => {
    try {
      if (style.image.startsWith('http')) {
        const response = await fetch(style.image);
        const blob = await response.blob();
        const file = new File([blob], 'style.jpg', { type: blob.type });
        handleArtStyleChange(file);
      }
    } catch (error) {
      console.error('Failed to load extracted style:', error);
    }
  };

  const handleVisualStylePromptChange = (value: string) => {
    onFormDataChange({
      ...formData,
      visualStylePrompt: value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Visual Style Prompt Editor */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Visual Style Description</h3>
        <p className="text-sm text-gray-600 mb-4">
          Edit the visual style description that was extracted from the video analysis. This will be used to guide the storyboard generation.
        </p>
        <textarea
          value={formData.visualStylePrompt}
          onChange={(e) => handleVisualStylePromptChange(e.target.value)}
          placeholder="Enter visual style description..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          rows={6}
        />
        {analysis && analysis.visualStyle && (
          <p className="text-xs text-gray-500 mt-2">
            Generated from: Composition, Lighting, and Colors analysis
          </p>
        )}
      </div>

      {/* Extracted Assets */}
      {extractedAssets && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Extracted Assets from Video</h3>
          
          {/* Characters */}
          {extractedAssets.characters && extractedAssets.characters.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Characters</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {extractedAssets.characters.map((char, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={char.image}
                      alt={char.description}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-xs text-gray-700 mb-2">{char.description}</p>
                      <button
                        onClick={() => useExtractedCharacter(char)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-2 rounded"
                      >
                        Use This
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backgrounds */}
          {extractedAssets.backgrounds && extractedAssets.backgrounds.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Backgrounds</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {extractedAssets.backgrounds.map((bg, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={bg.image}
                      alt={bg.description}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-xs text-gray-700 mb-2">{bg.description}</p>
                      <button
                        onClick={() => useExtractedBackground(bg)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-2 rounded"
                      >
                        Use This
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Style Reference */}
          {extractedAssets.styleReference && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Style Reference</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={extractedAssets.styleReference.image}
                  alt={extractedAssets.styleReference.description}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <p className="text-xs text-gray-700 mb-2">{extractedAssets.styleReference.description}</p>
                  <button
                    onClick={() => useExtractedStyle(extractedAssets.styleReference)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-2 rounded"
                  >
                    Use This Style
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Or Upload Your Own Assets</h3>
        <div className="space-y-6">
          <ImageUpload
            id="video-wizard-logo"
            title="Brand Logo (Optional)"
            subtitle="Your brand logo"
            buttonText="Upload Logo"
            onFileChange={handleLogoChange}
            previewUrl={formData.logoPreview}
          />

          <ImageUpload
            id="video-wizard-character"
            title="Main Character (Optional)"
            subtitle="Your main character reference"
            buttonText="Upload Character"
            onFileChange={handleCharacterChange}
            previewUrl={formData.characterPreview}
          />

          <ImageUpload
            id="video-wizard-background"
            title="Background (Optional)"
            subtitle="Background reference image"
            buttonText="Upload Background"
            onFileChange={handleBackgroundChange}
            previewUrl={formData.backgroundPreview}
          />

          <ImageUpload
            id="video-wizard-art-style"
            title="Art Style (Optional)"
            subtitle="Art style reference image"
            buttonText="Upload Art Style"
            onFileChange={handleArtStyleChange}
            previewUrl={formData.artStylePreview}
          />
        </div>
      </div>

      {!extractedAssets && !isExtracting && formData.selectedFrames.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm mb-2">
            Assets will be automatically extracted from selected frames. You can also upload your own assets above.
          </p>
          <button
            onClick={onExtract}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
          >
            Extract Assets Now
          </button>
        </div>
      )}

      {isExtracting && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Extracting assets from selected frames...</p>
        </div>
      )}
    </div>
  );
};

export default AssetsStep;

