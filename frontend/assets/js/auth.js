document.addEventListener('DOMContentLoaded', () => {
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            const password = this.value;
            let strength = 0;
            
            // Check for length
            if (password.length >= 8) strength += 1;
            if (password.length >= 12) strength += 1;
            
            // Check for character variety
            if (/[A-Z]/.test(password)) strength += 1;
            if (/[0-9]/.test(password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(password)) strength += 1;
            
            // Update UI
            const width = Math.min(100, strength * 25);
            strengthBar.style.width = `${width}%`;
            
            // Change color and text
            if (strength <= 2) {
                strengthBar.style.backgroundColor = 'var(--danger-color)';
                strengthText.textContent = 'Faible';
            } else if (strength <= 4) {
                strengthBar.style.backgroundColor = 'var(--warning-color)';
                strengthText.textContent = 'Moyen';
            } else {
                strengthBar.style.backgroundColor = 'var(--success-color)';
                strengthText.textContent = 'Fort';
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.name.value,
                email: this.email.value,
                password: this.password.value,
                role: this.role.value
            };
            
            try {
                const response = await Utils.fetchWithAuth('/api/users/register', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                
                Utils.showNotification('Inscription réussie! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                console.error('Registration error:', error);
            }
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                email: this.email.value,
                password: this.password.value
            };
            
            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Échec de la connexion');
                }
                
                const data = await response.json();
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                Utils.showNotification('Connexion réussie! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } catch (error) {
                Utils.showNotification(error.message, 'error');
                console.error('Login error:', error);
            }
        });
    }
    
    // Redirect if already logged in
    if (Utils.isAuthenticated() && (window.location.pathname.includes('login.html') || window.location.pathname.includes('index.html'))) {
        window.location.href = 'dashboard.html';
    }
});