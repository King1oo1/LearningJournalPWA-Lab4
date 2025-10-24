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
// Fixed Journal Entry Creation - No duplicate "Posted on:" and only delete for new entries
function createJournalEntry(title, content, date, isNewEntry = false) {
    const deleteButton = isNewEntry ? `
        <div class="entry-footer">
            <button class="delete-btn" onclick="deleteJournalEntry(this)">🗑️ Delete Entry</button>
        </div>
    ` : '';
    
    return `
        <article class="journal-entry collapsible" data-deletable="${isNewEntry}">
            <div class="collapsible-header">
                <h2>${title}</h2>
                <div class="entry-actions">
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            <div class="collapsible-content">
                <div class="entry-meta">${date}</div>
                <div class="entry-content">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                ${deleteButton}
            </div>
        </article>
    `;
}

// Delete Journal Entry Function
function deleteJournalEntry(button) {
    if (confirm('Are you sure you want to delete this journal entry?')) {
        const entry = button.closest('.journal-entry');
        if (entry && entry.getAttribute('data-deletable') === 'true') {
            entry.remove();
            saveJournalEntries(); // Update storage after deletion
            alert('Journal entry deleted successfully!');
        } else {
            alert('This journal entry cannot be deleted.');
        }
    }
}


// Form Validation - Fixed for new entries only
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
            
            // Create new journal entry - MARK AS NEW ENTRY
            const now = new Date();
            const dateString = `Posted on: ${now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}`;
            
            const newEntryHTML = createJournalEntry(title, content, dateString, true); // true = isNewEntry
            const journalEntriesContainer = document.getElementById('journal-entries-container');
            
            // ADD NEW ENTRY AT THE TOP
            if (journalEntriesContainer) {
                journalEntriesContainer.insertAdjacentHTML('afterbegin', newEntryHTML);
            }
            
            // Save to storage and re-initialize ALL features
            saveJournalEntries();
            initCollapsibleSections();
            initClipboardAPI();
            
            alert('Journal entry added successfully!');
            journalForm.reset();
            if (typeof updateWordCount === 'function') {
                updateWordCount('');
            }
            
            return true;
        });
    }
}

// Fixed Collapsible Sections
function initCollapsibleSections() {
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach(header => {
        // Remove any existing event listeners
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
    });
    
    // Re-select after cloning
    const freshHeaders = document.querySelectorAll('.collapsible-header');
    
    freshHeaders.forEach(header => {
        // Ensure entry-actions container exists
        let entryActions = header.querySelector('.entry-actions');
        if (!entryActions) {
            entryActions = document.createElement('div');
            entryActions.className = 'entry-actions';
            
            // Move existing toggle icon into entry-actions
            const toggleIcon = header.querySelector('.toggle-icon');
            if (toggleIcon) {
                header.removeChild(toggleIcon);
                entryActions.appendChild(toggleIcon);
            }
            
            header.appendChild(entryActions);
        }
        
        // Find the content for this specific header
        const content = header.nextElementSibling;
        
        if (content && content.classList.contains('collapsible-content')) {
            // Start with all sections COLLAPSED (display: none)
            content.style.display = 'none';
            header.classList.remove('active');
            
            // Add click event to header
            header.addEventListener('click', function(e) {
                // Don't trigger if click was on copy button or delete button
                if (e.target.closest('.copy-btn') || e.target.closest('.delete-btn')) return;
                
                // Toggle the content visibility
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    this.classList.add('active');
                    // Update toggle icon
                    const toggleIcon = this.querySelector('.toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.style.transform = 'rotate(180deg)';
                    }
                } else {
                    content.style.display = 'none';
                    this.classList.remove('active');
                    // Update toggle icon
                    const toggleIcon = this.querySelector('.toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.style.transform = 'rotate(0deg)';
                    }
                }
            });
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
    
    // Restore journal entries from storage FIRST
    restoreJournalEntries();
    
    // THEN initialize UI components
    initCollapsibleSections();
    initClipboardAPI();
    initEnhancedValidation();
    
    // Initialize Third Party APIs
    initYouTubeAPI();
    
    console.log('All features initialized successfully!');


    // Demonstrate DOM selection methods
    console.log('DOM Selection Methods Used:');
    console.log('- getElementById: for single elements like live-date, theme-toggle');
    console.log('- querySelectorAll: for multiple elements like collapsible sections');
    console.log('- querySelector: for single element selection');
});