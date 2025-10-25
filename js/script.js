// js/script.js - Complete with Big YouTube API and Edit Functionality

// ===== STORAGE API ENHANCEMENTS =====
function saveJournalEntries() {
    const entries = [];
    document.querySelectorAll('.journal-entry').forEach(entry => {
        const contentElement = entry.querySelector('.collapsible-content');
        if (contentElement) {
            const isNew = entry.getAttribute('data-is-new') === 'true';
            entries.push({
                title: entry.querySelector('h2').textContent,
                content: contentElement.innerHTML,
                date: entry.querySelector('.entry-meta').textContent,
                isNew: isNew,
                id: entry.getAttribute('data-entry-id')
            });
        }
    });
    localStorage.setItem('journalEntries', JSON.stringify(entries));
}

function loadJournalEntries() {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        // Only load new entries (not Week 1-4)
        const newEntries = entries.filter(entry => entry.isNew);
        return newEntries;
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
        
        // Check if header already has proper structure
        if (header.querySelector('.header-spacer') && header.querySelector('.entry-actions')) {
            return; // Structure already exists
        }
        
        // Get the title text from existing content
        let titleText = header.textContent
            .replace('▼', '')
            .replace('📋 Copy', '')
            .replace('✏️ Edit', '')
            .replace('🗑️ Delete', '')
            .replace('📋', '')
            .replace('✏️', '')
            .replace('🗑️', '')
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
        
        // Add edit button only for new entries
        const isNewEntry = entry.getAttribute('data-is-new') === 'true';
        if (isNewEntry) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️ Edit';
            editBtn.setAttribute('type', 'button');
            entryActions.appendChild(editBtn);
        }
        
        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.setAttribute('type', 'button');
        entryActions.appendChild(copyBtn);
        
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
        copyBtn.setAttribute('type', 'button');
        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering collapsible toggle
            
            const title = entry.querySelector('h2').textContent;
            const contentElement = entry.querySelector('.collapsible-content');
            const content = contentElement ? contentElement.textContent : '';
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

// ===== EDIT JOURNAL ENTRIES FUNCTIONALITY =====
function initEditFunctionality() {
    // Add edit functionality to new entries only
    document.querySelectorAll('.journal-entry[data-is-new="true"]').forEach(entry => {
        const editBtn = entry.querySelector('.edit-btn');
        if (editBtn) {
            // Remove existing event listeners
            const newEditBtn = editBtn.cloneNode(true);
            editBtn.parentNode.replaceChild(newEditBtn, editBtn);
            
            // Add click event to the new button
            newEditBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleEditMode(entry);
            });
        }
    });
}

function toggleEditMode(entry) {
    const isEditing = entry.classList.contains('edit-mode');
    
    if (isEditing) {
        // Save changes
        const titleInput = entry.querySelector('.edit-title');
        const contentTextarea = entry.querySelector('.edit-content');
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        
        if (!title) {
            alert('Title cannot be empty!');
            titleInput.focus();
            return;
        }
        
        if (!content) {
            alert('Content cannot be empty!');
            contentTextarea.focus();
            return;
        }
        
        // Update display
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        entry.querySelector('.collapsible-header').replaceChild(titleElement, titleInput);
        
        const contentElement = document.createElement('div');
        contentElement.className = 'entry-content';
        contentElement.innerHTML = content.replace(/\n/g, '<br>');
        entry.querySelector('.collapsible-content').replaceChild(contentElement, contentTextarea);
        
        entry.classList.remove('edit-mode');
        entry.querySelector('.edit-btn').innerHTML = '✏️ Edit';
        
        // Save to localStorage
        saveJournalEntries();
        
        // Show success message
        alert('Journal entry updated successfully!');
    } else {
        // Enter edit mode
        const title = entry.querySelector('h2').textContent;
        const content = entry.querySelector('.entry-content').textContent;
        
        // Create edit inputs
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'edit-title';
        titleInput.value = title;
        titleInput.style.cssText = `
            width: 100%;
            padding: 0.5rem;
            border: 2px solid #3498db;
            border-radius: 4px;
            font-size: 1.3rem;
            font-weight: 600;
            background: var(--card-bg);
            color: var(--text-color);
            margin-bottom: 1rem;
        `;
        
        const contentTextarea = document.createElement('textarea');
        contentTextarea.className = 'edit-content';
        contentTextarea.value = content;
        contentTextarea.style.cssText = `
            width: 100%;
            height: 200px;
            padding: 1rem;
            border: 2px solid #27ae60;
            border-radius: 4px;
            font-family: inherit;
            font-size: 1rem;
            line-height: 1.6;
            background: var(--card-bg);
            color: var(--text-color);
            resize: vertical;
        `;
        
        // Replace content with inputs
        const header = entry.querySelector('.collapsible-header');
        header.replaceChild(titleInput, entry.querySelector('h2'));
        
        const contentContainer = entry.querySelector('.collapsible-content');
        contentContainer.replaceChild(contentTextarea, entry.querySelector('.entry-content'));
        
        entry.classList.add('edit-mode');
        entry.querySelector('.edit-btn').innerHTML = '💾 Save';
        
        // Focus on title input
        titleInput.focus();
    }
}

function deleteJournalEntry(entryId) {
    if (confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
        const entry = document.querySelector(`[data-entry-id="${entryId}"]`);
        if (entry) {
            entry.style.opacity = '0.7';
            entry.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                entry.remove();
                saveJournalEntries();
                alert('Journal entry deleted successfully!');
            }, 300);
        }
    }
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
        const entryInput = document.getElementById('journal-entry');
        if (entryInput) {
            entryInput.parentNode.appendChild(wordCountEl);
        }
    }
    
    const words = text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
    wordCountEl.textContent = `Word count: ${words}`;
    wordCountEl.className = `word-count ${words >= 10 ? 'valid' : 'invalid'}`;
}

// ===== THIRD-PARTY API: YOUTUBE EMBED =====
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
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}

// YouTube player global variable
let youtubePlayer;

// This function is called by YouTube API when ready
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API ready');
    createYouTubePlayer();
};

function createYouTubePlayer() {
    const playerContainer = document.getElementById('youtube-player');
    if (!playerContainer) return;
    
    try {
        youtubePlayer = new YT.Player('youtube-player', {
            height: '405',
            width: '720',
            videoId: 'WXsD0ZgxjRw',
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1,
                'enablejsapi': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        console.log('YouTube player created successfully with video: WXsD0ZgxjRw');
    } catch (error) {
        console.error('Error creating YouTube player:', error);
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
            
            const newEntryHTML = createJournalEntry(title, content, dateString, true);
            const journalFormSection = document.querySelector('.journal-form-section');
            if (journalFormSection) {
                journalFormSection.insertAdjacentHTML('afterend', newEntryHTML);
            }
            
            // Re-initialize features for new entry
            ensureHeaderStructure();
            initCollapsibleSections();
            initClipboardAPI();
            initEditFunctionality();
            saveJournalEntries();
            
            alert('Journal entry added successfully!');
            journalForm.reset();
            updateWordCount('');
            
            return true;
        });
    }
}

// Enhanced journal entry creation with edit functionality
function createJournalEntry(title, content, date, isNewEntry = false) {
    const entryId = isNewEntry ? 'entry-' + Date.now() : '';
    
    return `
        <article class="journal-entry collapsible" data-entry-id="${entryId}" data-is-new="${isNewEntry}">
            <div class="collapsible-header">
                <h2>${title}</h2>
                <div class="header-spacer"></div>
                <div class="entry-actions">
                    <span class="toggle-icon">▼</span>
                    ${isNewEntry ? '<button class="edit-btn">✏️ Edit</button>' : ''}
                    <button class="copy-btn">📋 Copy</button>
                </div>
            </div>
            <div class="collapsible-content">
                <div class="entry-meta">Posted on: ${date}</div>
                <div class="entry-content">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                ${isNewEntry ? `
                <div class="entry-footer">
                    <button class="delete-btn" onclick="deleteJournalEntry('${entryId}')">
                        🗑️ Delete Entry
                    </button>
                </div>
                ` : ''}
            </div>
        </article>
    `;
}

// ===== COLLAPSIBLE SECTIONS =====
function initCollapsibleSections() {
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach((header, index) => {
        // Remove any existing event listeners by cloning
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        // Get the new header and its content
        const freshHeader = document.querySelectorAll('.collapsible-header')[index];
        const content = freshHeader.nextElementSibling;
        
        if (content && content.classList.contains('collapsible-content')) {
            // Set initial state - all collapsed
            content.style.display = 'none';
            freshHeader.classList.remove('active');
            
            // Add click event to header
            freshHeader.addEventListener('click', function(e) {
                // Don't trigger if click was on copy button or edit button
                if (e.target.closest('.copy-btn') || e.target.closest('.edit-btn')) return;
                
                console.log('Header clicked, current display:', content.style.display);
                
                // Toggle the content visibility
                if (content.style.display === 'block' || content.style.display === '') {
                    content.style.display = 'none';
                    this.classList.remove('active');
                } else {
                    content.style.display = 'block';
                    this.classList.add('active');
                }
                
                // Force a reflow to ensure animation works
                content.offsetHeight;
            });
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

// ===== LOAD SAVED ENTRIES =====
function loadSavedEntries() {
    const savedEntries = loadJournalEntries();
    if (savedEntries && savedEntries.length > 0) {
        const journalFormSection = document.querySelector('.journal-form-section');
        if (journalFormSection) {
            savedEntries.forEach(entry => {
                const entryHTML = createJournalEntry(entry.title, entry.content, entry.date, true);
                journalFormSection.insertAdjacentHTML('afterend', entryHTML);
            });
        }
    }
}

// ===== ENHANCED INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing enhanced features');
    
    // Load reusable navigation
    loadNavigation();
    
    // Initialize basic features first
    displayLiveDate();
    initThemeSwitcher();
    initFormValidation();
    initEnhancedValidation();
    initYouTubeAPI();
    
    // Load saved entries and initialize components
    setTimeout(() => {
        loadSavedEntries();
        ensureHeaderStructure();
        initCollapsibleSections();
        initClipboardAPI();
        initEditFunctionality();
        
        console.log('All enhanced features initialized successfully!');
        
        // Demonstrate DOM selection methods
        console.log('DOM Selection Methods Used:');
        console.log('- getElementById: for single elements like live-date, theme-toggle');
        console.log('- querySelectorAll: for multiple elements like collapsible sections');
        console.log('- querySelector: for single element selection');
    }, 100);
});