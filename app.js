// DOM Elements
const videoUrlInput = document.getElementById('video-url');
const pasteBtn = document.getElementById('paste-btn');
const platformButtons = document.querySelectorAll('.platform-btn');
const resolutionButtons = document.querySelectorAll('.resolution-btn');
const generateBtn = document.getElementById('generate-btn');
const previewPlaceholder = document.getElementById('preview-placeholder');
const previewContent = document.getElementById('preview-content');
const videoThumbnail = document.getElementById('video-thumbnail');
const videoTitle = document.getElementById('video-title');
const videoDuration = document.getElementById('video-duration');
const videoPlatform = document.getElementById('video-platform');
const downloadLinks = document.getElementById('download-links');
const loadingOverlay = document.getElementById('loading-overlay');

// Current selections
let currentPlatform = 'auto';
let currentResolution = '720';

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Paste button event
    pasteBtn.addEventListener('click', handlePaste);
    
    // Platform selection
    platformButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            platformButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlatform = btn.dataset.platform;
        });
    });
    
    // Resolution selection
    resolutionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            resolutionButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentResolution = btn.dataset.resolution;
        });
    });
    
    // Generate button
    generateBtn.addEventListener('click', handleGenerate);
    
    // Enter key in URL input
    videoUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGenerate();
        }
    });
}

// Handle paste from clipboard
async function handlePaste() {
    try {
        const text = await navigator.clipboard.readText();
        videoUrlInput.value = text;
        
        // Auto-detect platform if set to auto
        if (currentPlatform === 'auto') {
            detectPlatform(text);
        }
        
        showNotification('URL berhasil ditempel!', 'success');
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        showNotification('Gagal mengakses clipboard. Silakan tempel manual.', 'error');
    }
}

// Detect platform from URL
function detectPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        setActivePlatform('youtube');
    } else if (url.includes('tiktok.com')) {
        setActivePlatform('tiktok');
    } else if (url.includes('instagram.com')) {
        setActivePlatform('instagram');
    }
}

// Set active platform button
function setActivePlatform(platform) {
    platformButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.platform === platform) {
            btn.classList.add('active');
            currentPlatform = platform;
        }
    });
}

// Handle generate download links
function handleGenerate() {
    const url = videoUrlInput.value.trim();
    
    if (!url) {
        showNotification('Silakan masukkan URL video', 'error');
        return;
    }
    
    // Validate URL format
    if (!isValidUrl(url)) {
        showNotification('URL tidak valid', 'error');
        return;
    }
    
    // Auto-detect platform if needed
    if (currentPlatform === 'auto') {
        detectPlatform(url);
    }
    
    // Show loading
    showLoading(true);
    
    // Process video
    processVideo(url, currentPlatform, currentResolution);
}

// Validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Process video and show preview
async function processVideo(url, platform, resolution) {
    try {
        // Call our backend API
        const videoData = await fetchDownloadInfo(url, platform, resolution);
        
        // Update UI with real data
        updatePreview(videoData);
        
        // Show success notification
        showNotification('Link download berhasil dibuat!', 'success');
    } catch (error) {
        console.error('Process video error:', error);
        showNotification(error.message || 'Gagal memproses video', 'error');
        
        // Fallback to mock data if API fails
        const mockData = getMockVideoData(url, platform, resolution);
        updatePreview(mockData);
    } finally {
        showLoading(false);
    }
}

// API call to backend
async function fetchDownloadInfo(url, platform, resolution) {
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                platform: platform,
                resolution: resolution
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch download info');
        }
        
        return data.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Get mock data as fallback
function getMockVideoData(url, platform, resolution) {
    const videoId = generateVideoId();
    
    const platforms = {
        youtube: {
            title: 'YouTube Video Tutorial - Panduan Lengkap 2023',
            duration: '10:25',
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            platform: 'YouTube'
        },
        tiktok: {
            title: 'TikTok Viral Challenge #fyp #trending',
            duration: '0:45',
            thumbnail: 'https://example.com/tiktok-thumbnail.jpg',
            platform: 'TikTok'
        },
        instagram: {
            title: 'Instagram Reel Keren - Jangan Lewatkan!',
            duration: '0:30',
            thumbnail: 'https://example.com/instagram-thumbnail.jpg',
            platform: 'Instagram'
        }
    };
    
    const platformData = platforms[platform] || platforms.youtube;
    
    return {
        id: videoId,
        title: platformData.title,
        thumbnail: platformData.thumbnail,
        duration: platformData.duration,
        platform: platformData.platform,
        downloadLinks: generateDownloadLinks(platform, resolution)
    };
}

// Generate download links based on platform and resolution
function generateDownloadLinks(platform, resolution) {
    const baseUrls = {
        youtube: '/api/download/youtube',
        tiktok: '/api/download/tiktok',
        instagram: '/api/download/instagram'
    };
    
    const baseUrl = baseUrls[platform] || '/api/download';
    
    const links = [
        { quality: `${resolution}p MP4`, format: 'mp4', url: `${baseUrl}?quality=${resolution}&format=mp4` },
        { quality: `${resolution}p MP3`, format: 'mp3', url: `${baseUrl}?quality=audio&format=mp3` }
    ];
    
    // Add additional quality options
    if (resolution === '360') {
        links.push({ quality: '720p MP4', format: 'mp4', url: `${baseUrl}?quality=720&format=mp4` });
    } else if (resolution === '720') {
        links.push({ quality: '1080p MP4', format: 'mp4', url: `${baseUrl}?quality=1080&format=mp4` });
    }
    
    return links;
}

// Update preview section with video data
function updatePreview(data) {
    videoThumbnail.src = data.thumbnail;
    videoThumbnail.alt = data.title;
    videoTitle.textContent = data.title;
    videoDuration.textContent = `Duration: ${data.duration}`;
    videoPlatform.textContent = `Platform: ${data.platform}`;
    
    // Generate download links
    downloadLinks.innerHTML = '';
    data.downloadLinks.forEach(link => {
        const downloadLink = document.createElement('a');
        downloadLink.href = link.url;
        downloadLink.className = 'download-link';
        downloadLink.target = '_blank';
        downloadLink.innerHTML = `
            <i class="fas fa-download"></i>
            <span>${link.quality}</span>
        `;
        
        // Add click event to track downloads
        downloadLink.addEventListener('click', (e) => {
            e.preventDefault();
            trackDownload(link.quality, data.platform);
            // In real implementation, this would start the download
            simulateDownload(link.quality);
        });
        
        downloadLinks.appendChild(downloadLink);
    });
    
    // Show preview content
    previewPlaceholder.style.display = 'none';
    previewContent.style.display = 'block';
}

// Track download (for analytics)
function trackDownload(quality, platform) {
    console.log(`Download initiated: ${quality} from ${platform}`);
    showNotification(`Mengunduh ${quality}...`, 'success');
}

// Simulate download (in real app, this would be actual download)
function simulateDownload(quality) {
    showNotification(`Download ${quality} berhasil!`, 'success');
}

// Generate random video ID
function generateVideoId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Show/hide loading overlay
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #00b09b, #96c93d)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #ff416c, #ff4b2b)';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}