import React from 'react';
import { YouTubeVideo, VideoAnalysis } from '../../types';
import VideoAnalysisPanel from '../VideoAnalysisPanel';

interface AnalysisStepProps {
  video: YouTubeVideo;
  analysis: VideoAnalysis | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  error: string | null;
}

const AnalysisStep: React.FC<AnalysisStepProps> = ({
  video,
  analysis,
  isAnalyzing,
  onAnalyze,
  error,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {!analysis && !isAnalyzing && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Analyze</h3>
          <p className="text-gray-600 mb-6">
            Click the button below to analyze the video content. This will extract the script, identify key moments, and detect visual elements.
          </p>
          <button
            onClick={onAnalyze}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Start Analysis
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Video...</h3>
          <p className="text-gray-600">
            Extracting script, identifying key moments, and analyzing visual elements. This may take a moment.
          </p>
        </div>
      )}

      {analysis && (
        <div>
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-semibold">Analysis Complete</span>
            </div>
          </div>
          <VideoAnalysisPanel analysis={analysis} />
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={onAnalyze}
            className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisStep;

