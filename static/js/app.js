// Global variables
let entries = JSON.parse(localStorage.getItem('travelEntries')) || [];
let currentRating = 0;
let currentImage = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
function initializeApp() {
    renderEntries();
    updateTagFilter();
    setupRatingInput();
    setDefaultDate();
}

// Setup rating input handlers
function setupRatingInput() {
    document.querySelectorAll('.rating-input span').forEach(star => {
        star.onclick = function() {
            currentRating = parseInt(this.dataset.rating);
            document.getElementById('rating').value = currentRating;
            updateRatingDisplay();
        };
    });
}

// Update rating display
function updateRatingDisplay() {
    document.querySelectorAll('.rating-input span').forEach((star, index) => {
        star.classList.toggle('active', index < currentRating);
    });
}

// Set default date to today
function setDefaultDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

// Preview uploaded image
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            displayImagePreview(currentImage);
        };
        reader.readAsDataURL(file);
    }
}

// Display image preview
function displayImagePreview(imageSrc) {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = `
        <div class="image-preview">
            <img src="${imageSrc}" alt="Preview">
            <button type="button" class="image-preview-remove" onclick="removeImage()">×</button>
        </div>
    `;
}

// Remove image
function removeImage() {
    currentImage = null;
    document.getElementById('image').value = '';
    document.getElementById('imagePreviewContainer').innerHTML = '';
}

// Save entry
function saveEntry(event) {
    event.preventDefault();
    
    const entry = {
        id: Date.now(),
        location: document.getElementById('location').value,
        date: document.getElementById('date').value,
        notes: document.getElementById('notes').value,
        tags: document.getElementById('tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag),
        rating: currentRating,
        image: currentImage,
        isDraft: false
    };
    
    entries.unshift(entry);
    localStorage.setItem('travelEntries', JSON.stringify(entries));
    
    showMessage('Entry saved successfully!');
    setTimeout(() => {
        resetForm();
        showMainView();
        renderEntries();
        updateTagFilter();
    }, 1500);
    
    return false;
}

// Save as draft
function saveDraft() {
    showMessage('Draft saved!');
    setTimeout(() => {
        resetForm();
        showMainView();
    }, 1500);
}

// Show success message
function showMessage(message) {
    const messageElement = document.getElementById('successMessage');
    messageElement.textContent = message;
    messageElement.classList.add('show');
    setTimeout(() => messageElement.classList.remove('show'), 3000);
}

// Reset form
function resetForm() {
    document.getElementById('entryForm').reset();
    currentRating = 0;
    currentImage = null;
    document.getElementById('rating').value = '0';
    document.querySelectorAll('.rating-input span').forEach(star => {
        star.classList.remove('active');
    });
    document.getElementById('imagePreviewContainer').innerHTML = '';
    setDefaultDate();
}

// Render diary card
function renderCard(entry) {
    const stars = '★'.repeat(entry.rating) + '☆'.repeat(5 - entry.rating);
    const imageHtml = entry.image 
        ? `<img src="${entry.image}" alt="${entry.location}">` 
        : '🌍';
    
    const tagsHtml = entry.tags.length 
        ? `<div class="tags">${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` 
        : '';
    
    return `
        <div class="diary-card" onclick='showEntryDetails(${JSON.stringify(entry).replace(/'/g, "&apos;")})'>
            <div class="diary-card-image">${imageHtml}</div>
            <div class="diary-card-content">
                <div class="diary-card-header">
                    <div>
                        <h3>${entry.location}</h3>
                        <div class="diary-card-date">${new Date(entry.date).toLocaleDateString()}</div>
                    </div>
                    <div class="rating">${stars}</div>
                </div>
                <div class="diary-card-notes">${entry.notes}</div>
                ${tagsHtml}
            </div>
        </div>
    `;
}

// Show entry details
function showEntryDetails(entry) {
    const details = `${entry.location}\n\nDate: ${new Date(entry.date).toLocaleDateString()}\nRating: ${'★'.repeat(entry.rating)}\n\n${entry.notes}\n\nTags: ${entry.tags.join(', ')}`;
    alert(details);
}

// Render all entries
function renderEntries() {
    const grid = document.getElementById('diaryGrid');
    const featured = document.getElementById('featuredSection');
    
    if (!entries.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                <h3>No travel entries yet</h3>
                <p>Start documenting your adventures!</p>
            </div>
        `;
        featured.innerHTML = '';
        return;
    }
    
    renderFeaturedEntry(entries[0], featured);
    grid.innerHTML = entries.map(renderCard).join('');
}

// Render featured entry
function renderFeaturedEntry(entry, container) {
    const dateFormatted = new Date(entry.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const preview = entry.notes.substring(0, 150) + (entry.notes.length > 150 ? '...' : '');
    
    container.innerHTML = `
        <div class="featured-card">
            <h2>📍 Most Recent Trip</h2>
            <h3 style="font-size:1.5rem;margin:0.5rem 0">${entry.location}</h3>
            <p>${dateFormatted}</p>
            <p style="margin-top:0.5rem">${preview}</p>
        </div>
    `;
}

// Filter entries
function filterEntries() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedTag = document.getElementById('filterTag').value;
    
    const filtered = entries.filter(entry => {
        const matchesSearch = entry.location.toLowerCase().includes(searchTerm) ||
                            entry.notes.toLowerCase().includes(searchTerm) ||
                            entry.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesTag = !selectedTag || entry.tags.includes(selectedTag);
        
        return matchesSearch && matchesTag;
    });
    
    displayFilteredEntries(filtered);
}

// Display filtered entries
function displayFilteredEntries(filtered) {
    const grid = document.getElementById('diaryGrid');
    
    if (filtered.length) {
        grid.innerHTML = filtered.map(renderCard).join('');
    } else {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No entries found</h3>
                <p>Try adjusting your search or filter</p>
            </div>
        `;
    }
}

// Update tag filter dropdown
function updateTagFilter() {
    const allTags = [...new Set(entries.flatMap(entry => entry.tags))];
    const select = document.getElementById('filterTag');
    
    select.innerHTML = '<option value="">All Tags</option>' + 
        allTags.map(tag => `<option value="${tag}">${tag}</option>`).join('');
}

// Show main view
function showMainView() {
    document.getElementById('mainView').classList.add('active');
    document.getElementById('addView').classList.remove('active');
    renderEntries();
}

// Show add view
function showAddView() {
    document.getElementById('mainView').classList.remove('active');
    document.getElementById('addView').classList.add('active');
    resetForm();
}
