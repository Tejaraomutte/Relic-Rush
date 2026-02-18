// ===============================
// ROUND HELPER UTILITIES
// ===============================

const API_URL = 'http://localhost:5000';

/**
 * Check if user is authenticated
 */
function checkAuthentication() {
    const user = localStorage.getItem('user');
    if (!user) {
        // User not logged in, redirect to login
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Format time in MM:SS format
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Start countdown timer
 */
function startCountdownTimer(duration, onTick, onComplete) {
    let timeLeft = duration;
    const timerDisplay = document.getElementById('timeDisplay');

    const updateTimer = () => {
        timerDisplay.textContent = formatTime(timeLeft);

        // Change color based on time remaining
        if (timeLeft <= 10) {
            timerDisplay.classList.add('danger');
            timerDisplay.classList.remove('warning');
        } else if (timeLeft <= 30) {
            timerDisplay.classList.add('warning');
            timerDisplay.classList.remove('danger');
        } else {
            timerDisplay.classList.remove('warning', 'danger');
        }

        if (onTick) {
            onTick(timeLeft);
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (onComplete) {
                onComplete();
            }
        } else {
            timeLeft--;
        }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return timerInterval;
}

/**
 * Update lamps indicator
 */
function updateLampsIndicator(roundNumber) {
    const lampsRemaining = localStorage.getItem('lampsRemaining');
    const lampsIndicator = document.getElementById('lampsRemaining');
    
    if (lampsIndicator) {
        lampsIndicator.textContent = lampsRemaining;
    }

    // Hide corresponding lamp on home page if transitioning
    if (window.location.pathname.includes('round')) {
        const lampIndex = roundNumber - 1;
        // This will be handled by home page logic when visible
    }
}

/**
 * Submit score to backend
 */
async function submitRoundScore(email, roundNumber, score) {
    try {
        const response = await fetch(`${API_URL}/submit-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                round: roundNumber,
                score: score
            })
        });

        if (response.ok) {
            console.log(`Round ${roundNumber} score submitted successfully`);
            return true;
        } else {
            console.error('Failed to submit score');
            return false;
        }
    } catch (error) {
        console.error('Error submitting score:', error);
        return false;
    }
}

/**
 * Get leaderboard data
 */
async function getLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.leaderboard || [];
        } else {
            console.error('Failed to fetch leaderboard');
            return [];
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

/**
 * Format email to name
 */
function emailToName(email) {
    return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
}
