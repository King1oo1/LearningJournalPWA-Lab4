// js/thirdparty.js - Third-Party API Functions

// ===== THIRD-PARTY API: YOUTUBE EMBED =====
let youtubePlayer = null;

function initYouTubeAPI() {
    const playerContainer = document.getElementById('youtube-player');
    if (!playerContainer) {
        console.log('YouTube player container not found');
        return;
    }
    
    console.log('Initializing YouTube API...');
    
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
        createYouTubePlayer();
    } else {
        // Load YouTube IFrame API
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.onerror = function() {
            console.error('Failed to load YouTube API');
            showYouTubeFallback();
        };
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        // Set timeout as backup in case onYouTubeIframeAPIReady never fires
        setTimeout(function() {
            if (!youtubePlayer && window.YT) {
                createYouTubePlayer();
            }
        }, 3000);
    }
}

// Fallback if YouTube API fails to load
function showYouTubeFallback() {
    const playerContainer = document.getElementById('youtube-player');
    if (playerContainer) {
        playerContainer.innerHTML = `
            <div style="background: #000; color: white; padding: 2rem; text-align: center; border-radius: 8px;">
                <h3>🎬 YouTube Video</h3>
                <p>JavaScript APIs Tutorial</p>
                <a href="https://www.youtube.com/watch?v=WXsD0ZgxjRw" target="_blank" 
                   style="color: #ff0000; text-decoration: underline; font-weight: bold;">
                   Watch on YouTube
                </a>
            </div>
        `;
    }
}

// This function is called by YouTube API when ready
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API ready - creating player');
    createYouTubePlayer();
};

function createYouTubePlayer() {
    const playerContainer = document.getElementById('youtube-player');
    if (!playerContainer) return;
    
    try {
        youtubePlayer = new YT.Player('youtube-player', {
            height: '405',
            width: '720',
            videoId: 'WXsD0ZgxjRw', // JavaScript APIs tutorial video
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1,
                'enablejsapi': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
        console.log('YouTube player created successfully');
    } catch (error) {
        console.error('Error creating YouTube player:', error);
        showYouTubeFallback();
    }
}

function onPlayerReady(event) {
    console.log('YouTube player ready');
    // Add custom controls
    addYouTubeControls();
}

function onPlayerStateChange(event) {
    // You can add custom behavior on state changes
    const states = ['unstarted', 'ended', 'playing', 'paused', 'buffering', 'video cued'];
    console.log('Player state:', states[event.data]);
}

function onPlayerError(event) {
    console.error('YouTube player error:', event.data);
    showYouTubeFallback();
}

function addYouTubeControls() {
    const controlsDiv = document.getElementById('youtube-controls');
    if (!controlsDiv) return;
    
    controlsDiv.innerHTML = `
        <div class="youtube-controls-grid">
            <button onclick="youtubePlayer.playVideo()" class="yt-control-btn play-btn">
                <span>▶️</span> Play
            </button>
            <button onclick="youtubePlayer.pauseVideo()" class="yt-control-btn pause-btn">
                <span>⏸️</span> Pause
            </button>
            <button onclick="youtubePlayer.stopVideo()" class="yt-control-btn stop-btn">
                <span>⏹️</span> Stop
            </button>
            <button onclick="youtubePlayer.mute()" class="yt-control-btn mute-btn">
                <span>🔇</span> Mute
            </button>
            <button onclick="youtubePlayer.unMute()" class="yt-control-btn unmute-btn">
                <span>🔊</span> Unmute
            </button>
        </div>
    `;
}

// Make functions globally available for onclick handlers
window.youtubePlay = function() { if (youtubePlayer) youtubePlayer.playVideo(); };
window.youtubePause = function() { if (youtubePlayer) youtubePlayer.pauseVideo(); };
window.youtubeStop = function() { if (youtubePlayer) youtubePlayer.stopVideo(); };
window.youtubeMute = function() { if (youtubePlayer) youtubePlayer.mute(); };
window.youtubeUnmute = function() { if (youtubePlayer) youtubePlayer.unMute(); };