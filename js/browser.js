// Enhanced Clipboard API with forced re-initialization
function initClipboardAPI() {
    // Remove existing copy buttons first
    document.querySelectorAll('.copy-btn').forEach(btn => btn.remove());
    
    // Add copy buttons to ALL journal entries
    document.querySelectorAll('.journal-entry').forEach(entry => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.addEventListener('click', function() {
            const title = entry.querySelector('h2').textContent;
            const content = entry.querySelector('.collapsible-content').textContent;
            const textToCopy = `${title}\n\n${content}`;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show success feedback
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
        
        // Add to entry actions
        let entryActions = entry.querySelector('.entry-actions');
        if (entryActions) {
            entryActions.appendChild(copyBtn);
        }
    });
    
    console.log('Copy buttons initialized');
}

// ===== VALIDATION API =====
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

// ===== GEOLOCATION API (BONUS) =====
function initGeolocation() {
    const geoBtn = document.getElementById('geolocation-btn');
    if (geoBtn && navigator.geolocation) {
        geoBtn.style.display = 'block';
        geoBtn.addEventListener('click', getLocation);
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
        locationInfo.innerHTML = `
            <p><strong>Latitude:</strong> ${position.coords.latitude}</p>
            <p><strong>Longitude:</strong> ${position.coords.longitude}</p>
            <p><strong>Accuracy:</strong> ${position.coords.accuracy} meters</p>
        `;
    }
}

function showError(error) {
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                locationInfo.innerHTML = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                locationInfo.innerHTML = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                locationInfo.innerHTML = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                locationInfo.innerHTML = "An unknown error occurred.";
                break;
        }
    }
}