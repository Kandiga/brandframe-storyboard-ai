<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BrandFrame Studio - AI-Powered Storyboard Generator

This app uses **Supabase Edge Functions** for serverless backend operations.

View your app in AI Studio: https://ai.studio/apps/drive/1gKqQVYTsJMs8tbID6URtz9n7rP8WnEqD

## Architecture

- **Frontend:** React + Vite (bolt.new compatible)
- **Backend:** Supabase Edge Functions (serverless)
- **Database:** Supabase PostgreSQL
- **AI:** Google Gemini API
- **Video Data:** YouTube Data API v3

## Quick Start

### 1. Setup API Keys

You need to add your API keys to Supabase:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `ykdlyaxpqxsmajclmput`
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Add these secrets:
   - `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `YOUTUBE_API_KEY` - Get from [Google Cloud Console](https://console.cloud.google.com/)

See [API_KEYS_SETUP.md](API_KEYS_SETUP.md) for detailed instructions.

### 2. Run the App

```bash
npm install
npm run dev
```

That's it! The app will connect to Supabase Edge Functions automatically.

## How It Works

1. Frontend runs on port 3000
2. All API calls go to Supabase Edge Functions:
   - `/functions/v1/gemini-storyboard` - AI storyboard generation
   - `/functions/v1/youtube-api` - YouTube data fetching
3. Edge Functions use secrets stored in Supabase
4. No local backend server needed

## Deployment

### Netlify-Only Deployment (Recommended for Simple Setup)
👉 **[Follow the Netlify Setup Guide](NETLIFY_SETUP.md)** - Deploy everything on Netlify using Netlify Functions.

**Important:** Netlify Functions have timeout limits (10s free, 26s Pro). For longer operations, consider separate backend deployment.

### Separate Backend Deployment (Recommended for Production)
👉 **[Follow the Quick Start Guide](DEPLOY_QUICK_START.md)** - Deploy backend to Railway and frontend to Netlify for better performance.

### Detailed Guides
- [NETLIFY_SETUP.md](NETLIFY_SETUP.md) - Netlify-only deployment guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Comprehensive deployment guide
- [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) - Detailed Railway deployment
- [RENDER_DEPLOY.md](RENDER_DEPLOY.md) - Alternative: Render deployment
