// js/thirdparty.js - Third Party API functionality

// ===== YOUTUBE PLAYER API =====
let youtubePlayer;

function initYouTubeAPI() {
    const playerContainer = document.getElementById('youtube-player');
    if (!playerContainer) return;
    
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// This function is called by YouTube API when ready
function onYouTubeIframeAPIReady() {
    const playerContainer = document.getElementById('youtube-player');
    if (playerContainer) {
        youtubePlayer = new YT.Player('youtube-player', {
            height: '315',
            width: '560',
            videoId: 'M7lc1UVf-VE', // YouTube API documentation video
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1,
                'showinfo': 0,
                'controls': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

function onPlayerReady(event) {
    console.log('YouTube player ready');
    addYouTubeControls();
}

function onPlayerStateChange(event) {
    const states = ['unstarted', 'ended', 'playing', 'paused', 'buffering', 'video cued'];
    console.log('Player state:', states[event.data]);
}

function addYouTubeControls() {
    const controlsDiv = document.getElementById('youtube-controls');
    if (!controlsDiv || !youtubePlayer) return;
    
    controlsDiv.innerHTML = `
        <button onclick="youtubePlayer.playVideo()">
            <span style="font-size:1.2em">▶️</span> Play
        </button>
        <button onclick="youtubePlayer.pauseVideo()">
            <span style="font-size:1.2em">⏸️</span> Pause
        </button>
        <button onclick="youtubePlayer.stopVideo()">
            <span style="font-size:1.2em">⏹️</span> Stop
        </button>
        <button onclick="youtubePlayer.mute()">
            <span style="font-size:1.2em">🔇</span> Mute
        </button>
        <button onclick="youtubePlayer.unMute()">
            <span style="font-size:1.2em">🔊</span> Unmute
        </button>
    `;
}

// ===== WEATHER API (BONUS) =====
function initWeatherAPI() {
    const weatherBtn = document.getElementById('weather-btn');
    if (weatherBtn) {
        weatherBtn.addEventListener('click', getWeather);
    }
}

function getWeather() {
    // Using OpenWeatherMap API (you'll need to get a free API key)
    const apiKey = 'YOUR_API_KEY'; // Replace with actual API key
    const city = 'London';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const weatherInfo = document.getElementById('weather-info');
            if (weatherInfo) {
                weatherInfo.innerHTML = `
                    <p><strong>Weather in ${data.name}:</strong></p>
                    <p>Temperature: ${data.main.temp}°C</p>
                    <p>Condition: ${data.weather[0].description}</p>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            const weatherInfo = document.getElementById('weather-info');
            if (weatherInfo) {
                weatherInfo.innerHTML = '<p>Unable to fetch weather data</p>';
            }
        });
}