import React, { useState, useCallback, useEffect, useRef } from 'react';
import { YouTubeVideo, VideoAnalysis, ExtractedAssets } from '../types';
import WizardProgress from './WizardProgress';
import WizardNavigation from './WizardNavigation';
import WizardStep from './WizardStep';
import VideoPreviewStep from './VideoToStoryboardWizard/VideoPreviewStep';
import AnalysisStep from './VideoToStoryboardWizard/AnalysisStep';
import FrameSelectionStep from './VideoToStoryboardWizard/FrameSelectionStep';
import AssetsStep from './VideoToStoryboardWizard/AssetsStep';
import ReviewStep from './VideoToStoryboardWizard/ReviewStep';
import { analyzeVideo } from '../services/videoAnalysisService';
import { extractAssetsFromVideo } from '../services/videoAssetExtraction';
import { logInfo, logError } from '../utils/logger';

interface VideoToStoryboardWizardProps {
  video: YouTubeVideo;
  onComplete: (data: {
    video: YouTubeVideo;
    analysis: VideoAnalysis;
    selectedFrames: number[];
    extractedAssets: ExtractedAssets;
    customStory?: string;
    logoFile?: File | null;
    characterFile?: File | null;
    backgroundFile?: File | null;
    artStyleFile?: File | null;
    characterFiles?: File[];
    aspectRatio: '16:9' | '9:16';
    frameCount: number;
    visualStylePrompt?: string;
    selectedArtStyleFrame?: number | null;
    selectedBackgroundFrame?: number | null;
  }) => void;
  onCancel: () => void;
  persistedState?: VideoWizardPersistentState | null;
  onStateChange?: (state: VideoWizardPersistentState) => void;
  sessionId?: string | null;
  onRequestDock?: () => void;
}

const STEP_TITLES = ['Video Preview', 'Analysis', 'Frame Selection', 'Assets', 'Review'];

const createDefaultFormData = (): VideoWizardFormData => ({
  logoFile: null,
  characterFile: null,
  backgroundFile: null,
  artStyleFile: null,
  characterFiles: [],
  logoPreview: null,
  characterPreview: null,
  backgroundPreview: null,
  artStylePreview: null,
  characterPreviews: [],
  customStory: '',
  aspectRatio: '16:9',
  frameCount: 4,
  selectedFrames: [],
  visualStylePrompt: '',
  selectedArtStyleFrame: null,
  selectedBackgroundFrame: null,
});

const cloneFormData = (formData: VideoWizardFormData): VideoWizardFormData => ({
  ...formData,
  characterFiles: [...(formData.characterFiles || [])],
  characterPreviews: [...(formData.characterPreviews || [])],
  selectedFrames: [...(formData.selectedFrames || [])],
});

export interface VideoWizardFormData {
  logoFile: File | null;
  characterFile: File | null;
  backgroundFile: File | null;
  artStyleFile: File | null;
  characterFiles: File[];
  logoPreview: string | null;
  characterPreview: string | null;
  backgroundPreview: string | null;
  artStylePreview: string | null;
  characterPreviews: string[];
  customStory: string;
  aspectRatio: '16:9' | '9:16';
  frameCount: number;
  selectedFrames: number[];
  visualStylePrompt: string;
  selectedArtStyleFrame: number | null;
  selectedBackgroundFrame: number | null;
}

export interface VideoWizardPersistentState {
  currentStep: number;
  formData: VideoWizardFormData;
  analysis: VideoAnalysis | null;
  extractedAssets: ExtractedAssets | null;
  isAnalyzing: boolean;
  isExtracting: boolean;
  error: string | null;
  videoId: string;
}

const VideoToStoryboardWizard: React.FC<VideoToStoryboardWizardProps> = ({
  video,
  onComplete,
  onCancel,
  persistedState,
  onStateChange,
  sessionId,
  onRequestDock,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAssets | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<VideoWizardFormData>(createDefaultFormData);
  const hydratedSessionRef = useRef<string | null>(null);

  const hydrateFromState = useCallback(
    (state: VideoWizardPersistentState | null) => {
      if (!state || state.videoId !== video.id) {
        setCurrentStep(1);
        setFormData(createDefaultFormData());
        setAnalysis(null);
        setExtractedAssets(null);
        setIsAnalyzing(false);
        setIsExtracting(false);
        setError(null);
        return;
      }

      setCurrentStep(state.currentStep || 1);
      setFormData(cloneFormData(state.formData));
      setAnalysis(state.analysis || null);
      setExtractedAssets(state.extractedAssets || null);
      setIsAnalyzing(!!state.isAnalyzing);
      setIsExtracting(!!state.isExtracting);
      setError(state.error || null);
    },
    [video.id]
  );

  useEffect(() => {
    if (!sessionId) return;
    if (hydratedSessionRef.current === sessionId) {
      return;
    }

    hydrateFromState(persistedState || null);
    hydratedSessionRef.current = sessionId;
  }, [persistedState, sessionId, hydrateFromState]);

  useEffect(() => {
    if (!onStateChange) return;
    if (sessionId && hydratedSessionRef.current !== sessionId) {
      return;
    }

    onStateChange({
      currentStep,
      formData,
      analysis,
      extractedAssets,
      isAnalyzing,
      isExtracting,
      error,
      videoId: video.id,
    });
  }, [
    currentStep,
    formData,
    analysis,
    extractedAssets,
    isAnalyzing,
    isExtracting,
    error,
    video.id,
    onStateChange,
    sessionId,
  ]);

  const handleAnalyzeVideo = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      logInfo('Starting video analysis', {
        category: 'USER_ACTION',
        component: 'VideoToStoryboardWizard',
        action: 'analyze-video',
        videoId: video.id,
      });
      const result = await analyzeVideo(video.id);
      if (!result) {
        throw new Error('Analysis returned no result');
      }
      setAnalysis(result);
      // Initialize visualStylePrompt from analysis
      if (result.visualStyle) {
        const visualStyleParts: string[] = [];
        if (result.visualStyle.composition) {
          visualStyleParts.push(`Composition: ${result.visualStyle.composition}`);
        }
        if (result.visualStyle.lighting) {
          visualStyleParts.push(`Lighting: ${result.visualStyle.lighting}`);
        }
        if (result.visualStyle.dominantColors && Array.isArray(result.visualStyle.dominantColors) && result.visualStyle.dominantColors.length > 0) {
          visualStyleParts.push(`Colors: ${result.visualStyle.dominantColors.join(', ')}`);
        }
        const visualStylePrompt = visualStyleParts.join('\n');
        setFormData(prev => ({ ...prev, visualStylePrompt }));
      }
      // Auto-select frames from suggested storyboard
      if (result.suggestedStoryboard?.scenes && Array.isArray(result.suggestedStoryboard.scenes)) {
        setFormData(prev => {
          const frames = result.suggestedStoryboard.scenes
            .slice(0, prev.frameCount)
            .map(s => s.timestamp);
          return { ...prev, selectedFrames: frames };
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze video';
      setError(errorMessage);
      logError('Video analysis failed', err instanceof Error ? err : new Error(errorMessage), {
        category: 'ERROR',
        component: 'VideoToStoryboardWizard',
        videoId: video.id,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [video.id]);

  // Auto-analyze video when reaching step 2
  useEffect(() => {
    if (currentStep === 2 && !analysis && !isAnalyzing) {
      handleAnalyzeVideo();
    }
  }, [currentStep, analysis, isAnalyzing, handleAnalyzeVideo]);

  const handleExtractAssets = useCallback(async () => {
    if (formData.selectedFrames.length === 0) return;
    setIsExtracting(true);
    setError(null);
    try {
      logInfo('Starting asset extraction', {
        category: 'USER_ACTION',
        component: 'VideoToStoryboardWizard',
        action: 'extract-assets',
        videoId: video.id,
        framesCount: formData.selectedFrames.length,
      });
      const result = await extractAssetsFromVideo(video.id, formData.selectedFrames);
      setExtractedAssets(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract assets';
      setError(errorMessage);
      logError('Asset extraction failed', err instanceof Error ? err : new Error(errorMessage), {
        category: 'ERROR',
        component: 'VideoToStoryboardWizard',
        videoId: video.id,
      });
    } finally {
      setIsExtracting(false);
    }
  }, [video.id, formData.selectedFrames]);

  // Auto-extract assets when frames are selected
  useEffect(() => {
    if (currentStep === 4 && formData.selectedFrames.length > 0 && !extractedAssets && !isExtracting) {
      handleExtractAssets();
    }
  }, [currentStep, formData.selectedFrames, extractedAssets, isExtracting, handleExtractAssets]);

  const handleNext = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - complete wizard
      if (!analysis) {
        setError('Please complete video analysis first');
        return;
      }
      onComplete({
        video,
        analysis,
        selectedFrames: formData.selectedFrames,
        extractedAssets: extractedAssets || {
          characters: [],
          backgrounds: [],
          styleReference: { image: video.thumbnail, description: 'Video thumbnail' },
        },
        customStory: formData.customStory,
        logoFile: formData.logoFile,
        characterFile: formData.characterFile,
        backgroundFile: formData.backgroundFile,
        artStyleFile: formData.artStyleFile,
        characterFiles: formData.characterFiles,
        aspectRatio: formData.aspectRatio,
        frameCount: formData.frameCount,
        visualStylePrompt: formData.visualStylePrompt,
        selectedArtStyleFrame: formData.selectedArtStyleFrame,
        selectedBackgroundFrame: formData.selectedBackgroundFrame,
      });
    }
  }, [currentStep, analysis, extractedAssets, formData, video, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onCancel();
    }
  }, [currentStep, onCancel]);

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true; // Video preview - always can proceed
      case 2:
        return !!analysis && !isAnalyzing; // Analysis must be complete
      case 3:
        return formData.selectedArtStyleFrame !== null && formData.selectedArtStyleFrame !== undefined && 
               formData.selectedBackgroundFrame !== null && formData.selectedBackgroundFrame !== undefined; // Need both frames selected
      case 4:
        return true; // Assets - optional
      case 5:
        return true; // Review - always can proceed
      default:
        return false;
    }
  };

  // Safety check after hooks
  if (!video || !video.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600">Error: Invalid video data</p>
          <button onClick={onCancel} className="mt-4 px-4 py-2 bg-gray-200 rounded">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Ensure we have valid step titles
  const stepTitles = STEP_TITLES && STEP_TITLES.length === 5 ? STEP_TITLES : ['Video Preview', 'Analysis', 'Frame Selection', 'Assets', 'Review'];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <WizardProgress currentStep={currentStep} totalSteps={5} stepTitles={stepTitles} />

      {onRequestDock && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Video Wizard</p>
            <p className="font-semibold text-gray-900">{video.title}</p>
            <p className="text-xs text-gray-500">Progress auto-saves when you return to the dashboard.</p>
          </div>
          <button
            onClick={onRequestDock}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h11M3 6h11m-7 8h7m2 4l4-4m0 0l-4-4m4 4H10" />
            </svg>
            Return to Dashboard
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-32">
        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <WizardStep
          isActive={currentStep === 1}
          title="Video Preview"
          description="Review the video details before creating your storyboard"
        >
          <VideoPreviewStep video={video} />
        </WizardStep>

        <WizardStep
          isActive={currentStep === 2}
          title="Content Analysis"
          description="Analyzing video content to extract script, key moments, and visual elements"
        >
          <AnalysisStep
            video={video}
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyzeVideo}
            error={error}
          />
        </WizardStep>

        <WizardStep
          isActive={currentStep === 3}
          title="Frame Selection"
          description="Select key moments from the video to create storyboard frames"
        >
          <FrameSelectionStep
            video={video}
            analysis={analysis}
            selectedFrames={formData.selectedFrames}
            onFramesChange={(frames) => setFormData(prev => ({ ...prev, selectedFrames: frames }))}
            frameCount={formData.frameCount}
            onFrameCountChange={(count) => setFormData(prev => ({ ...prev, frameCount: count }))}
            aspectRatio={formData.aspectRatio}
            onAspectRatioChange={(ratio) => setFormData(prev => ({ ...prev, aspectRatio: ratio }))}
            selectedArtStyleFrame={formData.selectedArtStyleFrame}
            selectedBackgroundFrame={formData.selectedBackgroundFrame}
            onArtStyleFrameChange={(frame) => setFormData(prev => ({ ...prev, selectedArtStyleFrame: frame }))}
            onBackgroundFrameChange={(frame) => setFormData(prev => ({ ...prev, selectedBackgroundFrame: frame }))}
          />
        </WizardStep>

        <WizardStep
          isActive={currentStep === 4}
          title="Assets Setup"
          description="Upload or use extracted assets for your storyboard"
        >
          <AssetsStep
            extractedAssets={extractedAssets}
            isExtracting={isExtracting}
            formData={formData}
            onFormDataChange={setFormData}
            onExtract={handleExtractAssets}
            analysis={analysis}
          />
        </WizardStep>

        <WizardStep
          isActive={currentStep === 5}
          title="Review & Create"
          description="Review your selections and create the storyboard"
        >
          <ReviewStep
            video={video}
            analysis={analysis}
            selectedFrames={formData.selectedFrames}
            extractedAssets={extractedAssets}
            formData={formData}
            customStory={formData.customStory}
            onCustomStoryChange={(story) => setFormData(prev => ({ ...prev, customStory: story }))}
          />
        </WizardStep>
      </div>

      <WizardNavigation
        currentStep={currentStep}
        totalSteps={5}
        onBack={handleBack}
        onNext={handleNext}
        onSaveDraft={() => {}} // Not implemented for video wizard
        canGoBack={true}
        canGoNext={canGoNext()}
        isLastStep={currentStep === 5}
        nextButtonText={currentStep === 5 ? 'Create Storyboard' : undefined}
      />
    </div>
  );
};

export default VideoToStoryboardWizard;

