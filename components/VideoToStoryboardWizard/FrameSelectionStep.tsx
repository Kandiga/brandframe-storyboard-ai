import React from 'react';
import { YouTubeVideo, VideoAnalysis } from '../../types';
import VideoFrameSelector from '../VideoFrameSelector';

interface FrameSelectionStepProps {
  video: YouTubeVideo;
  analysis: VideoAnalysis | null;
  selectedFrames: number[];
  onFramesChange: (frames: number[]) => void;
  frameCount: number;
  onFrameCountChange: (count: number) => void;
  aspectRatio: '16:9' | '9:16';
  onAspectRatioChange: (ratio: '16:9' | '9:16') => void;
}

const FrameSelectionStep: React.FC<FrameSelectionStepProps> = ({
  video,
  analysis,
  selectedFrames,
  onFramesChange,
  frameCount,
  onFrameCountChange,
  aspectRatio,
  onAspectRatioChange,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Aspect Ratio Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Aspect Ratio
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onAspectRatioChange('16:9')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              aspectRatio === '16:9'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            16:9 (Landscape)
          </button>
          <button
            onClick={() => onAspectRatioChange('9:16')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              aspectRatio === '9:16'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            9:16 (Portrait)
          </button>
        </div>
      </div>

      <VideoFrameSelector
        videoId={video.id}
        videoDuration={video.duration}
        analysis={analysis}
        selectedFrames={selectedFrames}
        onFramesChange={onFramesChange}
        frameCount={frameCount}
        onFrameCountChange={onFrameCountChange}
      />

      {selectedFrames.length < 2 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            ⚠ Please select at least 2 frames to continue. You can select from suggested key moments or add frames manually.
          </p>
        </div>
      )}
    </div>
  );
};

export default FrameSelectionStep;

