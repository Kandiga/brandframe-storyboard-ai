import React, { useState } from 'react';
import { VideoAnalysis } from '../types';

interface VideoFrameSelectorProps {
  videoId: string;
  videoDuration?: number;
  analysis: VideoAnalysis | null;
  selectedFrames: number[];
  onFramesChange: (frames: number[]) => void;
  frameCount: number;
  onFrameCountChange: (count: number) => void;
}

const VideoFrameSelector: React.FC<VideoFrameSelectorProps> = ({
  videoId,
  videoDuration,
  analysis,
  selectedFrames,
  onFramesChange,
  frameCount,
  onFrameCountChange,
}) => {
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThumbnailUrl = (timestamp: number): string => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const handleAddFrame = (timestamp: number) => {
    if (!selectedFrames.includes(timestamp) && selectedFrames.length < frameCount) {
      onFramesChange([...selectedFrames, timestamp].sort((a, b) => a - b));
    }
  };

  const handleRemoveFrame = (timestamp: number) => {
    onFramesChange(selectedFrames.filter(t => t !== timestamp));
  };

  const handleKeyMomentsClick = (timestamp: number) => {
    handleAddFrame(timestamp);
  };

  return (
    <div className="space-y-6">
      {/* Frame Count Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Number of Frames: {frameCount}
        </label>
        <div className="flex gap-2">
          {[2, 4, 6, 8].map(count => (
            <button
              key={count}
              onClick={() => {
                onFrameCountChange(count);
                // Adjust selected frames if needed
                if (selectedFrames.length > count) {
                  onFramesChange(selectedFrames.slice(0, count));
                }
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                frameCount === count
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Key Moments from Analysis */}
      {analysis && analysis.keyMoments && analysis.keyMoments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Suggested Key Moments</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analysis.keyMoments.map((moment, index) => {
              const isSelected = selectedFrames.includes(moment.timestamp);
              return (
                <div
                  key={index}
                  className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      handleRemoveFrame(moment.timestamp);
                    } else {
                      handleAddFrame(moment.timestamp);
                    }
                  }}
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
        </div>
      )}

      {/* Selected Frames */}
      {selectedFrames.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Selected Frames ({selectedFrames.length}/{frameCount})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedFrames.map((timestamp, index) => (
              <div key={index} className="border-2 border-indigo-600 rounded-lg overflow-hidden bg-indigo-50">
                <img
                  src={getThumbnailUrl(timestamp)}
                  alt={`Frame at ${formatTimestamp(timestamp)}`}
                  className="w-full h-24 object-cover"
                />
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600">
                      Frame {index + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveFrame(timestamp)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{formatTimestamp(timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Frame Selection */}
      {videoDuration && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Manual Frame Selection</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click on suggested moments above or manually add frames by entering timestamps.
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max={videoDuration}
              step="1"
              placeholder="Seconds"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = parseFloat((e.target as HTMLInputElement).value);
                  if (!isNaN(value) && value >= 0 && value <= videoDuration) {
                    handleAddFrame(value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <span className="text-sm text-gray-500 self-center">/ {formatTimestamp(videoDuration)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFrameSelector;

