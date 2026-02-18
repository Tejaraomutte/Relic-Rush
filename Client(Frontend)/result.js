// ===============================
// RESULT PAGE LOGIC
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuthentication()) {
        return;
    }

    // Initialize result page
    initializeResultPage();
});

/**
 * Initialize result page
 */
function initializeResultPage() {
    displayScores();
    loadLeaderboard();
    setupEventListeners();
    submitFinalScore();
}

/**
 * Display scores from localStorage
 */
function displayScores() {
    const round1Score = parseInt(localStorage.getItem('round1Score')) || 0;
    const round2Score = parseInt(localStorage.getItem('round2Score')) || 0;
    const round3Score = parseInt(localStorage.getItem('round3Score')) || 0;
    
    const totalScore = round1Score + round2Score + round3Score;
    
    // Update score displays
    document.getElementById('round1Score').textContent = round1Score;
    document.getElementById('round2Score').textContent = round2Score;
    document.getElementById('round3Score').textContent = round3Score;
    document.getElementById('totalScore').textContent = totalScore;

    // Animate score values
    animateScores();
}

/**
 * Animate score values
 */
function animateScores() {
    const scoreValues = document.querySelectorAll('.score-value');
    scoreValues.forEach((value, index) => {
        value.style.animation = `resultAppear 0.6s ease-out ${(index + 1) * 0.2}s both`;
    });
}

/**
 * Load and display leaderboard
 */
async function loadLeaderboard() {
    const leaderboardTable = document.getElementById('leaderboardTable');
    
    try {
        const leaderboardData = await getLeaderboard();
        
        if (leaderboardData.length === 0) {
            leaderboardTable.innerHTML = '<p class="loading-text">No scores yet. Be the first to complete!</p>';
            return;
        }

        let leaderboardHTML = '';
        
        leaderboardData.slice(0, 10).forEach((entry, index) => {
            leaderboardHTML += `
                <div class="leaderboard-row" style="animation: resultAppear 0.6s ease-out ${index * 0.1}s both;">
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-name">${entry.name || entry.email}</div>
                    <div class="leaderboard-score">${entry.totalScore || 0}</div>
                </div>
            `;
        });

        leaderboardTable.innerHTML = leaderboardHTML;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardTable.innerHTML = '<p class="loading-text">Failed to load leaderboard</p>';
    }
}

/**
 * Submit final score to backend
 */
async function submitFinalScore() {
    const round1Score = parseInt(localStorage.getItem('round1Score')) || 0;
    const round2Score = parseInt(localStorage.getItem('round2Score')) || 0;
    const round3Score = parseInt(localStorage.getItem('round3Score')) || 0;
    const totalScore = round1Score + round2Score + round3Score;

    const user = JSON.parse(localStorage.getItem('user'));

    try {
        const response = await fetch(`${API_URL}/submit-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email,
                round: 'final',
                score: totalScore,
                round1Score: round1Score,
                round2Score: round2Score,
                round3Score: round3Score
            })
        });

        if (response.ok) {
            console.log('Final score submitted successfully');
        }
    } catch (error) {
        console.error('Error submitting final score:', error);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const homeBtn = document.getElementById('homeBtn');
    const shareBtn = document.getElementById('shareBtn');

    homeBtn.addEventListener('click', goHome);
    shareBtn.addEventListener('click', shareScore);
}

/**
 * Go back to home
 */
function goHome() {
    // Clear localStorage data
    localStorage.removeItem('round1Score');
    localStorage.removeItem('round2Score');
    localStorage.removeItem('round3Score');
    localStorage.removeItem('lampsRemaining');
    
    window.location.href = 'index.html';
}

/**
 * Share score on social media or copy to clipboard
 */
function shareScore() {
    const round1Score = parseInt(localStorage.getItem('round1Score')) || 0;
    const round2Score = parseInt(localStorage.getItem('round2Score')) || 0;
    const round3Score = parseInt(localStorage.getItem('round3Score')) || 0;
    const totalScore = round1Score + round2Score + round3Score;

    const maxScore = 15; // 5 questions per round × 3 rounds
    const percentage = Math.round((totalScore / maxScore) * 100);

    const shareText = `🎉 I found the True Relic in Relic Rush! 🎉
Score: ${totalScore}/${maxScore} (${percentage}%)
Round 1: ${round1Score}/5
Round 2: ${round2Score}/5
Round 3: ${round3Score}/5

Can you beat my score? Join the adventure at Relic Rush!`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
        showShareMessage('Score copied to clipboard! 📋');
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback: show alert
        alert(shareText);
    });
}

/**
 * Show share message
 */
function showShareMessage(message) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'form-message success';
    resultDiv.textContent = message;
    resultDiv.style.position = 'fixed';
    resultDiv.style.top = '50%';
    resultDiv.style.left = '50%';
    resultDiv.style.transform = 'translate(-50%, -50%)';
    resultDiv.style.zIndex = '1000';
    
    document.body.appendChild(resultDiv);
    
    setTimeout(() => {
        resultDiv.remove();
    }, 2000);
}
