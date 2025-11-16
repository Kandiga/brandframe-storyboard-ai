import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  const { path } = event;
  const apiPath = path.replace('/.netlify/functions/api', '');

  try {
    if (apiPath === '/api/health' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: 'BrandFrame Studio API is using Supabase Edge Functions. Please use the Supabase endpoints directly.',
        }),
      };
    }

    return {
      statusCode: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: 'This endpoint has been migrated to Supabase Edge Functions. Please update your API calls to use Supabase endpoints.',
        supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://ykdlyaxpqxsmajclmput.supabase.co',
        functions: {
          storyboard: '/functions/v1/gemini-storyboard',
          youtube: '/functions/v1/youtube-api',
        },
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: message,
      }),
    };
  }
};
