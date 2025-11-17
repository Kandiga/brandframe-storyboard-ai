import { ExtractedAssets } from '../types';
import { logInfo, logError, logDebug } from '../utils/logger.js';
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabase';

const getApiBaseUrl = () => `${getSupabaseUrl()}/functions/v1/video-asset-extraction`;

export async function extractAssetsFromVideo(
  videoId: string,
  timestamps: number[]
): Promise<ExtractedAssets> {
  const startTime = Date.now();

  try {
    logInfo('Extracting assets from video', {
      category: 'API',
      component: 'videoAssetExtraction',
      action: 'extract',
      videoId,
      timestampsCount: timestamps.length,
    });

    const response = await fetch(`${getApiBaseUrl()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
      body: JSON.stringify({ videoId, timestamps }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      await response.text();
      const error = new Error('Server returned non-JSON response');
      logError('Invalid response content type', error, {
        category: 'API',
        component: 'videoAssetExtraction',
        videoId,
        contentType: contentType || 'unknown',
      });
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error || 'Failed to extract assets';
      const error = new Error(errorMessage);
      logError('Failed to extract assets', error, {
        category: 'API',
        component: 'videoAssetExtraction',
        videoId,
        status: response.status,
      });
      throw error;
    }

    if (!data.success) {
      const error = new Error(data.error || 'Failed to extract assets');
      logError('API returned unsuccessful response', error, {
        category: 'API',
        component: 'videoAssetExtraction',
        videoId,
      });
      throw error;
    }

    const duration = Date.now() - startTime;
    const assets = data.assets;

    logInfo('Assets extracted successfully', {
      category: 'API',
      component: 'videoAssetExtraction',
      action: 'extract',
      videoId,
      charactersCount: assets?.characters?.length || 0,
      backgroundsCount: assets?.backgrounds?.length || 0,
      duration: `${duration}ms`,
    });

    return assets;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Error extracting assets', error, {
      category: 'API',
      component: 'videoAssetExtraction',
      action: 'extract',
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

