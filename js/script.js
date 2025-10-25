// js/script.js - Complete Fixed Version

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
    document.querySelectorAll('.journal-entry').forEach((entry, index) => {
        const header = entry.querySelector('.collapsible-header');
        if (!header) return;
        
        // Check if header already has proper structure
        const existingSpacer = header.querySelector('.header-spacer');
        const existingActions = header.querySelector('.entry-actions');
        
        if (existingSpacer && existingActions) {
            // Structure exists, just ensure copy button is there
            ensureCopyButton(header, entry);
            return;
        }
        
        // Get the title text from existing content
        let titleText = header.textContent
            .replace(/[▼📋✏️🗑️]/g, '') // Remove all icons
            .replace(/Copy|Edit|Delete/g, '') // Remove button text
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

// Ensure copy button exists in header
function ensureCopyButton(header, entry) {
    const entryActions = header.querySelector('.entry-actions');
    if (!entryActions) return;
    
    // Check if copy button already exists
    if (!entryActions.querySelector('.copy-btn')) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.setAttribute('type', 'button');
        
        // Insert before toggle icon if it exists
        const toggleIcon = entryActions.querySelector('.toggle-icon');
        if (toggleIcon) {
            entryActions.insertBefore(copyBtn, toggleIcon);
        } else {
            entryActions.appendChild(copyBtn);
        }
    }
}

// ===== BROWSER API: CLIPBOARD API - FIXED VERSION =====
function initClipboardAPI() {
    console.log('Initializing Clipboard API...');
    
    // Use event delegation for better performance and dynamic elements
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn') || e.target.closest('.copy-btn')) {
            const copyBtn = e.target.classList.contains('copy-btn') ? e.target : e.target.closest('.copy-btn');
            const entry = copyBtn.closest('.journal-entry');
            
            if (!entry) {
                console.error('Could not find journal entry for copy button');
                return;
            }
            
            e.stopPropagation(); // Prevent triggering collapsible toggle
            
            const title = entry.querySelector('h2')?.textContent || 'Untitled';
            const contentElement = entry.querySelector('.collapsible-content');
            let content = '';
            
            if (contentElement) {
                // Get text content from the collapsible content excluding buttons
                const contentClone = contentElement.cloneNode(true);
                const buttons = contentClone.querySelectorAll('button, .entry-footer');
                buttons.forEach(btn => btn.remove());
                content = contentClone.textContent || '';
            }
            
            const textToCopy = `${title}\n\n${content}`.trim();
            
            console.log('Copying text:', textToCopy);
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Show success feedback
                    const originalHTML = copyBtn.innerHTML;
                    const originalBackground = copyBtn.style.background;
                    
                    copyBtn.innerHTML = '✅ Copied!';
                    copyBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
                    copyBtn.disabled = true;
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                        copyBtn.style.background = originalBackground;
                        copyBtn.disabled = false;
                    }, 2000);
                    
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    fallbackCopyText(textToCopy, copyBtn);
                });
            } else {
                // Fallback for browsers that don't support clipboard API
                fallbackCopyText(textToCopy, copyBtn);
            }
        }
    });
}

// Fallback method for copying text
function fallbackCopyText(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const originalHTML = button.innerHTML;
            const originalBackground = button.style.background;
            
            button.innerHTML = '✅ Copied!';
            button.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = originalBackground;
                button.disabled = false;
            }, 2000);
        } else {
            throw new Error('Copy command failed');
        }
    } catch (err) {
        console.error('Fallback copy failed: ', err);
        const originalHTML = button.innerHTML;
        button.innerHTML = '❌ Failed';
        button.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    } finally {
        document.body.removeChild(textArea);
    }
}

// ===== EDIT JOURNAL ENTRIES FUNCTIONALITY =====
function initEditFunctionality() {
    // Use event delegation for edit buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const editBtn = e.target.classList.contains('edit-btn') ? e.target : e.target.closest('.edit-btn');
            const entry = editBtn.closest('.journal-entry');
            
            if (entry && entry.getAttribute('data-is-new') === 'true') {
                e.stopPropagation();
                toggleEditMode(entry);
            }
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
        showSuccessMessage('Journal entry updated successfully!');
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

// ===== ENHANCED DELETE FUNCTIONALITY =====
function initDeleteFunctionality() {
    // Use event delegation for delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const deleteBtn = e.target.classList.contains('delete-btn') ? e.target : e.target.closest('.delete-btn');
            const entry = deleteBtn.closest('.journal-entry');
            
            if (entry && entry.getAttribute('data-is-new') === 'true') {
                e.stopPropagation();
                const entryId = entry.getAttribute('data-entry-id');
                showDeleteConfirmation(entryId);
            }
        }
    });
}

function showDeleteConfirmation(entryId) {
    // Create confirmation dialog
    const confirmationHTML = `
        <div class="delete-confirmation">
            <div class="confirmation-dialog">
                <h3>🗑️ Delete Journal Entry</h3>
                <p>Are you sure you want to delete this journal entry? This action cannot be undone and the entry will be permanently removed.</p>
                <div class="confirmation-actions">
                    <button class="cancel-delete-btn" onclick="closeDeleteConfirmation()">
                        ↩️ Keep Entry
                    </button>
                    <button class="confirm-delete-btn" onclick="confirmDeleteEntry('${entryId}')">
                        🗑️ Delete Permanently
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    
    // Add escape key listener
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeDeleteConfirmation();
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Store the handler for cleanup
    document.currentDeleteEscapeHandler = escapeHandler;
}

function closeDeleteConfirmation() {
    const confirmation = document.querySelector('.delete-confirmation');
    if (confirmation) {
        confirmation.remove();
    }
    
    // Clean up escape key listener
    if (document.currentDeleteEscapeHandler) {
        document.removeEventListener('keydown', document.currentDeleteEscapeHandler);
        document.currentDeleteEscapeHandler = null;
    }
}

function confirmDeleteEntry(entryId) {
    const entry = document.querySelector(`[data-entry-id="${entryId}"]`);
    const deleteBtn = entry ? entry.querySelector('.delete-btn') : null;
    
    if (deleteBtn) {
        // Show processing state
        deleteBtn.classList.add('processing');
        deleteBtn.innerHTML = '⏳ Deleting...';
        
        setTimeout(() => {
            if (entry) {
                // Add fade out animation
                entry.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                entry.style.opacity = '0';
                entry.style.transform = 'translateX(-100px)';
                entry.style.maxHeight = '0';
                entry.style.overflow = 'hidden';
                
                setTimeout(() => {
                    entry.remove();
                    saveJournalEntries();
                    
                    // Show success message
                    showSuccessMessage('Journal entry deleted successfully!');
                    
                    // Close confirmation dialog
                    closeDeleteConfirmation();
                }, 500);
            }
        }, 1000);
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
            initEditFunctionality();
            saveJournalEntries();
            
            showSuccessMessage('Journal entry added successfully!');
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
                    ${isNewEntry ? '<button class="edit-btn" type="button">✏️ Edit</button>' : ''}
                    <button class="copy-btn" type="button">📋 Copy</button>
                </div>
            </div>
            <div class="collapsible-content">
                <div class="entry-meta">Posted on: ${date}</div>
                <div class="entry-content">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                ${isNewEntry ? `
                <div style="margin-top: 1.5rem; text-align: center;">
                    <button class="delete-btn" type="button">
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
                if (e.target.closest('.copy-btn') || e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
                
                // Toggle the content visibility
                if (content.style.display === 'block' || content.style.display === '') {
                    content.style.display = 'none';
                    this.classList.remove('active');
                } else {
                    content.style.display = 'block';
                    this.classList.add('active');
                }
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

// ===== SUCCESS MESSAGE FUNCTION =====
function showSuccessMessage(message) {
    // Create success notification
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(39, 174, 96, 0.4);
        z-index: 1001;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 300px;
    `;
    
    successMsg.innerHTML = `✅ ${message}`;
    document.body.appendChild(successMsg);
    
    // Auto remove after animation
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 3000);
}

// ===== ENHANCED INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing enhanced features');
    
    // Load reusable navigation first
    loadNavigation();
    
    // Initialize basic features
    displayLiveDate();
    initThemeSwitcher();
    initFormValidation();
    initEnhancedValidation();
    initYouTubeAPI();
    
    // Load saved entries and initialize components with proper timing
    setTimeout(() => {
        console.log('Loading saved entries and initializing components...');
        
        // Load saved entries first
        loadSavedEntries();
        
        // Then ensure proper structure
        ensureHeaderStructure();
        
        // Initialize interactive components
        initCollapsibleSections();
        initClipboardAPI();
        initEditFunctionality();
        initDeleteFunctionality();
        
        console.log('All enhanced features initialized successfully!');
        

        // Demonstrate DOM selection methods
        console.log('DOM Selection Methods Used:');
        console.log('- getElementById: for single elements like live-date, theme-toggle');
        console.log('- querySelectorAll: for multiple elements like collapsible sections');
        console.log('- querySelector: for single element selection');

        // Debug: Log all copy buttons found
        const copyButtons = document.querySelectorAll('.copy-btn');
        console.log(`Found ${copyButtons.length} copy buttons in the document`);
        
    }, 100);
});

// Add keyframes for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;
document.head.appendChild(style);  
        