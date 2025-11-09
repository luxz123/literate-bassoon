const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for video download
app.post('/api/download', (req, res) => {
    const { url, platform, resolution } = req.body;
    
    // Validate input
    if (!url || !platform || !resolution) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters: url, platform, resolution'
        });
    }
    
    // In a real application, you would:
    // 1. Validate the URL
    // 2. Use appropriate service/library to extract video info
    // 3. Generate download links based on resolution
    
    // For demo purposes, we'll return mock data
    const mockResponse = generateMockResponse(url, platform, resolution);
    
    // Simulate processing delay
    setTimeout(() => {
        res.json(mockResponse);
    }, 1500);
});

// Generate mock response based on platform
function generateMockResponse(url, platform, resolution) {
    const platforms = ['youtube', 'tiktok', 'instagram'];
    
    if (!platforms.includes(platform)) {
        platform = 'auto';
    }
    
    // Generate mock video data
    const videoId = generateVideoId();
    const title = `Downloaded Video from ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
    const duration = generateRandomDuration(platform);
    
    // Generate download links based on resolution
    const downloadLinks = [];
    const formats = ['mp4', 'mp3', 'webm'];
    
    formats.forEach(format => {
        downloadLinks.push({
            quality: `${resolution}p`,
            format: format,
            url: `https://videodownloader.com/download/${videoId}?quality=${resolution}&format=${format}`,
            size: generateFileSize(resolution, format)
        });
    });
    
    return {
        success: true,
        data: {
            id: videoId,
            title: title,
            thumbnail: `https://img.videodownloader.com/thumbnails/${videoId}.jpg`,
            duration: duration,
            platform: platform,
            downloadLinks: downloadLinks
        }
    };
}

// Helper function to generate random video ID
function generateVideoId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to generate random duration based on platform
function generateRandomDuration(platform) {
    const durations = {
        youtube: () => {
            const minutes = Math.floor(Math.random() * 30) + 1;
            const seconds = Math.floor(Math.random() * 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        },
        tiktok: () => {
            const seconds = Math.floor(Math.random() * 60) + 15;
            return `0:${seconds.toString().padStart(2, '0')}`;
        },
        instagram: () => {
            const seconds = Math.floor(Math.random() * 60) + 15;
            return `0:${seconds.toString().padStart(2, '0')}`;
        }
    };
    
    return durations[platform] ? durations[platform]() : '5:00';
}

// Helper function to generate file size based on resolution and format
function generateFileSize(resolution, format) {
    const baseSizes = {
        '360': { mp4: 15, mp3: 3, webm: 12 },
        '720': { mp4: 45, mp3: 3, webm: 38 },
        '1080': { mp4: 85, mp3: 3, webm: 72 }
    };
    
    const baseSize = baseSizes[resolution] ? baseSizes[resolution][format] : 20;
    const variation = Math.random() * 10 - 5; // -5 to +5 MB variation
    
    return `${(baseSize + variation).toFixed(1)} MB`;
}

// Start server
app.listen(PORT, () => {
    console.log(`Video Downloader server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to use the application`);
});