const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint untuk download video
app.post('/api/download', async (req, res) => {
    const { url, platform, resolution } = req.body;
    
    console.log('Download request:', { url, platform, resolution });
    
    // Validasi input
    if (!url || !platform || !resolution) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters: url, platform, resolution'
        });
    }
    
    try {
        let videoData;
        
        // Route berdasarkan platform
        switch (platform) {
            case 'youtube':
                videoData = await handleYouTubeDownload(url, resolution);
                break;
            case 'tiktok':
                videoData = await handleTikTokDownload(url, resolution);
                break;
            case 'instagram':
                videoData = await handleInstagramDownload(url, resolution);
                break;
            case 'auto':
                videoData = await handleAutoDetect(url, resolution);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported platform'
                });
        }
        
        res.json({
            success: true,
            data: videoData
        });
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,