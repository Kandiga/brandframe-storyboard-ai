import { VideoAnalysis } from '../types';
import { logInfo, logError, logDebug } from '../utils/logger.js';
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabase';

const getApiBaseUrl = () => `${getSupabaseUrl()}/functions/v1/video-analysis`;

export async function analyzeVideo(videoId: string): Promise<VideoAnalysis> {
  const startTime = Date.now();

  try {
    logInfo('Analyzing video', {
      category: 'API',
      component: 'videoAnalysisService',
      action: 'analyze',
      videoId,
    });

    const response = await fetch(`${getApiBaseUrl()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
      body: JSON.stringify({ videoId }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      await response.text();
      const error = new Error('Server returned non-JSON response');
      logError('Invalid response content type', error, {
        category: 'API',
        component: 'videoAnalysisService',
        videoId,
        contentType: contentType || 'unknown',
      });
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error || 'Failed to analyze video';
      const error = new Error(errorMessage);
      logError('Failed to analyze video', error, {
        category: 'API',
        component: 'videoAnalysisService',
        videoId,
        status: response.status,
      });
      throw error;
    }

    if (!data.success) {
      const error = new Error(data.error || 'Failed to analyze video');
      logError('API returned unsuccessful response', error, {
        category: 'API',
        component: 'videoAnalysisService',
        videoId,
      });
      throw error;
    }

    const duration = Date.now() - startTime;
    const analysis = data.analysis;

    logInfo('Video analyzed successfully', {
      category: 'API',
      component: 'videoAnalysisService',
      action: 'analyze',
      videoId,
      keyMomentsCount: analysis?.keyMoments?.length || 0,
      scenesCount: analysis?.suggestedStoryboard?.scenes?.length || 0,
      duration: `${duration}ms`,
    });

    return analysis;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Error analyzing video', error, {
      category: 'API',
      component: 'videoAnalysisService',
      action: 'analyze',
      videoId,
      duration: `${duration}ms`,
    });

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to backend server at ${getApiBaseUrl()}. ` +
        `Please make sure the backend server is running.`
      );
    }
    throw error;
  }
}

