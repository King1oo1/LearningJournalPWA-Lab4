// js/storage.js - Storage API functionality

// ===== JOURNAL ENTRIES STORAGE =====
function saveJournalEntries() {
    const entries = [];
    

   
    // Get entries in the order they appear (newest first)
    document.querySelectorAll('.journal-entry').forEach(entry => {
        const title = entry.querySelector('h2').textContent;
        const content = entry.querySelector('.collapsible-content').innerHTML;
        const dateElement = entry.querySelector('.entry-meta');
        let date = dateElement ? dateElement.textContent : '';
        
        // If date doesn't have "Posted on:", add it for consistency
        if (date && !date.includes('Posted on:')) {
            date = `Posted on: ${date}`;
        }
        
        entries.unshift({ // Use unshift to add to beginning (reverse order)
            title: title,
            content: content,
            date: date
        });
    });
    
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    console.log('Journal entries saved to localStorage (newest first)');
} 


function loadJournalEntries() {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
        return JSON.parse(savedEntries);
    }
    return null;
}

function restoreJournalEntries() {
    const savedEntries = loadJournalEntries();
    const container = document.getElementById('journal-entries-container');
    
    if (savedEntries && container) {
        // Clear existing entries
        const existingEntries = container.querySelectorAll('.journal-entry');
        existingEntries.forEach(entry => entry.remove());
        
        // Add saved entries in reverse order (newest first)
        savedEntries.reverse().forEach(entry => {
            const entryHTML = createJournalEntry(entry.title, entry.content, entry.date);
            container.insertAdjacentHTML('afterbegin', entryHTML);
        });
        
        console.log('Journal entries restored from localStorage (newest first)');
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