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
    
    // Show loading
    showLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
        processVideo(url, currentPlatform, currentResolution);
        showLoading(false);
    }, 2000);
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
function processVideo(url, platform, resolution) {
    // In a real app, this would be an API call to your backend
    // For demo purposes, we'll simulate the response
    
    const mockData = {
        thumbnail: getMockThumbnail(platform),
        title: getMockTitle(platform),
        duration: getMockDuration(platform),
        downloadLinks: generateDownloadLinks(platform, resolution)
    };
    
    // Update UI with mock data
    updatePreview(mockData);
    
    // Show success notification
    showNotification('Link download berhasil dibuat!', 'success');
}

// Get mock thumbnail based on platform
function getMockThumbnail(platform) {
    const thumbnails = {
        youtube: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        tiktok: 'https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/05f512b3d3e84f5fa60d4b4b5d4b5b5b?x-expires=1635764400&x-signature=K7k%2B%2Bv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2Fw%3D%3D',
        instagram: 'https://scontent.cdninstagram.com/v/t51.2885-15/273441111_123456789012345_1234567890123456789_n.jpg?stp=dst-jpg_e35&_nc_ht=scontent.cdninstagram.com&_nc_cat=1&_nc_ohc=abcdefghijk-AbCdEfGhIjK&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=abcdefghijklmnopqrstuvwxyz123456&oh=00_abcdefghijklmnopqrstuvwxyz&oe=12345678'
    };
    
    return thumbnails[platform] || thumbnails.youtube;
}

// Get mock title based on platform
function getMockTitle(platform) {
    const titles = {
        youtube: 'Video YouTube Menarik - Tutorial Terbaru 2023',
        tiktok: 'TikTok Viral Challenge #fyp #trending',
        instagram: 'Instagram Reel Keren - Jangan Lewatkan!'
    };
    
    return titles[platform] || 'Video Download - Video Downloader';
}

// Get mock duration based on platform
function getMockDuration(platform) {
    const durations = {
        youtube: '10:25',
        tiktok: '0:45',
        instagram: '0:30'
    };
    
    return durations[platform] || '5:00';
}

// Generate download links based on platform and resolution
function generateDownloadLinks(platform, resolution) {
    const baseUrls = {
        youtube: 'https://youtube.com/download',
        tiktok: 'https://tiktok.com/download',
        instagram: 'https://instagram.com/download'
    };
    
    const baseUrl = baseUrls[platform] || 'https://videodownloader.com/download';
    
    return [
        { quality: `${resolution}p MP4`, url: `${baseUrl}?quality=${resolution}&format=mp4` },
        { quality: `${resolution}p MP3`, url: `${baseUrl}?quality=${resolution}&format=mp3` },
        { quality: `${resolution}p WEBM`, url: `${baseUrl}?quality=${resolution}&format=webm` }
    ];
}

// Update preview section with video data
function updatePreview(data) {
    videoThumbnail.src = data.thumbnail;
    videoTitle.textContent = data.title;
    videoDuration.textContent = `Duration: ${data.duration}`;
    
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
        downloadLink.addEventListener('click', () => {
            trackDownload(link.quality);
        });
        
        downloadLinks.appendChild(downloadLink);
    });
    
    // Show preview content
    previewPlaceholder.style.display = 'none';
    previewContent.style.display = 'block';
}

// Track download (for analytics)
function trackDownload(quality) {
    console.log(`Download initiated: ${quality}`);
    // In a real app, you would send this to your analytics service
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