import React from 'react';
import { VideoAnalysis } from '../types';

interface VideoAnalysisPanelProps {
  analysis: VideoAnalysis;
}

const VideoAnalysisPanel: React.FC<VideoAnalysisPanelProps> = ({ analysis }) => {
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Script */}
      {analysis.script && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Extracted Script</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{analysis.script}</p>
          </div>
        </div>
      )}

      {/* Key Moments */}
      {analysis.keyMoments && analysis.keyMoments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Key Moments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.keyMoments.map((moment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-indigo-600">
                    {formatTimestamp(moment.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{moment.description}</p>
                {moment.thumbnail && (
                  <img
                    src={moment.thumbnail}
                    alt={`Moment at ${formatTimestamp(moment.timestamp)}`}
                    className="mt-2 w-full h-24 object-cover rounded"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Characters */}
      {analysis.detectedCharacters && analysis.detectedCharacters.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Detected Characters</h3>
          <div className="space-y-3">
            {analysis.detectedCharacters.map((character, index) => (
              <div key={index} className="border-l-4 border-indigo-500 pl-4">
                <p className="font-semibold text-gray-900">{character.description}</p>
                <p className="text-sm text-gray-600 mt-1">{character.appearance}</p>
                <span className="text-xs text-gray-500">Appears {character.frequency} times</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Backgrounds */}
      {analysis.detectedBackgrounds && analysis.detectedBackgrounds.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Detected Backgrounds</h3>
          <div className="space-y-3">
            {analysis.detectedBackgrounds.map((background, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <p className="font-semibold text-gray-900">{background.description}</p>
                <p className="text-sm text-gray-600 mt-1">Style: {background.style}</p>
                <span className="text-xs text-gray-500">Appears {background.frequency} times</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Style */}
      {analysis.visualStyle && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Visual Style</h3>
          <div className="space-y-3">
            {analysis.visualStyle.dominantColors && analysis.visualStyle.dominantColors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Dominant Colors:</p>
                <div className="flex gap-2">
                  {analysis.visualStyle.dominantColors.map((color, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            {analysis.visualStyle.composition && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Composition:</p>
                <p className="text-gray-600">{analysis.visualStyle.composition}</p>
              </div>
            )}
            {analysis.visualStyle.lighting && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Lighting:</p>
                <p className="text-gray-600">{analysis.visualStyle.lighting}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggested Storyboard */}
      {analysis.suggestedStoryboard && analysis.suggestedStoryboard.scenes && analysis.suggestedStoryboard.scenes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Suggested Storyboard Scenes</h3>
          <div className="space-y-4">
            {analysis.suggestedStoryboard.scenes.map((scene, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{scene.title}</h4>
                  <span className="text-sm text-indigo-600">{formatTimestamp(scene.timestamp)}</span>
                </div>
                <p className="text-gray-700 text-sm mb-2">{scene.scriptLine}</p>
                {scene.thumbnail && (
                  <img
                    src={scene.thumbnail}
                    alt={scene.title}
                    className="w-full h-32 object-cover rounded mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalysisPanel;

