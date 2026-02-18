// ===============================
// HOME PAGE LOGIC
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enterBtn');
    
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    
    enterBtn.addEventListener('click', () => {
        if (user) {
            // User already logged in, go to round 1
            window.location.href = 'round1.html';
        } else {
            // User not logged in, go to login page
            window.location.href = 'login.html';
        }
    });

    // Initialize lamps on page load
    initializeLamps();
});

/**
 * Initialize lamps with glow effect
 */
function initializeLamps() {
    const lamps = document.querySelectorAll('.genie-lamp');
    lamps.forEach((lamp, index) => {
        // Stagger animation for each lamp
        lamp.style.animationDelay = `${index * 0.15}s`;
    });
}

/**
 * Remove lamp with fade-out animation
 * Used when a round is completed
 */
function removeLamp(lampIndex) {
    const lampWrappers = document.querySelectorAll('.lamp-wrapper');
    if (lampWrappers[lampIndex]) {
        lampWrappers[lampIndex].classList.add('disappear');
        setTimeout(() => {
            lampWrappers[lampIndex].style.display = 'none';
        }, 1000);
    }
}
