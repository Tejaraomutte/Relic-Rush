const API_URL = '/api';

export async function loginUser(teamName, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                teamName,
                password
            })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Invalid credentials');
        }

        return await response.json();
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
}

export async function submitRoundScore(teamName, roundNumber, score, questionsSolved, questionTimes, totalRoundTime) {
    try {
        const payload = {
            teamName: teamName,
            round: roundNumber,
            score: score
        };

        if (Number.isFinite(questionsSolved)) {
            payload.questionsSolved = questionsSolved;
        }

        if (Array.isArray(questionTimes) && questionTimes.length > 0) {
            payload.questionTimes = questionTimes;
        }

        if (Number.isFinite(totalRoundTime)) {
            payload.totalRoundTime = totalRoundTime;
        }

        const response = await fetch(`${API_URL}/submit-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // Throw on non-2xx responses so callers can handle it explicitly
        if (!response.ok) {
            const text = await response.text().catch(() => response.statusText || 'Unknown error');
            const err = new Error(`Server responded with ${response.status}: ${text}`);
            err.status = response.status;
            throw err;
        }

        return await response.json();
    } catch (error) {
        // Normalize network errors to include more context
        console.error('Error submitting score:', error);
        throw new Error(error.message || 'Network error while submitting score');
    }
}

export async function getLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        return data.leaderboard || [];
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

export async function getAdminLeaderboard(token) {
    try {
        const response = await fetch(`${API_URL}/admin/leaderboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const text = await response.text().catch(() => response.statusText);
            throw new Error(`${response.status}: ${text}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching admin leaderboard:', error);
        throw error;
    }
}

export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
