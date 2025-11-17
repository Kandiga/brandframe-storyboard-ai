import React from 'react';
import { YouTubeVideo } from '../../types';

interface VideoPreviewStepProps {
  video: YouTubeVideo;
}

const VideoPreviewStep: React.FC<VideoPreviewStepProps> = ({ video }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get thumbnail with fallback
  const thumbnailUrl = video.thumbnail || (video as any).thumbnailUrl || 'https://via.placeholder.com/640x360?text=No+Thumbnail';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== 'https://via.placeholder.com/640x360?text=No+Thumbnail') {
                target.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail';
              }
            }}
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-sm px-3 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{video.title}</h2>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Channel:</span>
              <span className="text-gray-600">{video.channelName}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">👁️</span>
                <span className="font-semibold">{formatNumber(video.viewCount)} views</span>
              </div>
              {video.likeCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">👍</span>
                  <span className="font-semibold">{formatNumber(video.likeCount)} likes</span>
                </div>
              )}
              {video.commentCount !== undefined && video.commentCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">💬</span>
                  <span className="font-semibold">{formatNumber(video.commentCount)} comments</span>
                </div>
              )}
              {video.engagementRate !== undefined && video.engagementRate > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">📊</span>
                  <span className="font-semibold text-indigo-600">
                    {video.engagementRate.toFixed(2)}% engagement
                  </span>
                </div>
              )}
            </div>
          </div>
          {video.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Description:</h3>
              <p className="text-gray-600 text-sm line-clamp-4">{video.description}</p>
            </div>
          )}
          <div className="mt-4">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Watch on YouTube
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewStep;

