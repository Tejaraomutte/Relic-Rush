// ===============================
// LOGIN PAGE LOGIC
// ===============================

const API_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const formMessage = document.getElementById('formMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Reset message
        formMessage.textContent = '';
        formMessage.classList.remove('error', 'success');

        // Validation
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        // Show loading spinner
        loadingSpinner.style.display = 'flex';

        try {
            // Call login API
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful
                showMessage('Login successful! Redirecting...', 'success');
                
                // Store user info in localStorage
                localStorage.setItem('user', JSON.stringify({
                    email: email,
                    name: data.name || email.split('@')[0],
                    id: data.id || email
                }));

                // Initialize scores and lamps
                localStorage.setItem('round1Score', '0');
                localStorage.setItem('round2Score', '0');
                localStorage.setItem('round3Score', '0');
                localStorage.setItem('lampsRemaining', '4');

                // Redirect to round 1 after short delay
                setTimeout(() => {
                    window.location.href = 'round1.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please check your connection.', 'error');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });
});

/**
 * Show form message
 */
function showMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
