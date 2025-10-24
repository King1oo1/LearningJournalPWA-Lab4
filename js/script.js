// js/script.js - Complete with spaced header layout

// ===== STORAGE API ENHANCEMENTS =====
function saveJournalEntries() {
    const entries = [];
    document.querySelectorAll('.journal-entry').forEach(entry => {
        entries.push({
            title: entry.querySelector('h2').textContent,
            content: entry.querySelector('.collapsible-content').innerHTML,
            date: entry.querySelector('.entry-meta').textContent
        });
    });
    localStorage.setItem('journalEntries', JSON.stringify(entries));
}

function loadJournalEntries() {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
        return JSON.parse(savedEntries);
    }
    return null;
}

// Enhanced theme storage with session storage fallback
function initThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check multiple storage options
    const currentTheme = localStorage.getItem('theme') || 
                        sessionStorage.getItem('theme') ||
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.textContent = '☀️ Light Mode';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            let theme = 'light';
            if (document.body.classList.contains('dark-theme')) {
                theme = 'dark';
                this.textContent = '☀️ Light Mode';
            } else {
                this.textContent = '🌙 Dark Mode';
            }
            
            // Save to both local and session storage
            localStorage.setItem('theme', theme);
            sessionStorage.setItem('theme', theme);
        });
    }
}

// ===== HEADER STRUCTURE MANAGEMENT =====
function ensureHeaderStructure() {
    document.querySelectorAll('.journal-entry').forEach(entry => {
        const header = entry.querySelector('.collapsible-header');
        if (!header) return;
        
        // Get the title text from existing content
        let titleText = header.textContent
            .replace('▼', '')
            .replace('📋 Copy', '')
            .replace('📋 Copy Entry', '')
            .replace('📋', '')
            .trim();
        
        // Clear header and rebuild with proper structure
        header.innerHTML = '';
        
        // Create title element
        const title = document.createElement('h2');
        title.textContent = titleText;
        header.appendChild(title);
        
        // Create spacer element
        const spacer = document.createElement('div');
        spacer.className = 'header-spacer';
        header.appendChild(spacer);
        
        // Create actions container
        const entryActions = document.createElement('div');
        entryActions.className = 'entry-actions';
        
        // Create toggle icon
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'toggle-icon';
        toggleIcon.textContent = '▼';
        toggleIcon.setAttribute('aria-label', 'Toggle section');
        entryActions.appendChild(toggleIcon);
        
        header.appendChild(entryActions);
    });
}

// ===== BROWSER API: CLIPBOARD API =====
function initClipboardAPI() {
    // Add copy buttons to journal entries
    document.querySelectorAll('.journal-entry').forEach(entry => {
        // Check if copy button already exists
        if (entry.querySelector('.copy-btn')) return;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering collapsible toggle
            
            const title = entry.querySelector('h2').textContent;
            const content = entry.querySelector('.collapsible-content').textContent;
            const textToCopy = `${title}\n\n${content}`;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show success feedback with better design
                const originalHTML = this.innerHTML;
                this.innerHTML = '✅ Copied!';
                this.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
                
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                const originalHTML = this.innerHTML;
                this.innerHTML = '❌ Failed';
                this.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
                
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.background = '';
                }, 2000);
            });
        });
        
        // Add copy button to entry actions
        const entryActions = entry.querySelector('.entry-actions');
        if (entryActions) {
            entryActions.appendChild(copyBtn);
        }
    });
}

// ===== BROWSER API: VALIDATION API ENHANCEMENT =====
function initEnhancedValidation() {
    const journalForm = document.getElementById('journal-form');
    const entryInput = document.getElementById('journal-entry');
    
    if (entryInput) {
        entryInput.addEventListener('input', function() {
            // Use Constraint Validation API
            if (this.validity.tooShort) {
                this.setCustomValidity(`Please enter at least ${this.minLength} characters. You have ${this.value.length}.`);
            } else if (this.validity.valueMissing) {
                this.setCustomValidity('Please write your journal entry.');
            } else {
                this.setCustomValidity('');
            }
            
            // Update word count display
            updateWordCount(this.value);
        });
    }
}

function updateWordCount(text) {
    let wordCountEl = document.getElementById('word-count');
    if (!wordCountEl) {
        wordCountEl = document.createElement('div');
        wordCountEl.id = 'word-count';
        wordCountEl.className = 'word-count';
        document.getElementById('journal-entry').parentNode.appendChild(wordCountEl);
    }
    
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    wordCountEl.textContent = `Word count: ${words}`;
    wordCountEl.className = `word-count ${words >= 10 ? 'valid' : 'invalid'}`;
}

// ===== THIRD-PARTY API: YOUTUBE EMBED =====
function initYouTubeAPI() {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// YouTube player global variable
let youtubePlayer;

// This function is called by YouTube API when ready
function onYouTubeIframeAPIReady() {
    const playerContainer = document.getElementById('youtube-player');
    if (playerContainer) {
        youtubePlayer = new YT.Player('youtube-player', {
            height: '315',
            width: '560',
            videoId: 'VIDEO_ID_HERE', // Replace with your video ID
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1
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
    // Add custom controls
    addYouTubeControls();
}

function onPlayerStateChange(event) {
    // You can add custom behavior on state changes
    const states = ['unstarted', 'ended', 'playing', 'paused', 'buffering', 'video cued'];
    console.log('Player state:', states[event.data]);
}

function addYouTubeControls() {
    const controlsDiv = document.getElementById('youtube-controls');
    if (!controlsDiv) return;
    
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

// ===== ENHANCED FORM VALIDATION WITH VALIDATION API =====
function initFormValidation() {
    const journalForm = document.getElementById('journal-form');
    
    if (journalForm) {
        journalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const titleInput = document.getElementById('journal-title');
            const entryInput = document.getElementById('journal-entry');
            const title = titleInput.value.trim();
            const content = entryInput.value.trim();
            
            // Use Validation API
            if (!titleInput.checkValidity()) {
                titleInput.reportValidity();
                return false;
            }
            
            if (!entryInput.checkValidity()) {
                entryInput.reportValidity();
                return false;
            }
            
            // Count words
            const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
            
            if (wordCount < 10) {
                alert(`Please write at least 10 words. You currently have ${wordCount} words.`);
                entryInput.focus();
                return false;
            }
            
            // Create and save new entry
            const now = new Date();
            const dateString = now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const newEntryHTML = createJournalEntry(title, content, dateString);
            const journalFormSection = document.querySelector('.journal-form-section');
            if (journalFormSection) {
                journalFormSection.insertAdjacentHTML('afterend', newEntryHTML);
            }
            
            // Re-initialize features for new entry
            ensureHeaderStructure();
            initCollapsibleSections();
            initClipboardAPI();
            saveJournalEntries();
            
            alert('Journal entry added successfully!');
            journalForm.reset();
            updateWordCount('');
            
            return true;
        });
    }
}

// Enhanced journal entry creation
function createJournalEntry(title, content, date) {
    return `
        <article class="journal-entry collapsible">
            <div class="collapsible-header">
                <h2>${title}</h2>
                <div class="header-spacer"></div>
                <div class="entry-actions">
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            <div class="collapsible-content">
                <div class="entry-meta">Posted on: ${date}</div>
                <div class="entry-content">
                    ${content.replace(/\n/g, '<br>')}
                </div>
            </div>
        </article>
    `;
}

// ===== COLLAPSIBLE SECTIONS =====
function initCollapsibleSections() {
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach(header => {
        // Remove any existing event listeners to prevent duplicates
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
    });
    
    // Re-select after cloning
    const freshHeaders = document.querySelectorAll('.collapsible-header');
    
    freshHeaders.forEach(header => {
        // Find the content for this specific header
        const content = header.nextElementSibling;
        
        if (content && content.classList.contains('collapsible-content')) {
            // Add click event to header
            header.addEventListener('click', function(e) {
                // Don't trigger if click was on copy button
                if (e.target.closest('.copy-btn')) return;
                
                // Toggle the content visibility
                if (content.style.display === 'block' || content.style.display === '') {
                    content.style.display = 'none';
                    this.classList.remove('active');
                    // Update toggle icon
                    const toggleIcon = this.querySelector('.toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.style.transform = 'rotate(0deg)';
                    }
                } else {
                    content.style.display = 'block';
                    this.classList.add('active');
                    // Update toggle icon
                    const toggleIcon = this.querySelector('.toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.style.transform = 'rotate(180deg)';
                    }
                }
            });
            
            // Start with all sections collapsed
            content.style.display = 'none';
        }
    });
}

// ===== REUSABLE NAVIGATION =====
function loadNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navHTML = `
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">Chandandeep Singh</a>
            
            <input type="checkbox" id="nav-toggle" class="nav-toggle">
            <label for="nav-toggle" class="nav-toggle-label">
                <span></span>
                <span></span>
                <span></span>
            </label>
            
            <ul class="nav-menu">
                <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Home</a></li>
                <li><a href="journal.html" class="${currentPage === 'journal.html' ? 'active' : ''}">Journal</a></li>
                <li><a href="about.html" class="${currentPage === 'about.html' ? 'active' : ''}">About</a></li>
                <li><a href="projects.html" class="${currentPage === 'projects.html' ? 'active' : ''}">Projects</a></li>
            </ul>
        </div>
    </nav>`;
    
    // Insert navigation at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// ===== LIVE DATE DISPLAY =====
function displayLiveDate() {
    const dateElement = document.getElementById('live-date');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// ===== STORAGE DEMO FUNCTION =====
function showStorageInfo() {
    const infoDiv = document.getElementById('storage-info');
    const theme = localStorage.getItem('theme') || 'light';
    const entries = localStorage.getItem('journalEntries');
    const entryCount = entries ? JSON.parse(entries).length : 0;
    
    infoDiv.innerHTML = `
        <p><strong>Current Theme:</strong> ${theme}</p>
        <p><strong>Saved Journal Entries:</strong> ${entryCount}</p>
        <p><strong>Storage Used:</strong> ${calculateStorageUsage()} KB</p>
    `;
}

function calculateStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length;
        }
    }
    return (total / 1024).toFixed(2);
}

// ===== ENHANCED INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing enhanced features');
    
    // Load reusable navigation
    loadNavigation();
    
    // Ensure proper header structure first (IMPORTANT)
    ensureHeaderStructure();
    
    // Initialize all features
    displayLiveDate();
    initThemeSwitcher();
    initFormValidation();
    initCollapsibleSections();
    initClipboardAPI();
    initEnhancedValidation();
    initYouTubeAPI();
    
    // Load saved journal entries
    const savedEntries = loadJournalEntries();
    if (savedEntries) {
        console.log('Loaded saved journal entries:', savedEntries);
    }
    
    console.log('All enhanced features initialized successfully!');
    
    // Demonstrate DOM selection methods
    console.log('DOM Selection Methods Used:');
    console.log('- getElementById: for single elements like live-date, theme-toggle');
    console.log('- querySelectorAll: for multiple elements like collapsible sections');
    console.log('- querySelector: for single element selection');
});