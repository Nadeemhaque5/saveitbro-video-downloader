// Admin Panel JavaScript for SaveItBro Cricket
class CricketAdmin {
    constructor() {
        this.channels = [];
        this.currentTab = 'dashboard';
        this.editingChannelId = null;
        this.isDarkMode = false;
        this.heroImages = [];
        
        this.init();
    }

    init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            window.location.href = 'login.html';
            return;
        }
        
        this.loadChannels();
        this.loadHeroImages();
        this.setupEventListeners();
        this.setupTheme();
        this.updateDashboard();
        this.renderChannelsTable();
        this.renderHeroImages();
        this.startSessionMonitoring();
    }

    checkAuthentication() {
        const sessionData = localStorage.getItem('adminSession');
        
        if (!sessionData) {
            return false;
        }

        try {
            const session = JSON.parse(sessionData);
            
            if (!session.isAuthenticated || Date.now() >= session.expiresAt) {
                localStorage.removeItem('adminSession');
                return false;
            }

            return true;
        } catch (error) {
            localStorage.removeItem('adminSession');
            return false;
        }
    }

    startSessionMonitoring() {
        // Check session every minute
        setInterval(() => {
            if (!this.checkAuthentication()) {
                this.showToast('Session expired. Please login again.', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        }, 60000);

        // Warn user 5 minutes before session expires
        setInterval(() => {
            const sessionData = localStorage.getItem('adminSession');
            if (sessionData) {
                try {
                    const session = JSON.parse(sessionData);
                    const timeUntilExpiry = session.expiresAt - Date.now();
                    const fiveMinutes = 5 * 60 * 1000;

                    if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
                        this.showToast('Your session will expire in 5 minutes', 'warning');
                    }
                } catch (error) {
                    // Ignore errors
                }
            }
        }, 60000);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminSession');
            this.showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    loadChannels() {
        const savedChannels = localStorage.getItem('cricketChannels');
        if (savedChannels) {
            this.channels = JSON.parse(savedChannels);
        } else {
            this.channels = [];
        }
    }

    // Hero Images Management Methods
    loadHeroImages() {
        const savedImages = localStorage.getItem('heroImages');
        if (savedImages) {
            this.heroImages = JSON.parse(savedImages);
        } else {
            this.heroImages = [];
        }
    }

    addHeroImage() {
        const form = document.getElementById('add-image-form');
        const formData = new FormData(form);
        
        const imageData = {
            url: formData.get('imageUrl').trim(),
            title: formData.get('imageTitle').trim() || 'Untitled Image',
            id: this.generateId(),
            dateAdded: new Date().toISOString()
        };

        // Validate URL
        if (!this.isValidImageUrl(imageData.url)) {
            this.showToast('Please enter a valid image URL', 'error');
            return;
        }

        // Check if image already exists
        if (this.heroImages.some(img => img.url === imageData.url)) {
            this.showToast('This image is already added', 'warning');
            return;
        }

        // Test if image loads
        this.testImageLoad(imageData.url)
            .then(() => {
                this.heroImages.push(imageData);
                this.saveHeroImages();
                this.renderHeroImages();
                form.reset();
                this.showToast(`Image "${imageData.title}" added successfully!`, 'success');
                
                // Notify main site about new image
                this.notifyMainSite();
            })
            .catch(() => {
                this.showToast('Failed to load image. Please check the URL.', 'error');
            });
    }

    removeHeroImage(imageId) {
        const image = this.heroImages.find(img => img.id === imageId);
        if (!image) return;

        if (confirm(`Are you sure you want to remove "${image.title}"?`)) {
            this.heroImages = this.heroImages.filter(img => img.id !== imageId);
            this.saveHeroImages();
            this.renderHeroImages();
            this.showToast(`Image "${image.title}" removed successfully!`, 'success');
            
            // Notify main site about image removal
            this.notifyMainSite();
        }
    }    renderHeroImages() {
        const imagesGrid = document.getElementById('images-grid');
        if (!imagesGrid) return;

        // Pre-loaded default images
        const defaultImages = [
            { title: 'Default Cricket Background', url: 'images/hero-bg-1.jpg' },
            { title: 'Cricket Stadium', url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
            { title: 'Cricket Ball & Bat', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
            { title: 'Cricket Action', url: 'https://images.unsplash.com/photo-1574771875745-9dcf7b2c7b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
            { title: 'Cricket Equipment', url: 'https://images.unsplash.com/photo-1578928474139-8d4dc2c3bd42?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' }
        ];

        const defaultImagesHtml = defaultImages.map((image, index) => `
            <div class="image-card">
                <div class="image-preview ${index === 0 ? 'default' : ''}" style="${index === 0 ? '' : `background-image: url('${image.url}')`}">
                    ${index === 0 ? '<i class="fas fa-cricket-bat-ball"></i>' : ''}
                    <div class="default-badge">Default</div>
                    <div class="image-overlay">
                        <button class="image-action-btn" onclick="admin.showImagePreview('${image.url}')" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="image-info">
                    <div class="image-title">${this.escapeHtml(image.title)}</div>
                    <div class="image-url">${index === 0 ? 'Built-in image' : 'Unsplash'}</div>
                </div>
            </div>
        `).join('');

        // Custom images
        const customImagesHtml = this.heroImages.map(image => `
            <div class="image-card">
                <div class="image-preview" style="background-image: url('${image.url}')">
                    <div class="image-overlay">
                        <button class="image-action-btn" onclick="admin.previewImageById('${image.id}')" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="image-action-btn delete" onclick="admin.removeHeroImage('${image.id}')" title="Remove">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="image-info">
                    <div class="image-title">${this.escapeHtml(image.title)}</div>
                    <div class="image-url">${this.escapeHtml(image.url)}</div>
                </div>
            </div>
        `).join('');

        imagesGrid.innerHTML = defaultImagesHtml + customImagesHtml;
    }

    previewImage() {
        const imageUrl = document.getElementById('image-url').value.trim();
        if (!imageUrl) {
            this.showToast('Please enter an image URL first', 'warning');
            return;
        }

        if (!this.isValidImageUrl(imageUrl)) {
            this.showToast('Please enter a valid image URL', 'error');
            return;
        }

        this.showImagePreview(imageUrl);
    }

    previewImageById(imageId) {
        const image = this.heroImages.find(img => img.id === imageId);
        if (image) {
            this.showImagePreview(image.url);
        }
    }

    showImagePreview(imageUrl) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('image-preview-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'image-preview-modal';
            modal.className = 'image-preview-modal';
            modal.innerHTML = `
                <div class="preview-content">
                    <button class="preview-close" onclick="admin.closeImagePreview()">
                        <i class="fas fa-times"></i>
                    </button>
                    <img class="preview-image" alt="Preview">
                </div>
            `;
            document.body.appendChild(modal);
        }

        const previewImg = modal.querySelector('.preview-image');
        previewImg.src = imageUrl;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeImagePreview() {
        const modal = document.getElementById('image-preview-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    isValidImageUrl(url) {
        try {
            const urlObj = new URL(url);
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
            const pathname = urlObj.pathname.toLowerCase();
            return validExtensions.some(ext => pathname.endsWith(ext)) || 
                   url.includes('image') || 
                   url.includes('photo') ||
                   pathname.includes('/image/');
        } catch {
            return false;
        }
    }

    testImageLoad(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });
    }

    saveHeroImages() {
        localStorage.setItem('heroImages', JSON.stringify(this.heroImages));
    }

    notifyMainSite() {
        // Trigger storage event to notify main site of hero image changes
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'heroImages',
            newValue: JSON.stringify(this.heroImages)
        }));
    }

    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.sidebar-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.sidebar-btn').dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Add channel form
        const addChannelForm = document.getElementById('add-channel-form');
        if (addChannelForm) {
            addChannelForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addChannel();
            });
        }

        // Edit channel form
        const editChannelForm = document.getElementById('edit-channel-form');
        if (editChannelForm) {
            editChannelForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateChannel();
            });
        }

        // Add image form
        const addImageForm = document.getElementById('add-image-form');
        if (addImageForm) {
            addImageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addHeroImage();
            });
        }

        // Preview image button
        const previewImageBtn = document.getElementById('preview-image');
        if (previewImageBtn) {
            previewImageBtn.addEventListener('click', () => {
                this.previewImage();
            });
        }

        // Search in manage channels
        const manageSearch = document.getElementById('manage-search');
        if (manageSearch) {
            manageSearch.addEventListener('input', (e) => {
                this.filterChannelsTable(e.target.value.toLowerCase());
            });
        }

        // Clear all channels
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllChannels();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Settings
        this.setupSettingsListeners();

        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'cricketChannels') {
                this.loadChannels();
                this.updateDashboard();
                this.renderChannelsTable();
            }
        });
    }

    setupSettingsListeners() {
        // Export data
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Import data
        const importBtn = document.getElementById('import-data');
        const importFile = document.getElementById('import-file');
        
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });

            importFile.addEventListener('change', (e) => {
                this.importData(e.target.files[0]);
            });
        }

        // Reset data
        const resetBtn = document.getElementById('reset-data');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetData();
            });
        }
    }

    setupTheme() {
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

    switchTab(tabName) {
        // Remove active class from all tabs and buttons
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to selected tab and button
        const selectedTab = document.getElementById(tabName);
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedBtn) selectedBtn.classList.add('active');

        this.currentTab = tabName;

        // Update content based on selected tab
        if (tabName === 'dashboard') {
            this.updateDashboard();
        } else if (tabName === 'manage-channels') {
            this.renderChannelsTable();
        } else if (tabName === 'hero-images') {
            this.renderHeroImages();
        }
    }

    updateDashboard() {
        // Update total channels stat
        const totalChannelsStat = document.getElementById('total-channels-stat');
        if (totalChannelsStat) {
            totalChannelsStat.textContent = this.channels.length;
        }

        // Update last updated
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            const lastChannel = this.channels.sort((a, b) => 
                new Date(b.dateAdded) - new Date(a.dateAdded)
            )[0];
            
            if (lastChannel) {
                const date = new Date(lastChannel.dateAdded);
                lastUpdated.textContent = date.toLocaleDateString();
            }
        }

        // Update activity list
        this.updateActivityList();
    }

    updateActivityList() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        const recentChannels = this.channels
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, 5);

        if (recentChannels.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <span>No channels added yet</span>
                    <small>Add your first channel to get started</small>
                </div>
            `;
            return;
        }

        activityList.innerHTML = recentChannels.map(channel => `
            <div class="activity-item">
                <i class="fas fa-plus-circle"></i>
                <span>Added "${this.escapeHtml(channel.channelName)}"</span>
                <small>${this.formatDate(channel.dateAdded)}</small>
            </div>
        `).join('');
    }

    addChannel() {
        const form = document.getElementById('add-channel-form');
        const formData = new FormData(form);
        
        const channelData = {
            matchTitle: formData.get('matchTitle').trim(),
            channelName: formData.get('channelName').trim(),
            embedCode: formData.get('embedCode').trim(),
            category: formData.get('category') || 'Sports',
            description: formData.get('description').trim() || ''
        };

        // Validate required fields
        if (!channelData.matchTitle || !channelData.channelName || !channelData.embedCode) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Validate iframe code
        if (!this.validateIframeCode(channelData.embedCode)) {
            this.showToast('Please enter a valid iframe embed code', 'error');
            return;
        }

        // Generate unique ID
        const newChannel = {
            id: this.generateId(),
            ...channelData,
            dateAdded: new Date().toISOString()
        };

        // Add to channels array
        this.channels.push(newChannel);
        this.saveChannels();

        // Reset form
        form.reset();

        // Update UI
        this.updateDashboard();
        this.renderChannelsTable();

        // Show success message
        this.showToast(`Channel "${channelData.channelName}" added successfully!`, 'success');

        // Add to activity log
        this.addActivity(`Added channel "${channelData.channelName}"`);
    }

    editChannel(channelId) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        this.editingChannelId = channelId;

        // Populate edit form
        document.getElementById('edit-channel-id').value = channelId;
        document.getElementById('edit-match-title').value = channel.matchTitle;
        document.getElementById('edit-channel-name').value = channel.channelName;
        document.getElementById('edit-embed-code').value = channel.embedCode;
        document.getElementById('edit-category').value = channel.category;
        document.getElementById('edit-description').value = channel.description || '';

        // Show edit modal
        this.showEditModal();
    }

    updateChannel() {
        if (!this.editingChannelId) return;

        const form = document.getElementById('edit-channel-form');
        const formData = new FormData(form);
        
        const channelData = {
            matchTitle: formData.get('matchTitle').trim(),
            channelName: formData.get('channelName').trim(),
            embedCode: formData.get('embedCode').trim(),
            category: formData.get('category') || 'Sports',
            description: formData.get('description').trim() || ''
        };

        // Validate required fields
        if (!channelData.matchTitle || !channelData.channelName || !channelData.embedCode) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Validate iframe code
        if (!this.validateIframeCode(channelData.embedCode)) {
            this.showToast('Please enter a valid iframe embed code', 'error');
            return;
        }

        // Update channel
        const channelIndex = this.channels.findIndex(c => c.id === this.editingChannelId);
        if (channelIndex !== -1) {
            this.channels[channelIndex] = {
                ...this.channels[channelIndex],
                ...channelData
            };
            
            this.saveChannels();
            this.renderChannelsTable();
            this.updateDashboard();
            this.closeEditModal();
            
            this.showToast(`Channel "${channelData.channelName}" updated successfully!`, 'success');
            this.addActivity(`Updated channel "${channelData.channelName}"`);
        }
    }

    deleteChannel(channelId) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        if (confirm(`Are you sure you want to delete "${channel.channelName}"?`)) {
            this.channels = this.channels.filter(c => c.id !== channelId);
            this.saveChannels();
            this.renderChannelsTable();
            this.updateDashboard();
            
            this.showToast(`Channel "${channel.channelName}" deleted successfully!`, 'success');
            this.addActivity(`Deleted channel "${channel.channelName}"`);
        }
    }

    clearAllChannels() {
        if (this.channels.length === 0) {
            this.showToast('No channels to clear', 'warning');
            return;
        }

        if (confirm('Are you sure you want to delete ALL channels? This action cannot be undone.')) {
            const count = this.channels.length;
            this.channels = [];
            this.saveChannels();
            this.renderChannelsTable();
            this.updateDashboard();
            
            this.showToast(`${count} channels cleared successfully!`, 'success');
            this.addActivity(`Cleared all channels (${count} total)`);
        }
    }

    renderChannelsTable() {
        const tbody = document.getElementById('channels-tbody');
        const noChannels = document.getElementById('no-channels');
        
        if (!tbody) return;

        if (this.channels.length === 0) {
            tbody.innerHTML = '';
            if (noChannels) noChannels.style.display = 'block';
            return;
        }

        if (noChannels) noChannels.style.display = 'none';

        tbody.innerHTML = this.channels.map(channel => `
            <tr data-channel-id="${channel.id}">
                <td>
                    <strong>${this.escapeHtml(channel.matchTitle)}</strong>
                    ${channel.description ? `<br><small style="color: var(--text-secondary);">${this.escapeHtml(channel.description)}</small>` : ''}
                </td>
                <td>${this.escapeHtml(channel.channelName)}</td>
                <td>
                    <span class="category-tag">${channel.category}</span>
                </td>
                <td>${this.formatDate(channel.dateAdded)}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn edit-btn" onclick="admin.editChannel('${channel.id}')" title="Edit Channel">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="admin.deleteChannel('${channel.id}')" title="Delete Channel">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterChannelsTable(searchTerm) {
        const rows = document.querySelectorAll('#channels-tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matches = text.includes(searchTerm);
            row.style.display = matches ? '' : 'none';
        });
    }

    showEditModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeEditModal() {
        const modal = document.getElementById('edit-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        this.editingChannelId = null;
    }

    validateIframeCode(code) {
        // Basic validation for iframe code
        return code.includes('<iframe') && code.includes('</iframe>') && code.includes('src=');
    }

    exportData() {
        if (this.channels.length === 0) {
            this.showToast('No channels to export', 'warning');
            return;
        }

        const data = {
            channels: this.channels,
            heroImages: this.heroImages,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cricket-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully!', 'success');
        this.addActivity('Exported data');
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.channels && Array.isArray(data.channels)) {
                    const importCount = data.channels.length;
                    const imageCount = (data.heroImages && Array.isArray(data.heroImages)) ? data.heroImages.length : 0;
                    
                    if (confirm(`Import ${importCount} channels and ${imageCount} images? This will replace all existing data.`)) {
                        this.channels = data.channels.map(channel => ({
                            ...channel,
                            id: channel.id || this.generateId(),
                            dateAdded: channel.dateAdded || new Date().toISOString()
                        }));
                        
                        if (data.heroImages) {
                            this.heroImages = data.heroImages.map(image => ({
                                ...image,
                                id: image.id || this.generateId(),
                                dateAdded: image.dateAdded || new Date().toISOString()
                            }));
                        }
                        
                        this.saveChannels();
                        this.saveHeroImages();
                        this.updateDashboard();
                        this.renderChannelsTable();
                        this.renderHeroImages();
                        this.notifyMainSite();
                        
                        this.showToast(`${importCount} channels and ${imageCount} images imported successfully!`, 'success');
                        this.addActivity(`Imported ${importCount} channels and ${imageCount} images`);
                    }
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showToast('Error importing file. Please check the file format.', 'error');
            }

            // Clear file input
            document.getElementById('import-file').value = '';
        };
        
        reader.readAsText(file);
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This will delete all channels and images and cannot be undone.')) {
            this.channels = [];
            this.heroImages = [];
            this.saveChannels();
            this.saveHeroImages();
            this.updateDashboard();
            this.renderChannelsTable();
            this.renderHeroImages();
            this.notifyMainSite();
            
            // Clear activity log
            localStorage.removeItem('cricketActivity');
            
            this.showToast('All data has been reset!', 'success');
        }
    }

    saveChannels() {
        localStorage.setItem('cricketChannels', JSON.stringify(this.channels));
        
        // Trigger storage event for main site
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'cricketChannels',
            newValue: JSON.stringify(this.channels)
        }));
    }

    addActivity(message) {
        const activities = JSON.parse(localStorage.getItem('cricketActivity') || '[]');
        activities.unshift({
            message,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 activities
        activities.splice(50);
        
        localStorage.setItem('cricketActivity', JSON.stringify(activities));
    }

    generateId() {
        return 'channel-' + Math.random().toString(36).substr(2, 9);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
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
}

// Global functions for inline event handlers
function closeEditModal() {
    if (window.admin) {
        window.admin.closeEditModal();
    }
}

function switchTab(tabName) {
    if (window.admin) {
        window.admin.switchTab(tabName);
    }
}

// Initialize admin when DOM is loaded
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new CricketAdmin();
    window.admin = admin; // Make it globally accessible
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
        if (admin) {
            admin.closeEditModal();
            admin.closeImagePreview();
        }
    }
    
    // Ctrl/Cmd + S to save (prevent default save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
    }
});

// Handle clicks outside modal to close
document.addEventListener('click', (e) => {
    const editModal = document.getElementById('edit-modal');
    const previewModal = document.getElementById('image-preview-modal');
    
    if (editModal && e.target === editModal) {
        admin.closeEditModal();
    }
    
    if (previewModal && e.target === previewModal) {
        admin.closeImagePreview();
    }
});
