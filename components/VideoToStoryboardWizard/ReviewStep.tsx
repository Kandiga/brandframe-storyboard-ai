import React from 'react';
import { YouTubeVideo, VideoAnalysis, ExtractedAssets } from '../../types';
import { VideoWizardFormData } from '../VideoToStoryboardWizard';

interface ReviewStepProps {
  video: YouTubeVideo;
  analysis: VideoAnalysis | null;
  selectedFrames: number[];
  extractedAssets: ExtractedAssets | null;
  formData: VideoWizardFormData;
  customStory: string;
  onCustomStoryChange: (story: string) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  video,
  analysis,
  selectedFrames,
  extractedAssets,
  formData,
  customStory,
  onCustomStoryChange,
}) => {
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Video Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Video Summary</h3>
        <div className="flex items-start gap-4">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-32 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{video.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{video.channelName}</p>
            <p className="text-xs text-gray-500 mt-2">{video.viewCount.toLocaleString()} views</p>
          </div>
        </div>
      </div>

      {/* Selected Frames */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Selected Frames ({selectedFrames.length}/{formData.frameCount})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedFrames.map((timestamp, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                alt={`Frame ${index + 1}`}
                className="w-full h-24 object-cover"
              />
              <div className="p-2">
                <p className="text-xs font-semibold text-gray-700">Frame {index + 1}</p>
                <p className="text-xs text-gray-500">{formatTimestamp(timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Settings</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Aspect Ratio:</span>
            <span className="font-semibold">{formData.aspectRatio}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Frame Count:</span>
            <span className="font-semibold">{formData.frameCount}</span>
          </div>
        </div>
      </div>

      {/* Assets Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Assets</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Logo:</span>
            <span className={formData.logoFile ? 'text-green-600 font-semibold' : 'text-gray-400'}>
              {formData.logoFile ? '✓ Uploaded' : 'Not provided'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Character:</span>
            <span className={formData.characterFile ? 'text-green-600 font-semibold' : 'text-gray-400'}>
              {formData.characterFile ? '✓ Uploaded' : extractedAssets?.characters?.length ? 'From video' : 'Not provided'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Background:</span>
            <span className={formData.backgroundFile ? 'text-green-600 font-semibold' : 'text-gray-400'}>
              {formData.backgroundFile ? '✓ Uploaded' : extractedAssets?.backgrounds?.length ? 'From video' : 'Not provided'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Art Style:</span>
            <span className={formData.artStyleFile ? 'text-green-600 font-semibold' : 'text-gray-400'}>
              {formData.artStyleFile ? '✓ Uploaded' : extractedAssets?.styleReference ? 'From video' : 'Not provided'}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Story */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Custom Story (Optional)</h3>
        <p className="text-sm text-gray-600 mb-3">
          Add any additional context or modifications to the story. This will be combined with the video analysis.
        </p>
        <textarea
          value={customStory}
          onChange={(e) => onCustomStoryChange(e.target.value)}
          placeholder="Enter your custom story or modifications here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          rows={6}
        />
      </div>

      {/* Analysis Summary */}
      {analysis && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Key Moments Found:</span>
              <span className="font-semibold">{analysis.keyMoments?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Characters Detected:</span>
              <span className="font-semibold">{analysis.detectedCharacters?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Backgrounds Detected:</span>
              <span className="font-semibold">{analysis.detectedBackgrounds?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Suggested Scenes:</span>
              <span className="font-semibold">{analysis.suggestedStoryboard?.scenes?.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewStep;

