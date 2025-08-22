import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Alternative approach: Use a more reliable service or implement direct download
// For now, we'll simulate the download process with a placeholder
const YOUTUBE_DL_API_URL = "https://api.cobalt.tools/api/json"

interface DownloadRequest {
  url: string
  format?: string
  quality?: string
}

interface VideoInfo {
  title: string
  duration: string
  thumbnail: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url, format = 'mp4', quality = 'best[height<=1080]' }: DownloadRequest = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate YouTube URL
    const youtubePatterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
    ]

    const isValidYouTubeUrl = youtubePatterns.some(pattern => pattern.test(url))
    
    if (!isValidYouTubeUrl) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Processing YouTube URL: ${url}`)

    // Extract video ID from URL
    let videoId = ''
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        videoId = match[1]
        break
      }
    }

    if (!videoId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Could not extract video ID from URL'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Extracted video ID: ${videoId}`)

    try {
      // First, get video info to validate the video exists
      const infoUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      const infoResponse = await fetch(infoUrl)
      
      if (!infoResponse.ok) {
        throw new Error('Video not found, private, or restricted')
      }
      
      const videoInfo = await infoResponse.json()
      console.log('Video info retrieved:', videoInfo.title)

      // Use a working YouTube downloader API
      // Try multiple services for better reliability
      const downloaderServices = [
        {
          name: 'SaveFrom',
          url: 'https://ssyoutube.com/api/convert',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { url: `https://www.youtube.com/watch?v=${videoId}` }
        },
        {
          name: 'Y2mate',
          url: `https://www.y2mate.com/mates/analyzeV2/ajax`,
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `url=https://www.youtube.com/watch?v=${videoId}&q_auto=1&ajax=1`
        }
      ]

      // Try the first available service
      for (const service of downloaderServices) {
        try {
          console.log(`Trying ${service.name} service...`)
          
          const downloadResponse = await fetch(service.url, {
            method: service.method,
            headers: service.headers,
            body: typeof service.body === 'string' ? service.body : JSON.stringify(service.body)
          })

          if (downloadResponse.ok) {
            const downloadData = await downloadResponse.json()
            console.log(`${service.name} response:`, downloadData)

            // Extract download URL based on service response format
            let downloadUrl = null
            if (downloadData.url) downloadUrl = downloadData.url
            if (downloadData.dlink) downloadUrl = downloadData.dlink
            if (downloadData.links && downloadData.links.mp4) {
              downloadUrl = Object.values(downloadData.links.mp4)[0]?.url
            }

            if (downloadUrl) {
              console.log('Found download URL, fetching video...')
              
              // Download the actual video file
              const videoResponse = await fetch(downloadUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              })

              if (videoResponse.ok) {
                const videoBuffer = await videoResponse.arrayBuffer()
                const fileSizeInMB = videoBuffer.byteLength / (1024 * 1024)
                
                console.log(`Video downloaded: ${fileSizeInMB.toFixed(1)}MB`)

                // Check file size limit
                if (fileSizeInMB > 100) {
                  return new Response(
                    JSON.stringify({ 
                      success: false,
                      error: `Video too large (${fileSizeInMB.toFixed(1)}MB). Maximum size is 100MB.`
                    }),
                    { 
                      status: 413, 
                      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                    }
                  )
                }

                // Convert to base64
                const videoBase64 = btoa(String.fromCharCode(...new Uint8Array(videoBuffer)))

                return new Response(
                  JSON.stringify({
                    success: true,
                    videoBlob: videoBase64,
                    videoInfo: {
                      title: videoInfo.title || 'YouTube Video',
                      duration: 'Unknown',
                      thumbnail: videoInfo.thumbnail_url || ''
                    },
                    fileSizeInMB: Math.round(fileSizeInMB * 10) / 10,
                    service: service.name
                  }),
                  { 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                  }
                )
              }
            }
          }
        } catch (serviceError) {
          console.log(`${service.name} failed:`, serviceError.message)
          continue
        }
      }

      // If all services failed, return error
      throw new Error('All download services are currently unavailable')

    } catch (error) {
      console.error('Error processing video:', error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to download video: ${error.message}. This may be due to video restrictions or service availability.`
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    /* 
    // Future implementation would go here
    // This would require proper yt-dlp installation on the server
    // and careful consideration of YouTube's terms of service
    
    console.log(`Downloading video from: ${url}`)

    // Use a proper video downloading service
    const downloadResponse = await fetch('YOUR_VIDEO_DOWNLOAD_SERVICE', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        url: url,
        format: 'mp4',
        quality: 'best[height<=1080]'
      })
    })

    if (!downloadResponse.ok) {
      console.error('Download service error:', await downloadResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to process video URL' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const downloadData = await downloadResponse.json()
    
    if (!downloadData.success || !downloadData.downloadUrl) {
      console.error('Download processing failed:', downloadData)
      return new Response(
        JSON.stringify({ 
          error: downloadData.error || 'Failed to download video' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Download the actual video file
    console.log('Downloading video file from:', downloadData.downloadUrl)
    const videoResponse = await fetch(downloadData.downloadUrl)
    
    if (!videoResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to download video file' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get video data as array buffer
    const videoBuffer = await videoResponse.arrayBuffer()
    
    // Check file size (limit to ~100MB for reasonable processing)
    const fileSizeInMB = videoBuffer.byteLength / (1024 * 1024)
    if (fileSizeInMB > 100) {
      return new Response(
        JSON.stringify({ 
          error: `Video file too large (${fileSizeInMB.toFixed(1)}MB). Please choose a shorter video or lower quality.` 
        }),
        { 
          status: 413, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Convert to base64 for JSON response
    const videoBase64 = btoa(String.fromCharCode(...new Uint8Array(videoBuffer)))

    // Extract video info from the download service
    const videoInfo: VideoInfo = {
      title: downloadData.title || 'YouTube Video',
      duration: downloadData.duration || 'Unknown',
      thumbnail: downloadData.thumbnail || ''
    }

    console.log(`Successfully downloaded video: ${videoInfo.title} (${fileSizeInMB.toFixed(1)}MB)`)

    return new Response(
      JSON.stringify({
        success: true,
        videoBlob: videoBase64,
        videoInfo: videoInfo,
        fileSizeInMB: Math.round(fileSizeInMB * 10) / 10
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    */

  } catch (error) {
    console.error('YouTube downloader error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
