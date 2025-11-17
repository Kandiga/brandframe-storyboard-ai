import { YouTubeVideo, Comment, VideoStyleFilter, VideoStyle, SortBy, SearchFilters } from '../types';
import { logInfo, logError, logDebug, logWarn } from '../utils/logger.js';
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabase';

const getApiBaseUrl = () => `${getSupabaseUrl()}/functions/v1/youtube-api`;

export async function fetchVideoStyles(): Promise<VideoStyleFilter[]> {
  const startTime = Date.now();

  try {
    logDebug('Fetching video styles', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-styles',
    });

    const response = await fetch(`${getApiBaseUrl()}/video-styles`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      }
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      await response.text();
      const error = new Error('Server returned non-JSON response');
      logError('Invalid response content type', error, {
        category: 'API',
        component: 'youtubeService',
        contentType: contentType || 'unknown',
      });
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error || 'Failed to fetch video styles';
      const error = new Error(errorMessage);
      logError('Failed to fetch video styles', error, {
        category: 'API',
        component: 'youtubeService',
        status: response.status,
      });
      throw error;
    }

    if (!data.success) {
      const error = new Error(data.error || 'Failed to fetch video styles');
      logError('API returned unsuccessful response', error, {
        category: 'API',
        component: 'youtubeService',
      });
      throw error;
    }

    const duration = Date.now() - startTime;
    const styles = data.styles || [];

    logInfo('Video styles fetched successfully', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-styles',
      stylesCount: styles.length,
      duration: `${duration}ms`,
    });

    return styles;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Error fetching video styles', error, {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-styles',
      duration: `${duration}ms`,
    });
    throw error;
  }
}

export async function fetchVideosByStyle(
  style: VideoStyle | 'all',
  query?: string,
  filters?: Partial<SearchFilters>
): Promise<YouTubeVideo[]> {
  const startTime = Date.now();

  try {
    logInfo('Fetching videos by style', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-by-style',
      style,
      query: query || '',
    });

    const params = new URLSearchParams();
    params.append('style', style === 'all' ? 'shorts' : style);
    if (query) params.append('query', query);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.minViews) params.append('minViews', filters.minViews.toString());
    if (filters?.minLikes) params.append('minLikes', filters.minLikes.toString());
    params.append('limit', '20'); // Default limit

    const response = await fetch(`${getApiBaseUrl()}/search-by-style?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
      cache: 'default'
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      await response.text();
      const error = new Error('Server returned non-JSON response');
      logError('Invalid response content type', error, {
        category: 'API',
        component: 'youtubeService',
        contentType: contentType || 'unknown',
      });
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error || 'Failed to fetch videos by style';
      const error = new Error(errorMessage);
      logError('Failed to fetch videos by style', error, {
        category: 'API',
        component: 'youtubeService',
        status: response.status,
        style,
      });
      throw error;
    }

    if (!data.success) {
      const error = new Error(data.error || 'Failed to fetch videos by style');
      logError('API returned unsuccessful response', error, {
        category: 'API',
        component: 'youtubeService',
        style,
      });
      throw error;
    }

    const duration = Date.now() - startTime;
    const videos = data.videos || [];

    logInfo('Videos by style fetched successfully', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-by-style',
      style,
      videosCount: videos.length,
      duration: `${duration}ms`,
    });

    return videos;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Error fetching videos by style', error, {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-by-style',
      style,
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

export async function fetchTrendingShorts(limit: number = 20, query?: string, style?: VideoStyle): Promise<YouTubeVideo[]> {
  const startTime = Date.now();

  try {
    logInfo('Fetching trending YouTube Shorts', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-trending',
      limit,
      query: query || 'trending',
    });

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (query) params.append('query', query);
    if (style) params.append('style', style);
    
    const response = await fetch(`${getApiBaseUrl()}/trending-shorts?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
      cache: 'default'
    });
    
    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      await response.text(); // Read response to avoid memory leak
      const error = new Error(
        `Server returned non-JSON response. Backend server may not be running. ` +
        `Expected JSON from ${getApiBaseUrl()}/api/youtube/trending-shorts, ` +
        `but got: ${contentType || 'unknown'}. ` +
        `Make sure to run "npm run server" or "npm run dev:full".`
      );
      logError('Invalid response content type', error, {
        category: 'API',
        component: 'youtubeService',
        contentType: contentType || 'unknown',
      });
      throw error;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      let errorMessage = `Failed to fetch trending shorts: ${response.statusText}`;
      if (data && data.error) {
        errorMessage = data.error;
      }
      const error = new Error(errorMessage);
      logError('Failed to fetch trending shorts', error, {
        category: 'API',
        component: 'youtubeService',
        status: response.status,
        errorCode: data?.code,
      });
      throw error;
    }
    
    if (!data.success) {
      const error = new Error(data.error || 'Failed to fetch trending shorts');
      logError('API returned unsuccessful response', error, {
        category: 'API',
        component: 'youtubeService',
        errorCode: data?.code,
      });
      throw error;
    }
    
    const duration = Date.now() - startTime;
    const videos = data.videos || [];
    
    logInfo('Trending shorts fetched successfully', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-trending',
      videosCount: videos.length,
      duration: `${duration}ms`,
      query: query || 'trending',
      style: style || 'shorts',
    });
    
    return videos;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Error fetching trending shorts', error, {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-trending',
      duration: `${duration}ms`,
    });
    
    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to backend server at ${getApiBaseUrl()}. ` +
        `Please make sure the backend server is running with "npm run server" or "npm run dev:full".`
      );
    }
    throw error;
  }
}

export async function fetchVideoMetadata(videoId: string): Promise<YouTubeVideo> {
  const startTime = Date.now();
  
  try {
    logDebug('Fetching video metadata', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-metadata',
      videoId,
    });
    
    const response = await fetch(`${getApiBaseUrl()}/video/${videoId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      }
    });
    
    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      await response.text(); // Read response to avoid memory leak
      const error = new Error(
        `Server returned non-JSON response. Backend server may not be running. ` +
        `Make sure to run "npm run server" or "npm run dev:full".`
      );
      logError('Invalid response content type', error, {
        category: 'API',
        component: 'youtubeService',
        videoId,
        contentType: contentType || 'unknown',
      });
      throw error;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      let errorMessage = `Failed to fetch video metadata: ${response.statusText}`;
      if (data && data.error) {
        errorMessage = data.error;
      }
      const error = new Error(errorMessage);
      logError('Failed to fetch video metadata', error, {
        category: 'API',
        component: 'youtubeService',
        videoId,
        status: response.status,
      });
      throw error;
    }
    
    if (!data.success) {
      const error = new Error(data.error || 'Failed to fetch video metadata');
      logError('API returned unsuccessful response', error, {
        category: 'API',
        component: 'youtubeService',
        videoId,
      });
      throw error;
    }
    
    const duration = Date.now() - startTime;
    logInfo('Video metadata fetched successfully', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-metadata',
      videoId,
      duration: `${duration}ms`,
      videoTitle: data.video?.title?.substring(0, 50),
    });
    
    return data.video;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Error fetching video metadata', error, {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-metadata',
      videoId,
      duration: `${duration}ms`,
    });
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to backend server at ${getApiBaseUrl()}. ` +
        `Please make sure the backend server is running with "npm run server" or "npm run dev:full".`
      );
    }
    throw error;
  }
}

export async function fetchVideoComments(videoId: string, maxResults: number = 10): Promise<Comment[]> {
  const startTime = Date.now();

  try {
    logDebug('Fetching video comments', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-comments',
      videoId,
      maxResults,
    });

    const response = await fetch(`${getApiBaseUrl()}/video/${videoId}/comments?maxResults=${maxResults}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      }
    });
    
    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      await response.text(); // Read response to avoid memory leak
      const error = new Error(
        `Server returned non-JSON response. Backend server may not be running. ` +
        `Make sure to run "npm run server" or "npm run dev:full".`
      );
      logError('Invalid response content type', error, {
        category: 'API',
        component: 'youtubeService',
        videoId,
        contentType: contentType || 'unknown',
      });
      throw error;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      let errorMessage = `Failed to fetch video comments: ${response.statusText}`;
      if (data && data.error) {
        errorMessage = data.error;
      }
      const error = new Error(errorMessage);
      logError('Failed to fetch video comments', error, {
        category: 'API',
        component: 'youtubeService',
        videoId,
        status: response.status,
      });
      throw error;
    }
    
    if (!data.success) {
      const error = new Error(data.error || 'Failed to fetch video comments');
      logError('API returned unsuccessful response', error, {
        category: 'API',
        component: 'youtubeService',
        videoId,
      });
      throw error;
    }
    
    const duration = Date.now() - startTime;
    const comments = data.comments || [];
    
    logInfo('Video comments fetched successfully', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-comments',
      videoId,
      commentsCount: comments.length,
      duration: `${duration}ms`,
    });
    
    return comments;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Error fetching video comments', error, {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-comments',
      videoId,
      duration: `${duration}ms`,
    });
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to backend server at ${getApiBaseUrl()}. ` +
        `Please make sure the backend server is running with "npm run server" or "npm run dev:full".`
      );
    }
    throw error;
  }
}

export async function fetchVideoCaptions(videoId: string): Promise<{ id: string; language: string; name: string; text: string } | null> {
  const startTime = Date.now();

  try {
    logDebug('Fetching video captions', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-captions',
      videoId,
    });

    const response = await fetch(`${getApiBaseUrl()}/video/${videoId}/captions`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      }
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      await response.text();
      const error = new Error('Server returned non-JSON response');
      logError('Invalid response content type', error, {
        category: 'API',
        component: 'youtubeService',
        videoId,
        contentType: contentType || 'unknown',
      });
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error || 'Failed to fetch video captions';
      const error = new Error(errorMessage);
      logError('Failed to fetch video captions', error, {
        category: 'API',
        component: 'youtubeService',
        videoId,
        status: response.status,
      });
      throw error;
    }

    if (!data.success) {
      // No captions available is not an error
      if (data.captions && data.captions.length === 0) {
        return null;
      }
      const error = new Error(data.error || 'Failed to fetch video captions');
      logError('API returned unsuccessful response', error, {
        category: 'API',
        component: 'youtubeService',
        videoId,
      });
      throw error;
    }

    const duration = Date.now() - startTime;
    const captions = data.captions;

    logInfo('Video captions fetched successfully', {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-captions',
      videoId,
      hasCaptions: !!captions,
      duration: `${duration}ms`,
    });

    return captions || null;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Error fetching video captions', error, {
      category: 'API',
      component: 'youtubeService',
      action: 'fetch-captions',
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

