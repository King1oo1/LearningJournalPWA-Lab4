// js/script.js - Main JavaScript file

// ===== NAVIGATION & CORE FUNCTIONS =====
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
    
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// Live Date Display
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

// Theme Switcher
function initThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Apply saved theme first
    applySavedTheme();
    
    // Toggle theme when button is clicked
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
            
            saveThemePreference(theme);
        });
    }
}

// Journal Entry Creation
function createJournalEntry(title, content, date) {
    return `
        <article class="journal-entry collapsible">
            <div class="collapsible-header">
                <h2>${title}</h2>
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

// Form Validation - UPDATED TO ADD ENTRIES AT TOP
function initFormValidation() {
    const journalForm = document.getElementById('journal-form');
    
    if (journalForm) {
        journalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const titleInput = document.getElementById('journal-title');
            const entryInput = document.getElementById('journal-entry');
            const title = titleInput.value.trim();
            const content = entryInput.value.trim();
            
            // Validation
            if (!title) {
                alert('Please enter a title for your journal entry.');
                titleInput.focus();
                return false;
            }
            
            const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
            if (wordCount < 10) {
                alert(`Please write at least 10 words. You currently have ${wordCount} words.`);
                entryInput.focus();
                return false;
            }
            
            // Create new journal entry
            const now = new Date();
            const dateString = now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const newEntryHTML = createJournalEntry(title, content, dateString);
            const journalEntriesContainer = document.getElementById('journal-entries-container');
            
            // ADD NEW ENTRY AT THE TOP (after the form section)
            if (journalEntriesContainer) {
                journalEntriesContainer.insertAdjacentHTML('afterbegin', newEntryHTML);
            }
            
            // Save to storage and re-initialize
            saveJournalEntries();
            initCollapsibleSections();
            initClipboardAPI();
            
            alert('Journal entry added successfully!');
            journalForm.reset();
            updateWordCount('');
            
            return true;
        });
    }
}

// Collapsible Sections
function initCollapsibleSections() {
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach(header => {
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
    });
    
    const freshHeaders = document.querySelectorAll('.collapsible-header');
    
    freshHeaders.forEach(header => {
        let entryActions = header.querySelector('.entry-actions');
        if (!entryActions) {
            entryActions = document.createElement('div');
            entryActions.className = 'entry-actions';
            
            const toggleIcon = header.querySelector('.toggle-icon');
            if (toggleIcon) {
                header.removeChild(toggleIcon);
                entryActions.appendChild(toggleIcon);
            }
            
            header.appendChild(entryActions);
        }
        
        const content = header.nextElementSibling;
        
        if (content && content.classList.contains('collapsible-content')) {
            header.addEventListener('click', function(e) {
                if (e.target.closest('.copy-btn')) return;
                
                if (content.style.display === 'block' || content.style.display === '') {
                    content.style.display = 'none';
                    this.classList.remove('active');
                    const toggleIcon = this.querySelector('.toggle-icon');
                    if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
                } else {
                    content.style.display = 'block';
                    this.classList.add('active');
                    const toggleIcon = this.querySelector('.toggle-icon');
                    if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
                }
            });
            
            content.style.display = 'none';
        }
    });
}

// Storage Demo Function
function showStorageInfo() {
    const info = getStorageInfo();
    const infoDiv = document.getElementById('storage-info');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <p><strong>Current Theme:</strong> ${info.theme}</p>
            <p><strong>Saved Journal Entries:</strong> ${info.entryCount}</p>
            <p><strong>Storage Used:</strong> ${info.storageUsed}</p>
        `;
    }
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing all features');
    
    // Load reusable navigation
    loadNavigation();
    
    // Initialize core features
    displayLiveDate();
    initThemeSwitcher();
    initFormValidation();
    initCollapsibleSections();
    
    // Initialize Browser APIs
    initClipboardAPI();
    initEnhancedValidation();
    initGeolocation();
    
    // Initialize Third Party APIs
    initYouTubeAPI();
    initWeatherAPI();
    
    // Restore journal entries from storage
    restoreJournalEntries();
    
    console.log('All features initialized successfully!');

    // Demonstrate DOM selection methods
    console.log('DOM Selection Methods Used:');
    console.log('- getElementById: for single elements like live-date, theme-toggle');
    console.log('- querySelectorAll: for multiple elements like collapsible sections');
    console.log('- querySelector: for single element selection');
});