// js/storage.js - Storage API functionality

// Save Journal Entries - Fixed to handle existing entries
function saveJournalEntries() {
    const entries = [];
    
    // Get only entries that are deletable (new entries)
    document.querySelectorAll('.journal-entry[data-deletable="true"]').forEach(entry => {
        const title = entry.querySelector('h2').textContent;
        const content = entry.querySelector('.collapsible-content').innerHTML;
        const date = entry.querySelector('.entry-meta').textContent;
        
        entries.unshift({
            title: title,
            content: content,
            date: date,
            deletable: true
        });
    });
    
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    console.log('New journal entries saved to localStorage');
}

// Restore Journal Entries - Fixed to only restore new entries
function restoreJournalEntries() {
    const savedEntries = loadJournalEntries();
    const container = document.getElementById('journal-entries-container');
    
    if (savedEntries && container) {
        // Remove only deletable entries (new ones)
        const deletableEntries = container.querySelectorAll('.journal-entry[data-deletable="true"]');
        deletableEntries.forEach(entry => entry.remove());
        
        // Add saved entries in reverse order (newest first) - only if they're deletable
        savedEntries.reverse().forEach(entry => {
            if (entry.deletable) {
                const entryHTML = createJournalEntry(entry.title, entry.content, entry.date, true);
                container.insertAdjacentHTML('afterbegin', entryHTML);
            }
        });
        
        console.log('New journal entries restored from localStorage');
        return true;
    }
    return false;
}

// ===== THEME STORAGE =====
function saveThemePreference(theme) {
    localStorage.setItem('theme', theme);
    sessionStorage.setItem('theme', theme);
}

function loadThemePreference() {
    return localStorage.getItem('theme') || 
           sessionStorage.getItem('theme') || 
           'light';
}

function applySavedTheme() {
    const savedTheme = loadThemePreference();
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.textContent = '☀️ Light Mode';
    }
}

// ===== STORAGE UTILITIES =====
function clearAllStorage() {
    localStorage.removeItem('journalEntries');
    localStorage.removeItem('theme');
    sessionStorage.removeItem('theme');
    console.log('All storage cleared');
}

function getStorageInfo() {
    const theme = localStorage.getItem('theme') || 'light';
    const entries = localStorage.getItem('journalEntries');
    const entryCount = entries ? JSON.parse(entries).length : 0;
    
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length;
        }
    }
    
    return {
        theme: theme,
        entryCount: entryCount,
        storageUsed: (totalSize / 1024).toFixed(2) + ' KB'
    };
}