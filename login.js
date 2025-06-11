// Login System for SaveItBro Cricket Admin
class AdminLogin {    constructor() {
        this.isDarkMode = false;
        this.credentials = {
            username: 'admin',
            password: 'Jamali4u'
        };
        this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        this.rememberDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.checkExistingSession();
        this.createParticles();
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Password toggle
        const passwordToggle = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('password');
        
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                const icon = passwordToggle.querySelector('i');
                icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Enter key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            }
        });

        // Input focus effects
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', (e) => {
                if (!e.target.value) {
                    e.target.parentElement.classList.remove('focused');
                }
            });
        });
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

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Show loading state
        this.setLoadingState(true);

        // Simulate network delay for better UX
        setTimeout(() => {
            if (this.validateCredentials(username, password)) {
                this.createSession(rememberMe);
                this.showToast('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                this.showToast('Invalid username or password', 'error');
                this.shakeForm();
            }
            
            this.setLoadingState(false);
        }, 1000);
    }

    validateCredentials(username, password) {
        return username === this.credentials.username && password === this.credentials.password;
    }

    createSession(rememberMe) {
        const sessionData = {
            isAuthenticated: true,
            loginTime: Date.now(),
            expiresAt: Date.now() + (rememberMe ? this.rememberDuration : this.sessionDuration),
            rememberMe: rememberMe
        };

        localStorage.setItem('adminSession', JSON.stringify(sessionData));
    }

    checkExistingSession() {
        const sessionData = localStorage.getItem('adminSession');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                
                if (session.isAuthenticated && Date.now() < session.expiresAt) {
                    // Valid session exists, redirect to admin
                    window.location.href = 'admin.html';
                } else {
                    // Session expired, clean up
                    localStorage.removeItem('adminSession');
                }
            } catch (error) {
                // Invalid session data, clean up
                localStorage.removeItem('adminSession');
            }
        }
    }

    setLoadingState(loading) {
        const loginBtn = document.querySelector('.login-btn');
        const btnText = loginBtn?.querySelector('.btn-text');
        const btnIcon = loginBtn?.querySelector('.btn-icon');
        
        if (loginBtn) {
            loginBtn.disabled = loading;
            
            if (loading) {
                loginBtn.classList.add('loading');
                if (btnText) btnText.textContent = 'Signing in...';
                if (btnIcon) btnIcon.className = 'fas fa-spinner fa-spin btn-icon';
            } else {
                loginBtn.classList.remove('loading');
                if (btnText) btnText.textContent = 'Login';
                if (btnIcon) btnIcon.className = 'fas fa-arrow-right btn-icon';
            }
        }
    }

    shakeForm() {
        const loginCard = document.querySelector('.login-card');
        if (loginCard) {
            loginCard.classList.add('shake');
            setTimeout(() => {
                loginCard.classList.remove('shake');
            }, 500);
        }
    }

    createParticles() {
        const particlesContainer = document.querySelector('.cricket-particles');
        if (!particlesContainer) return;

        // Add more particles dynamically
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
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

// Initialize login system
let adminLogin;
document.addEventListener('DOMContentLoaded', () => {
    adminLogin = new AdminLogin();
});
