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
  selectedArtStyleFrame: number | null;
  selectedBackgroundFrame: number | null;
  onArtStyleFrameChange: (frame: number | null) => void;
  onBackgroundFrameChange: (frame: number | null) => void;
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
  selectedArtStyleFrame,
  selectedBackgroundFrame,
  onArtStyleFrameChange,
  onBackgroundFrameChange,
}) => {
  const formatTimestamp = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThumbnailUrl = (timestamp: number | null | undefined): string => {
    if (!video?.id) {
      return 'https://via.placeholder.com/320x180?text=No+Video';
    }
    return `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
  };

  const handleFrameSelect = (timestamp: number, type: 'artStyle' | 'background') => {
    if (type === 'artStyle') {
      onArtStyleFrameChange(selectedArtStyleFrame === timestamp ? null : timestamp);
    } else {
      onBackgroundFrameChange(selectedBackgroundFrame === timestamp ? null : timestamp);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Aspect Ratio Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
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

      {/* Art Style Frame Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Frame for Art Style Reference</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose one frame that best represents the visual art style you want to use.
        </p>
        {analysis?.keyMoments && Array.isArray(analysis.keyMoments) && analysis.keyMoments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analysis.keyMoments.map((moment, index) => {
              const isSelected = selectedArtStyleFrame === moment.timestamp;
              return (
                <div
                  key={`art-${index}`}
                  className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-300'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => handleFrameSelect(moment.timestamp, 'artStyle')}
                >
                  <img
                    src={moment.thumbnail || getThumbnailUrl(moment.timestamp)}
                    alt={`Moment at ${formatTimestamp(moment.timestamp)}`}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-600">
                        {formatTimestamp(moment.timestamp)}
                      </span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{moment.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {selectedArtStyleFrame !== null && selectedArtStyleFrame !== undefined && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-800">
              ✓ Art Style frame selected: {formatTimestamp(selectedArtStyleFrame)}
            </p>
          </div>
        )}
      </div>

      {/* Background Frame Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Frame for Background Reference</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose one frame that best represents the background/environment you want to use.
        </p>
        {analysis?.keyMoments && Array.isArray(analysis.keyMoments) && analysis.keyMoments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analysis.keyMoments.map((moment, index) => {
              const isSelected = selectedBackgroundFrame === moment.timestamp;
              return (
                <div
                  key={`bg-${index}`}
                  className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'border-green-600 bg-green-50 ring-2 ring-green-300'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => handleFrameSelect(moment.timestamp, 'background')}
                >
                  <img
                    src={moment.thumbnail || getThumbnailUrl(moment.timestamp)}
                    alt={`Moment at ${formatTimestamp(moment.timestamp)}`}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-green-600">
                        {formatTimestamp(moment.timestamp)}
                      </span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{moment.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {selectedBackgroundFrame !== null && selectedBackgroundFrame !== undefined && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Background frame selected: {formatTimestamp(selectedBackgroundFrame)}
            </p>
          </div>
        )}
      </div>

      {/* General Frame Selection (for storyboard frames) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Storyboard Frames (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          You can also select additional frames for your storyboard scenes.
        </p>
        <VideoFrameSelector
          videoId={video.id}
          videoDuration={video.duration}
          analysis={analysis}
          selectedFrames={selectedFrames}
          onFramesChange={onFramesChange}
          frameCount={frameCount}
          onFrameCountChange={onFrameCountChange}
        />
      </div>

      {(selectedArtStyleFrame === null || selectedArtStyleFrame === undefined || selectedBackgroundFrame === null || selectedBackgroundFrame === undefined) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            ⚠ Please select both an Art Style frame and a Background frame to continue.
          </p>
        </div>
      )}
    </div>
  );
};

export default FrameSelectionStep;

