// Utility functions
class Utils {
    static showNotification(message, type = 'success', duration = 5000) {
        const notification = document.getElementById('notification');
        const messageEl = notification.querySelector('.notification-message');
        
        notification.className = 'auth-notification';
        notification.classList.add(type);
        messageEl.textContent = message;
        notification.classList.add('active');
        
        setTimeout(() => {
            notification.classList.remove('active');
        }, duration);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('active');
        });
    }
    
    static getAuthToken() {
        return localStorage.getItem('jwtToken');
    }
    
    static isAuthenticated() {
        return !!this.getAuthToken();
    }
    
    static redirectIfNotAuthenticated() {
        if (!this.isAuthenticated() && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
    }
    
    static logout() {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
    
    static async fetchWithAuth(url, options = {}) {
        const token = this.getAuthToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Une erreur est survenue');
            }
            
            return await response.json();
        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        }
    }
    
    static toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    static initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    static initSidebarToggle() {
        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    }
    
    static formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    Utils.initTheme();
    Utils.initSidebarToggle();
    
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', Utils.toggleTheme);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', Utils.logout);
    }
});