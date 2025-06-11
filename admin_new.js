// Admin Panel JavaScript for SaveItBro Cricket
class CricketAdmin {
    constructor() {
        this.channels = [];
        this.currentTab = 'dashboard';
        this.editingChannelId = null;
        this.isDarkMode = false;
        
        this.init();
    }

    init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            window.location.href = 'login.html';
            return;
        }
        
        this.loadChannels();
        this.setupEventListeners();
        this.setupTheme();
        this.updateDashboard();
        this.renderChannelsTable();
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
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cricket-channels-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Channels exported successfully!', 'success');
        this.addActivity('Exported channel data');
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.channels && Array.isArray(data.channels)) {
                    const importCount = data.channels.length;
                    
                    if (confirm(`Import ${importCount} channels? This will replace all existing channels.`)) {
                        this.channels = data.channels.map(channel => ({
                            ...channel,
                            id: channel.id || this.generateId(),
                            dateAdded: channel.dateAdded || new Date().toISOString()
                        }));
                        
                        this.saveChannels();
                        this.updateDashboard();
                        this.renderChannelsTable();
                        
                        this.showToast(`${importCount} channels imported successfully!`, 'success');
                        this.addActivity(`Imported ${importCount} channels`);
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
        if (confirm('Are you sure you want to reset all data? This will delete all channels and cannot be undone.')) {
            this.channels = [];
            this.saveChannels();
            this.updateDashboard();
            this.renderChannelsTable();
            
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
        }
    }
    
    // Ctrl/Cmd + S to save (prevent default save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Could trigger form submission if in a form
    }
});

// Handle clicks outside modal to close
document.addEventListener('click', (e) => {
    const modal = document.getElementById('edit-modal');
    if (modal && e.target === modal) {
        admin.closeEditModal();
    }
});
