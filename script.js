// Main application script for SaveItBro Cricket
class CricketStreamingApp {
    constructor() {
        this.channels = [];
        this.filteredChannels = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.isDarkMode = false;
        // Hero slider properties
        this.heroSlides = [
            'images/hero-bg-1.jpg',
            'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1574771875745-9dcf7b2c7b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1578928474139-8d4dc2c3bd42?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
            // Additional images can be added via admin panel
        ];
        this.currentSlide = 0;
        this.slideInterval = null;
        
        this.init();
    }

    init() {
        this.loadInitialData();
        this.setupEventListeners();
        this.setupTheme();
        this.initHeroSlider();
        this.hideLoadingScreen();
    }

    loadInitialData() {
        // Load channels from localStorage or use default channels
        const savedChannels = localStorage.getItem('cricketChannels');
        
        if (savedChannels) {
            this.channels = JSON.parse(savedChannels);
        } else {            // Initialize with default channels
            this.channels = [
                {
                    id: 'willow-tv',
                    matchTitle: 'Live Cricket on Willow TV',
                    channelName: 'Willow TV',
                    embedCode: '<iframe frameborder="0" marginheight="0" marginwidth="0" height="520" src="https://soplay.pro/embed2.php?id=willow" name="iframe_a" scrolling="no" width="640">Your Browser Do not Support Iframe</iframe>',
                    category: 'Sports',
                    description: 'Premium cricket streaming channel',
                    dateAdded: new Date().toISOString(),
                    thumbnail: {
                        type: 'url',
                        value: 'images/willow-tv-logo.svg'
                    }
                },
                {
                    id: 'sky-sports',
                    matchTitle: 'Sky Sports Cricket Live',
                    channelName: 'Sky Sports Cricket',
                    embedCode: '<iframe frameborder="0" marginheight="0" marginwidth="0" height="520" src="https://soplay.pro/embed2.php?id=skysp2" name="iframe_a" scrolling="no" width="640">Your Browser Do not Support Iframe</iframe>',
                    category: 'Sports',
                    description: 'Sky Sports cricket coverage',
                    dateAdded: new Date().toISOString(),
                    thumbnail: {
                        type: 'url',
                        value: 'images/sky-sports-logo.svg'
                    }
                },
                {
                    id: 'star-sports',
                    matchTitle: 'Star Sports 1 Cricket',
                    channelName: 'Star Sports 1',
                    embedCode: '<iframe frameborder="0" marginheight="0" marginwidth="0" height="520" src="https://soplay.pro/embed2.php?id=starsp" name="iframe_a" scrolling="no" width="640">Your Browser Do not Support Iframe</iframe>',
                    category: 'Sports',
                    description: 'Star Sports cricket streaming',
                    dateAdded: new Date().toISOString(),
                    thumbnail: {
                        type: 'url',
                        value: 'images/star-sports-logo.svg'
                    }
                }
            ];
            this.saveChannels();
        }

        this.filteredChannels = [...this.channels];
        this.renderChannels();
        this.updateChannelCount();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterChannels();
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                this.currentFilter = e.target.dataset.category;
                this.filterChannels();
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Modal functionality
        const modal = document.getElementById('stream-modal');
        const modalClose = document.getElementById('modal-close');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Navigation smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });        // Listen for storage changes (for admin panel communication)
        window.addEventListener('storage', (e) => {
            console.log('Storage event received:', e.key);
            if (e.key === 'cricketChannels') {
                this.loadChannelsFromStorage();
            }
        });

        // Listen for custom storage events (for same-window communication)
        window.addEventListener('channelsUpdated', () => {
            console.log('Channels updated event received');
            this.loadChannelsFromStorage();
        });

        // Listen for more specific cricket channels events
        window.addEventListener('cricketChannelsChanged', (e) => {
            console.log('Cricket channels changed event received:', e.detail);
            this.loadChannelsFromStorage();
        });

        // Mobile navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }

    // Hero Slider Methods
    initHeroSlider() {
        this.loadHeroImages();
        this.setupHeroControls();
        this.startAutoSlide();
    }

    loadHeroImages() {
        // Load additional hero images from localStorage
        const savedImages = localStorage.getItem('heroImages');
        if (savedImages) {
            const additionalImages = JSON.parse(savedImages);
            // Combine pre-loaded images with additional images from admin panel
            const allImages = [
                'images/hero-bg-1.jpg',
                'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
                'https://images.unsplash.com/photo-1574771875745-9dcf7b2c7b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
                'https://images.unsplash.com/photo-1578928474139-8d4dc2c3bd42?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
                ...additionalImages.map(img => img.url)
            ];
            this.heroSlides = allImages;
        }

        this.updateHeroSlider();
        this.updateHeroIndicators();
    }

    setupHeroControls() {
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }

        // Add click handlers to indicators
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('indicator')) {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.goToSlide(slideIndex);
            }
        });

        // Pause auto-slide on hover
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                this.pauseAutoSlide();
            });

            heroSection.addEventListener('mouseleave', () => {
                this.startAutoSlide();
            });
        }
    }

    updateHeroSlider() {
        const slider = document.querySelector('.hero-background-slider');
        if (!slider) return;

        // Clear existing slides
        slider.innerHTML = '';

        // Create slides
        this.heroSlides.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `hero-slide ${index === this.currentSlide ? 'active' : ''}`;
            slide.style.backgroundImage = `url('${image}')`;
            slider.appendChild(slide);
        });
    }

    updateHeroIndicators() {
        const indicatorsContainer = document.getElementById('hero-indicators');
        if (!indicatorsContainer) return;

        // Clear existing indicators
        indicatorsContainer.innerHTML = '';

        // Create indicators
        this.heroSlides.forEach((_, index) => {
            const indicator = document.createElement('span');
            indicator.className = `indicator ${index === this.currentSlide ? 'active' : ''}`;
            indicator.dataset.slide = index;
            indicatorsContainer.appendChild(indicator);
        });
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
        this.updateSlideDisplay();
    }

    previousSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.heroSlides.length - 1 : this.currentSlide - 1;
        this.updateSlideDisplay();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlideDisplay();
    }

    updateSlideDisplay() {
        // Update slides
        const slides = document.querySelectorAll('.hero-slide');
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Update indicators
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    startAutoSlide() {
        this.pauseAutoSlide(); // Clear any existing interval
        if (this.heroSlides.length > 1) {
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, 5000); // Change slide every 5 seconds
        }
    }

    pauseAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    addHeroImage(imageUrl) {
        if (!this.heroSlides.includes(imageUrl)) {
            this.heroSlides.push(imageUrl);
            this.saveHeroImages();
            this.updateHeroSlider();
            this.updateHeroIndicators();
            this.startAutoSlide();
        }
    }

    removeHeroImage(imageUrl) {
        const index = this.heroSlides.indexOf(imageUrl);
        if (index > 0) { // Don't remove the first default image
            this.heroSlides.splice(index, 1);
            if (this.currentSlide >= this.heroSlides.length) {
                this.currentSlide = 0;
            }
            this.saveHeroImages();
            this.updateHeroSlider();
            this.updateHeroIndicators();
            this.updateSlideDisplay();
            this.startAutoSlide();
        }
    }

    saveHeroImages() {
        // Define pre-loaded images
        const preloadedImages = [
            'images/hero-bg-1.jpg',
            'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1574771875745-9dcf7b2c7b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            'https://images.unsplash.com/photo-1578928474139-8d4dc2c3bd42?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        ];
        
        // Save only additional images (excluding pre-loaded ones)
        const additionalImages = this.heroSlides.filter(slide => !preloadedImages.includes(slide));
        const imageObjects = additionalImages.map(url => ({ url, id: Date.now().toString() + Math.random() }));
        localStorage.setItem('heroImages', JSON.stringify(imageObjects));
    }

    setupTheme() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.isDarkMode = savedTheme === 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon();
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        const theme = this.isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }
        }, 1000);
    }

    filterChannels() {
        this.filteredChannels = this.channels.filter(channel => {
            const matchesSearch = this.searchTerm === '' || 
                channel.matchTitle.toLowerCase().includes(this.searchTerm) ||
                channel.channelName.toLowerCase().includes(this.searchTerm);
            
            const matchesFilter = this.currentFilter === 'all' || 
                channel.category === this.currentFilter;
            
            return matchesSearch && matchesFilter;
        });

        this.renderChannels();
    }    renderChannels() {
        const streamsGrid = document.getElementById('streams-grid');
        const noResults = document.getElementById('no-results');
        
        if (!streamsGrid) return;

        if (this.filteredChannels.length === 0) {
            streamsGrid.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        streamsGrid.innerHTML = this.filteredChannels.map(channel => {
            const thumbnailUrl = this.getThumbnailUrl(channel);
            const thumbnailContent = thumbnailUrl 
                ? `<img src="${thumbnailUrl}" alt="${this.escapeHtml(channel.channelName)} logo" class="channel-logo">`
                : `<i class="fas fa-play-circle"></i>`;
            
            return `
                <div class="stream-card" onclick="app.openStream('${channel.id}')">
                    <div class="stream-thumbnail ${thumbnailUrl ? 'has-logo' : ''}">
                        ${thumbnailContent}
                        <div class="live-badge">
                            <i class="fas fa-circle"></i>
                            LIVE
                        </div>
                    </div>
                    <div class="stream-info">
                        <h3 class="stream-title">${this.escapeHtml(channel.matchTitle)}</h3>
                        <div class="stream-channel">
                            <i class="fas fa-tv"></i>
                            ${this.escapeHtml(channel.channelName)}
                        </div>
                        <div class="stream-meta">
                            <span class="category-tag">${channel.category}</span>
                            <button class="watch-btn">
                                <i class="fas fa-play"></i>
                                Watch Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Helper method to get thumbnail URL for display
    getThumbnailUrl(channel) {
        if (!channel.thumbnail) return null;
        
        if (channel.thumbnail.type === 'url') {
            return channel.thumbnail.value;
        } else if (channel.thumbnail.type === 'upload') {
            return channel.thumbnail.value; // Base64 data URL
        }
        
        return null;
    }

    openStream(channelId) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        const modal = document.getElementById('stream-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalChannel = document.getElementById('modal-channel');
        const streamContainer = document.getElementById('stream-container');
        
        if (!modal || !modalTitle || !modalChannel || !streamContainer) return;

        modalTitle.textContent = channel.matchTitle;
        modalChannel.textContent = channel.channelName;
        streamContainer.innerHTML = channel.embedCode;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('stream-modal');
        const streamContainer = document.getElementById('stream-container');
        
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        if (streamContainer) {
            streamContainer.innerHTML = '';
        }
    }    loadChannelsFromStorage() {
        console.log('Loading channels from storage...');
        const savedChannels = localStorage.getItem('cricketChannels');
        if (savedChannels) {
            this.channels = JSON.parse(savedChannels);
            this.filteredChannels = [...this.channels];
            this.filterChannels();
            this.updateChannelCount();
            console.log('Channels loaded:', this.channels.length);
        }
    }

    saveChannels() {
        localStorage.setItem('cricketChannels', JSON.stringify(this.channels));
    }

    updateChannelCount() {
        const totalChannelsElement = document.getElementById('total-channels');
        if (totalChannelsElement) {
            totalChannelsElement.textContent = this.channels.length;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods for external use
    addChannel(channelData) {
        const newChannel = {
            id: this.generateId(),
            ...channelData,
            dateAdded: new Date().toISOString()
        };
        
        this.channels.push(newChannel);
        this.saveChannels();
        this.filterChannels();
        this.updateChannelCount();
        
        return newChannel;
    }

    updateChannel(channelId, channelData) {
        const index = this.channels.findIndex(c => c.id === channelId);
        if (index !== -1) {
            this.channels[index] = {
                ...this.channels[index],
                ...channelData
            };
            this.saveChannels();
            this.filterChannels();
            return true;
        }
        return false;
    }

    deleteChannel(channelId) {
        this.channels = this.channels.filter(c => c.id !== channelId);
        this.saveChannels();
        this.filterChannels();
        this.updateChannelCount();
    }

    generateId() {
        return 'channel-' + Math.random().toString(36).substr(2, 9);
    }
}

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
    `;
    
    const container = document.getElementById('toast-container') || createToastContainer();
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CricketStreamingApp();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
        if (app) {
            app.closeModal();
        }
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    // Close mobile menu on resize
    const navMenu = document.getElementById('nav-menu');
    if (navMenu && window.innerWidth > 768) {
        navMenu.classList.remove('active');
    }
});

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}
