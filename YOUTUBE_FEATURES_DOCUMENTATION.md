# YouTube Viral Shorts & Video-to-Storyboard Features Documentation

## Overview
BrandFrame Studio v2 now includes powerful YouTube integration features that allow users to discover viral content and transform YouTube videos into professional storyboards using AI analysis.

---

## 🎯 Feature 1: Viral Shorts Discovery

### Location
Access via the **"Viral Shorts"** tab in the sidebar navigation.

### Core Capabilities

#### 1. Smart Search
- **Search by Topic**: Enter any topic (e.g., "cooking", "fitness", "comedy", "tech reviews")
- **Real-time Results**: Fetches trending YouTube Shorts based on search query
- **Default Trending**: Shows trending content when no search query is entered

#### 2. Visual Style Filtering
Filter videos by production style:
- **🎨 Animation** - Animated content (2D/3D animation, motion graphics)
- **🎬 Live Action** - Real footage, vlogs, tutorials
- **📊 Whiteboard** - Educational whiteboard animations
- **🎭 Mixed Media** - Combination of multiple styles
- **✨ Motion Graphics** - Dynamic graphic-based content

#### 3. Advanced Sorting Options
Sort results by:
- **Views** - Most viewed videos first
- **Likes** - Highest engagement
- **Engagement Rate** - Calculated engagement score

#### 4. Video Cards Display
Each video card shows:
- **Thumbnail** - High-quality preview image
- **Title** - Video title with line clamping
- **Channel Info** - Creator name and subscriber count
- **Statistics**:
  - View count (formatted: 1.2M, 500K, etc.)
  - Like count
  - Comment count
  - Duration (MM:SS format)
- **Video Style Badge** - Visual style category
- **Action Buttons**:
  - "View Details" - Opens detailed modal
  - "Use as Inspiration" - Quick inspiration mode
  - "Create Storyboard" - Full wizard workflow

### Video Details Modal
Click "View Details" to see:
- Full video description
- Complete statistics
- Channel information
- Engagement metrics
- Direct YouTube link

---

## 🎬 Feature 2: Video-to-Storyboard Wizard

### Overview
A comprehensive 5-step wizard that transforms YouTube videos into professional storyboards using AI analysis and frame extraction.

### Activation
Click **"Create Storyboard"** button on any video card in the Viral Shorts view.

---

## 📋 The 5-Step Wizard Workflow

### Step 1: Video Preview
**Purpose**: Review the selected video before analysis

**What You See**:
- Large video thumbnail
- Video title and description
- Channel information
- View count and engagement stats
- Video duration
- Direct link to watch on YouTube

**Actions**:
- Click "Next" to proceed to analysis
- Click "Cancel" to return to Viral Shorts view

---

### Step 2: AI Analysis
**Purpose**: Automatically analyze video content using Gemini AI

**Process**:
1. Click "Analyze Video" button
2. System fetches video captions/transcript
3. AI analyzes:
   - **Script Extraction**: Full dialogue/narration
   - **Scene Breakdown**: Individual scenes identified
   - **Visual Style**: Production style analysis
   - **Key Moments**: Important timestamps
   - **Emotional Tone**: Mood and sentiment analysis
   - **Story Structure**: Narrative flow

**What You Get**:
```json
{
  "script": "Complete video script/transcript",
  "scenes": [
    {
      "timestamp": "00:15",
      "description": "Scene description",
      "keyElements": ["element1", "element2"],
      "visualStyle": "Style description"
    }
  ],
  "keyMoments": ["timestamp1", "timestamp2"],
  "overallTheme": "Main theme",
  "suggestedFrames": [5, 15, 30, 45]
}
```

**Display**:
- Analyzed script in formatted text area
- Scene-by-scene breakdown cards
- Key moments timeline
- Visual style summary
- Suggested frame timestamps

**Actions**:
- Review analysis results
- Click "Next" to proceed to frame selection

---

### Step 3: Frame Selection
**Purpose**: Select specific video frames to extract as reference images

**Interface**:
- **Frame Timeline**: Visual timeline of video
- **Suggested Frames**: AI-recommended key frames highlighted
- **Manual Selection**: Click to add/remove frames
- **Preview Grid**: Thumbnails of selected frames
- **Special Selections**:
  - **Art Style Frame**: Choose one frame for artistic reference
  - **Background Frame**: Choose one frame for background style

**Features**:
- Drag slider to preview frames
- Auto-extract frames at selected timestamps
- Download individual frames
- Minimum 1 frame, maximum 10 frames

**Frame Data**:
```javascript
{
  selectedFrames: [5, 15, 30, 45], // timestamps in seconds
  artStyleFrame: 15, // chosen art style reference
  backgroundFrame: 30 // chosen background reference
}
```

---

### Step 4: Assets & Customization
**Purpose**: Upload brand assets and customize the storyboard

**Asset Upload Sections**:

#### Logo Upload
- Drag & drop or click to upload
- Supports: PNG, JPG, SVG
- Preview before proceeding
- Optional (can skip)

#### Character Upload
- Main character image
- Additional characters (multi-upload)
- Each with preview
- Optional

#### Background Upload
- Custom background image
- Overrides extracted background
- Optional

#### Art Style Reference
- Reference image for artistic style
- Overrides extracted style frame
- Optional

#### Custom Story Input
- **Visual Style Prompt**: Describe desired visual style
- **Custom Story Text**: Override or enhance AI script
- Character limit: 5000 characters
- Supports markdown formatting

#### Storyboard Settings
- **Aspect Ratio**:
  - 16:9 (Landscape/YouTube standard)
  - 9:16 (Vertical/TikTok/Shorts)
- **Frame Count**: 4-12 frames
- **Scene Count**: Auto-calculated (2 frames per scene)

**Smart Integration**:
- If art style frame was selected in Step 3, it's pre-loaded
- If background frame was selected, it's pre-loaded
- User can override with custom uploads

---

### Step 5: Review & Generate
**Purpose**: Final review before storyboard generation

**Review Sections**:

#### 1. Video Source
- Video thumbnail
- Title and channel
- Link to original video
- Duration and stats

#### 2. Analysis Summary
- Script preview (first 200 characters)
- Scene count
- Key moments identified
- Visual style detected

#### 3. Selected Assets Review
- Logo preview (if uploaded)
- Character previews (if uploaded)
- Background preview (if uploaded/extracted)
- Art style preview (if uploaded/extracted)
- Frame count and aspect ratio

#### 4. Custom Content
- Visual style prompt (if entered)
- Custom story text (if entered)

#### 5. Generation Settings
- Aspect ratio: 16:9 or 9:16
- Frame count: X frames
- Scene count: Y scenes

**Actions**:
- **Edit** buttons to return to previous steps
- **Generate Storyboard** - Proceed with generation
- **Cancel** - Abort and return to Viral Shorts

**Generation Process**:
1. Combines AI analysis + custom story + visual style
2. Uploads all assets to backend
3. Generates storyboard using Gemini
4. Returns to Dashboard with completed storyboard

---

## 🔄 Integration with Main App

### Video Source Tracking
Every storyboard created from a YouTube video includes metadata:

```javascript
{
  videoSource: {
    videoId: "abc123",
    title: "Original Video Title",
    url: "https://youtube.com/watch?v=abc123",
    analysis: { /* full analysis object */ }
  }
}
```

### Dashboard Display
When viewing a storyboard created from a video:
- **Blue Info Box** displays at top
- Shows: "Video Source: [Title]"
- "Watch on YouTube" button links to original
- Preserves connection between inspiration and creation

### Story Combination
The final story sent to Gemini combines:
```
[AI-Analyzed Script]

---

Visual Style:
[User's visual style prompt]

---

Custom Story:
[User's custom story text]
```

This ensures:
- Base content from original video
- User's creative direction applied
- Visual style preferences honored

---

## 📊 Backend Services

### 1. YouTube API Service
**File**: `services/youtubeService.ts`

**Functions**:
- `fetchTrendingShorts()` - Get trending videos
- `fetchVideosByStyle()` - Filter by visual style
- `fetchVideoMetadata()` - Get detailed video info
- `fetchVideoComments()` - Retrieve comments
- `fetchVideoCaptions()` - Get subtitles/transcript
- `fetchVideoStyles()` - Get available style filters

### 2. Video Analysis Service
**File**: `services/videoAnalysisService.ts`

**Main Function**: `analyzeVideo(video: YouTubeVideo)`

**Process**:
1. Fetches video captions
2. Sends to Gemini AI for analysis
3. Extracts:
   - Complete script/transcript
   - Scene breakdown
   - Key moments
   - Visual style
   - Story structure
4. Returns structured `VideoAnalysis` object

### 3. Video Asset Extraction
**File**: `services/videoAssetExtraction.ts`

**Main Function**: `extractAssetsFromVideo(video: YouTubeVideo, timestamps: number[])`

**Process**:
1. Generates frame URLs for selected timestamps
2. Downloads frames as images
3. Converts to base64 for upload
4. Returns `ExtractedAssets` object with:
   - Frame images
   - Metadata
   - Timestamps

### 4. Supabase Edge Functions

#### `/youtube-api`
Endpoints:
- `GET /trending-shorts` - Fetch trending content
- `GET /search-by-style` - Style-filtered search
- `GET /video/{id}` - Video metadata
- `GET /video/{id}/comments` - Comments
- `GET /video/{id}/captions` - Captions

#### `/video-analysis`
- `POST /analyze` - AI video analysis
- Input: Video ID, captions, metadata
- Output: Structured analysis

#### `/video-asset-extraction`
- `POST /extract` - Frame extraction
- Input: Video ID, timestamps
- Output: Frame images (base64)

---

## 🎨 UI Components

### Main Components

#### `ViralShortsView.tsx`
- Main view for video discovery
- Search interface
- Filter controls
- Video grid display
- Integration with wizard

#### `VideoCard.tsx`
- Individual video card component
- Displays video metadata
- Action buttons
- Engagement stats

#### `VideoDetailsModal.tsx`
- Detailed video information
- Full statistics
- YouTube embed option
- Share functionality

#### `VideoToStoryboardWizard.tsx`
- Main wizard orchestrator
- Step management
- State management
- Progress tracking

#### Wizard Step Components
- `VideoPreviewStep.tsx` - Step 1
- `AnalysisStep.tsx` - Step 2
- `FrameSelectionStep.tsx` - Step 3
- `AssetsStep.tsx` - Step 4
- `ReviewStep.tsx` - Step 5

### Shared Components
- `WizardProgress.tsx` - Progress indicator
- `WizardNavigation.tsx` - Next/Back buttons
- `WizardStep.tsx` - Step wrapper

---

## 📱 Responsive Design

### Mobile Optimization
- **Viral Shorts View**:
  - Single column card layout on mobile
  - Larger touch targets (min 44px)
  - Simplified filters (dropdown on mobile)
  - Swipeable video cards

- **Wizard**:
  - Full-screen on mobile
  - Step-by-step progression
  - Mobile-optimized file upload
  - Touch-friendly controls

### Desktop Experience
- Multi-column video grid (4 columns on xl screens)
- Side-by-side comparisons
- Advanced filtering sidebar
- Detailed preview panels

---

## 🔑 Key Features Summary

### What Makes This Special

1. **AI-Powered Analysis**
   - Gemini 1.5 Pro integration
   - Deep content understanding
   - Automatic scene detection
   - Smart frame suggestions

2. **Seamless Integration**
   - Direct YouTube to Storyboard pipeline
   - No manual transcription needed
   - Preserves video source metadata
   - One-click workflow

3. **Flexible Customization**
   - Override AI suggestions
   - Add custom story elements
   - Upload brand assets
   - Choose visual style

4. **Professional Output**
   - Broadcast-quality storyboards
   - VEO 3.1 optimized prompts
   - Production-ready exports
   - Complete scene breakdowns

5. **Visual Style Filtering**
   - Content-aware categorization
   - Style-based search
   - Consistent branding
   - Genre-specific results

---

## 🚀 Usage Examples

### Example 1: Cooking Tutorial to Recipe Storyboard
1. Search "cooking pasta" in Viral Shorts
2. Filter by "Live Action" style
3. Click "Create Storyboard" on a recipe video
4. Let AI analyze the cooking steps
5. Select key frames (ingredients, cooking process, plating)
6. Upload restaurant logo
7. Add custom brand messaging
8. Generate 8-frame recipe storyboard

### Example 2: Fitness Video to Workout Guide
1. Search "home workout" in Viral Shorts
2. Sort by "Engagement"
3. Select high-performing video
4. AI analyzes exercise sequence
5. Extract frames showing each exercise
6. Upload gym branding
7. Add motivational text
8. Generate vertical (9:16) storyboard for Instagram

### Example 3: Product Review to Ad Campaign
1. Search product category in Viral Shorts
2. Find popular review video
3. Analyze key product features mentioned
4. Select frames highlighting product
5. Upload brand logo and product images
6. Rewrite script for ad copy
7. Set to 16:9 for YouTube ads
8. Generate professional ad storyboard

---

## 📊 Data Flow Diagram

```
User Searches → YouTube API → Results Display
                                    ↓
                            Select Video
                                    ↓
                            Create Storyboard
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            Video Preview                    Fetch Captions
                    ↓                               ↓
            Click Analyze                   Gemini AI Analysis
                    ↓                               ↓
            Display Analysis              Scene Breakdown
                    ↓                               ↓
            Select Frames                 Extract Frames
                    ↓                               ↓
            Upload Assets              Download Frame Images
                    ↓                               ↓
            Review & Confirm            Combine All Data
                    ↓                               ↓
                    └───────────────┬───────────────┘
                                    ↓
                        Generate Storyboard (Gemini)
                                    ↓
                        Return to Dashboard
                                    ↓
                        Display Final Storyboard
                                    ↓
                        Export Options Available
```

---

## 🎯 Best Practices

### For Best Results:

1. **Video Selection**
   - Choose videos with clear narration/captions
   - Higher quality = better frame extraction
   - Shorter videos (30-60s) work best initially

2. **Frame Selection**
   - Select 4-8 key frames for best results
   - Choose frames with clear subjects
   - Avoid motion-blur frames
   - Include variety of shots (wide, medium, close)

3. **Custom Story**
   - Keep it concise (500-1000 words max)
   - Align with video's theme
   - Use clear scene directions
   - Include brand voice

4. **Asset Upload**
   - High resolution images (min 1000px)
   - PNG for logos (transparency)
   - Consistent style across assets
   - Brand-aligned color schemes

5. **Aspect Ratio**
   - 16:9 for YouTube, web, presentations
   - 9:16 for TikTok, Instagram Reels, Stories
   - Match your target platform

---

## 🐛 Troubleshooting

### Common Issues:

**"No captions available"**
- Video doesn't have subtitles
- Try a different video
- Or use custom story mode

**"Analysis failed"**
- Check internet connection
- Verify Gemini API key
- Try shorter video

**"Frame extraction error"**
- Video may be age-restricted
- Try different timestamps
- Check video privacy settings

**"White screen after clicking Create Storyboard"**
- Check browser console for errors
- Refresh page
- Clear browser cache

---

## 🔮 Future Enhancements

### Planned Features:
- [ ] Batch video analysis
- [ ] Save favorite videos
- [ ] Video comparison mode
- [ ] Advanced analytics dashboard
- [ ] Custom AI prompts
- [ ] Video editing integration
- [ ] Multi-language support
- [ ] Collaboration features
- [ ] Video playlist support
- [ ] A/B testing for storyboards

---

## 📝 Technical Notes

### Performance
- Video analysis: ~10-30 seconds
- Frame extraction: ~5-15 seconds
- Storyboard generation: ~30-60 seconds
- Total workflow: ~2-3 minutes

### Limitations
- Max video length: 10 minutes
- Max frames: 10 per video
- Max custom story: 5000 characters
- File size limits: 10MB per asset

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### API Dependencies
- YouTube Data API v3
- Gemini 1.5 Pro API
- Supabase Edge Functions
- Veo 3.1 (for video generation)

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Check ARCHITECTURE_OVERVIEW_HE.md
4. Open GitHub issue
5. Contact support team

---

**Last Updated**: 2025-11-17
**Version**: 2.0.0
**Author**: BrandFrame Studio Team
