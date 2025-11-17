import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Helper function to map video style to YouTube API parameters
function getStyleParams(style: string): { videoDuration?: string; queryModifier?: string } {
  const styleMap: Record<string, { videoDuration?: string; queryModifier?: string }> = {
    "shorts": { videoDuration: "short" },
    "long-form": { videoDuration: "long" },
    "tutorial": { queryModifier: "tutorial" },
    "review": { queryModifier: "review" },
    "vlog": { queryModifier: "vlog" },
    "music": { queryModifier: "music video" },
    "gaming": { queryModifier: "gaming" },
    "educational": { queryModifier: "educational" },
    "entertainment": { queryModifier: "entertainment" },
  };
  return styleMap[style] || {};
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/youtube-api\/?/, "");
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");

    if (!apiKey) {
      throw new Error("YOUTUBE_API_KEY not configured");
    }

    // Route: /video-styles
    if (path === "video-styles") {
      const styles = [
        { style: "shorts", label: "Shorts", icon: "🎬", durationRange: { min: 0, max: 60 } },
        { style: "long-form", label: "Long Form", icon: "📺", durationRange: { min: 600, max: Infinity } },
        { style: "tutorial", label: "Tutorial", icon: "📚" },
        { style: "review", label: "Review", icon: "⭐" },
        { style: "vlog", label: "Vlog", icon: "📹" },
        { style: "music", label: "Music", icon: "🎵" },
        { style: "gaming", label: "Gaming", icon: "🎮" },
        { style: "educational", label: "Educational", icon: "🎓" },
        { style: "entertainment", label: "Entertainment", icon: "🎭" },
      ];

      return new Response(
        JSON.stringify({ success: true, styles }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Route: /video-categories
    if (path === "video-categories") {
      const regionCode = url.searchParams.get("regionCode") || "US";
      
      const categoriesUrl = `${YOUTUBE_API_BASE_URL}/videoCategories?part=snippet&regionCode=${regionCode}&key=${apiKey}`;
      const categoriesResponse = await fetch(categoriesUrl);
      const categoriesData = await categoriesResponse.json();

      if (!categoriesData.items || categoriesData.items.length === 0) {
        return new Response(
          JSON.stringify({ success: true, categories: [] }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const categories = categoriesData.items
        .filter((item: any) => item.snippet.assignable) // Only include assignable categories
        .map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
        }));

      return new Response(
        JSON.stringify({ success: true, categories }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Route: /search-by-style
    if (path === "search-by-style") {
      const style = url.searchParams.get("style") || "shorts";
      const query = url.searchParams.get("query") || "";
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const sortBy = url.searchParams.get("sortBy") || "relevance";
      const categoryId = url.searchParams.get("categoryId");

      const styleParams = getStyleParams(style);
      let searchQuery = query.trim();
      
      if (styleParams.queryModifier) {
        searchQuery = searchQuery ? `${searchQuery} ${styleParams.queryModifier}` : styleParams.queryModifier;
      } else if (style === "shorts" && !searchQuery) {
        searchQuery = "shorts";
      }

      let searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
      
      if (styleParams.videoDuration) {
        searchUrl += `&videoDuration=${styleParams.videoDuration}`;
      }

      // Add category filter if provided
      if (categoryId) {
        searchUrl += `&videoCategoryId=${categoryId}`;
      }

      // Add order parameter
      if (sortBy === "date") {
        searchUrl += "&order=date";
      } else if (sortBy === "viewCount") {
        searchUrl += "&order=viewCount";
      } else if (sortBy === "rating") {
        searchUrl += "&order=rating";
      }
      // relevance is default

      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return new Response(
          JSON.stringify({ success: true, videos: [] }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
      const videosUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();

      const videos = videosData.items.map((video: any) => {
        const durationSeconds = parseDuration(video.contentDetails.duration);
        const viewCount = parseInt(video.statistics.viewCount || "0");
        const likeCount = parseInt(video.statistics.likeCount || "0");
        const commentCount = parseInt(video.statistics.commentCount || "0");
        const engagementRate = viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;

        return {
          id: video.id,
          videoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
          thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
          channelName: video.snippet.channelTitle,
          channelTitle: video.snippet.channelTitle,
          viewCount,
          likeCount,
          commentCount,
          duration: durationSeconds,
          durationRaw: video.contentDetails.duration,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          videoStyle: style,
          categoryId: video.snippet.categoryId,
          tags: video.snippet.tags || [],
          engagementRate: parseFloat(engagementRate.toFixed(2)),
        };
      });

      // Sort by engagement if requested
      if (sortBy === "engagement") {
        videos.sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
      } else if (sortBy === "likes") {
        videos.sort((a, b) => b.likeCount - a.likeCount);
      } else if (sortBy === "views") {
        videos.sort((a, b) => b.viewCount - a.viewCount);
      }

      return new Response(
        JSON.stringify({ success: true, videos }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Route: /trending-shorts
    if (path === "trending-shorts" || path === "") {
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const query = url.searchParams.get("query") || "";
      const style = url.searchParams.get("style") || "shorts";
      const categoryId = url.searchParams.get("categoryId");

      const styleParams = getStyleParams(style);
      let searchQuery = query.trim();
      
      if (styleParams.queryModifier) {
        searchQuery = searchQuery ? `${searchQuery} ${styleParams.queryModifier}` : styleParams.queryModifier;
      } else if (style === "shorts" && !searchQuery) {
        searchQuery = "shorts";
      }

      let searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
      
      if (styleParams.videoDuration) {
        searchUrl += `&videoDuration=${styleParams.videoDuration}`;
      }

      // Add category filter if provided
      if (categoryId) {
        searchUrl += `&videoCategoryId=${categoryId}`;
      }

      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return new Response(
          JSON.stringify({ success: true, videos: [] }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
      const videosUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();

      const videos = videosData.items.map((video: any) => {
        const durationSeconds = parseDuration(video.contentDetails.duration);
        const viewCount = parseInt(video.statistics.viewCount || "0");
        const likeCount = parseInt(video.statistics.likeCount || "0");
        const commentCount = parseInt(video.statistics.commentCount || "0");
        const engagementRate = viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;

        return {
          id: video.id,
          videoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
          thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
          channelName: video.snippet.channelTitle,
          channelTitle: video.snippet.channelTitle,
          viewCount,
          likeCount,
          commentCount,
          duration: durationSeconds,
          durationRaw: video.contentDetails.duration,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          videoStyle: style,
          categoryId: video.snippet.categoryId,
          tags: video.snippet.tags || [],
          engagementRate: parseFloat(engagementRate.toFixed(2)),
        };
      });

      return new Response(
        JSON.stringify({ success: true, videos }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Route: /video/:videoId
    if (path.startsWith("video/")) {
      const videoId = path.split("/")[1];
      const videosUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();

      if (!videosData.items || videosData.items.length === 0) {
        throw new Error("Video not found");
      }

      const video = videosData.items[0];
      const thumbnailUrl = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url;
      const videoData = {
        id: video.id,
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: thumbnailUrl,
        thumbnailUrl: thumbnailUrl,
        channelName: video.snippet.channelTitle,
        channelTitle: video.snippet.channelTitle,
        viewCount: parseInt(video.statistics.viewCount || "0"),
        likeCount: parseInt(video.statistics.likeCount || "0"),
        commentCount: parseInt(video.statistics.commentCount || "0"),
        duration: parseDuration(video.contentDetails.duration),
        url: `https://www.youtube.com/watch?v=${video.id}`,
      };

      return new Response(
        JSON.stringify({ success: true, video: videoData }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Route: /video/:videoId/comments
    if (path.includes("/comments")) {
      const videoId = path.split("/")[1];
      const maxResults = parseInt(url.searchParams.get("maxResults") || "10");
      
      const commentsUrl = `${YOUTUBE_API_BASE_URL}/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&key=${apiKey}`;
      const commentsResponse = await fetch(commentsUrl);
      const commentsData = await commentsResponse.json();

      const comments = commentsData.items?.map((item: any) => ({
        id: item.id,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        likeCount: item.snippet.topLevelComment.snippet.likeCount,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
      })) || [];

      return new Response(
        JSON.stringify({ success: true, comments }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Route: /video/:videoId/captions
    if (path.includes("/captions")) {
      const videoId = path.split("/")[1];
      
      // First, get list of captions
      const captionsListUrl = `${YOUTUBE_API_BASE_URL}/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;
      const captionsListResponse = await fetch(captionsListUrl);
      const captionsListData = await captionsListResponse.json();

      if (!captionsListData.items || captionsListData.items.length === 0) {
        return new Response(
          JSON.stringify({ success: true, captions: [] }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Get the first available caption track (prefer English, then any)
      const captionTrack = captionsListData.items.find((item: any) => 
        item.snippet.language === "en" || item.snippet.language.startsWith("en")
      ) || captionsListData.items[0];

      if (!captionTrack) {
        return new Response(
          JSON.stringify({ success: true, captions: [] }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Download the caption track
      const captionDownloadUrl = `${YOUTUBE_API_BASE_URL}/captions/${captionTrack.id}?tfmt=srt&key=${apiKey}`;
      const captionDownloadResponse = await fetch(captionDownloadUrl);
      const captionText = await captionDownloadResponse.text();

      return new Response(
        JSON.stringify({ 
          success: true, 
          captions: {
            id: captionTrack.id,
            language: captionTrack.snippet.language,
            name: captionTrack.snippet.name,
            text: captionText,
          }
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    throw new Error("Invalid route");
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});