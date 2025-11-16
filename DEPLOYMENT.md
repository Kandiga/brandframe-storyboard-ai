# Deployment Guide - BrandFrame Studio

This guide explains how to deploy BrandFrame Studio to production.

## Frontend Deployment (Netlify)

### Prerequisites
- A Netlify account
- Your backend API deployed and accessible via HTTPS
- Environment variables ready

### Step 1: Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Select the repository: `brandframe-studio-v2`

### Step 2: Configure Build Settings

Netlify should auto-detect these settings from `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`

If not, manually set:
- Build command: `npm run build`
- Publish directory: `dist`

### Step 3: Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

```
VITE_API_URL=https://your-backend-url.com
```

**Important**: Replace `https://your-backend-url.com` with your actual backend URL.

### Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Your site will be available at `https://your-site-name.netlify.app`

## Backend Deployment

The backend needs to be deployed separately. Here are options:

### Option 1: Railway

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Select the `server` directory as root
5. Set environment variables:
   - `GEMINI_API_KEY` - Your Gemini API key
   - `YOUTUBE_API_KEY` - Your YouTube API key (optional)
   - `PORT` - Port number (Railway sets this automatically)
   - `NODE_ENV=production`
   - `FRONTEND_URL` - Your Netlify frontend URL (e.g., `https://your-site.netlify.app`)
   - `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (optional)

6. Deploy

### Option 2: Heroku

1. Create a `Procfile` in the `server` directory:
   ```
   web: node index.js
   ```

2. Deploy using Heroku CLI:
   ```bash
   cd server
   heroku create your-app-name
   heroku config:set GEMINI_API_KEY=your-key
   heroku config:set YOUTUBE_API_KEY=your-key
   heroku config:set FRONTEND_URL=https://your-site.netlify.app
   git push heroku main
   ```

### Option 3: Render

1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set root directory to `server`
5. Set build command: `npm install`
6. Set start command: `node index.js`
7. Add environment variables (same as Railway)
8. Deploy

### Option 4: Vercel (Serverless Functions)

For Vercel, you'll need to restructure the backend as serverless functions. This is more complex but possible.

## Environment Variables Reference

### Frontend (Netlify)
- `VITE_API_URL` - **Required**: Your backend API URL (e.g., `https://your-backend.railway.app`)

### Backend
- `GEMINI_API_KEY` - **Required**: Your Google Gemini API key
- `YOUTUBE_API_KEY` - Optional: For YouTube Shorts feature
- `PORT` - Port number (usually set by hosting platform)
- `NODE_ENV` - Set to `production` for production deployments
- `FRONTEND_URL` - Your frontend URL (e.g., `https://your-site.netlify.app`)
- `ALLOWED_ORIGINS` - Optional: Comma-separated list of additional allowed origins

## CORS Configuration

The backend CORS middleware automatically allows:
- All `*.netlify.app` domains
- Localhost origins (in development)
- Origins specified in `FRONTEND_URL` environment variable
- Origins specified in `ALLOWED_ORIGINS` environment variable (comma-separated)

## Troubleshooting

### CORS Errors
If you see CORS errors:
1. Make sure `FRONTEND_URL` is set correctly in backend environment variables
2. Check that your frontend URL matches exactly (including `https://`)
3. Add your frontend URL to `ALLOWED_ORIGINS` if needed

### API Connection Errors
If the frontend can't connect to backend:
1. Verify `VITE_API_URL` is set correctly in Netlify
2. Make sure backend is deployed and accessible
3. Check backend logs for errors
4. Verify backend URL is HTTPS (required for production)

### Build Errors
If Netlify build fails:
1. Check build logs in Netlify dashboard
2. Make sure all dependencies are in `package.json`
3. Verify Node.js version compatibility (18+)

## Testing Production Deployment

1. Deploy frontend to Netlify
2. Deploy backend to your chosen platform
3. Set `VITE_API_URL` in Netlify to your backend URL
4. Set `FRONTEND_URL` in backend to your Netlify URL
5. Test the application end-to-end

## Security Notes

- Never commit API keys to Git
- Always use HTTPS in production
- Keep environment variables secure
- Regularly update dependencies
- Monitor backend logs for suspicious activity

