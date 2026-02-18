// ==========================================
// GLOBAL STATE
// ==========================================

const state = {
    questions: [],
    answers: {}, // { questionId: selectedAnswerIndex }
    currentQuestionIndex: 0,
    roundNumber: 1,
    startTime: null,
    isSubmitted: false
};

const apiBaseUrl = 'http://localhost:5000/api'; // Update if backend is on different URL

// DOM Elements
const loadingState = document.getElementById('loadingState');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');
const errorState = document.getElementById('errorState');
const questionsGrid = document.getElementById('questionsGrid');
const roundBadge = document.getElementById('roundBadge');
const timerDisplay = document.getElementById('timer');
const currentQuestionDisplay = document.getElementById('currentQuestion');
const totalQuestionsDisplay = document.getElementById('totalQuestions');
const progressFill = document.getElementById('progressFill');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    state.roundNumber = parseInt(urlParams.get('round')) || 1;
    roundBadge.textContent = `Round ${state.roundNumber}`;
    
    initializeQuiz();
    startTimer();
});

// ==========================================
// FETCH QUESTIONS
// ==========================================

async function initializeQuiz() {
    try {
        showLoading();
        const response = await fetch(`${apiBaseUrl}/questions/round/${state.roundNumber}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        state.questions = await response.json();
        
        if (!state.questions || state.questions.length === 0) {
            throw new Error('No questions found for this round');
        }
        
        // Initialize answers object
        state.questions.forEach(q => {
            if (q._id) {
                state.answers[q._id] = null;
            }
        });
        
        totalQuestionsDisplay.textContent = state.questions.length;
        renderQuiz();
        showQuiz();
        
    } catch (error) {
        console.error('Error loading questions:', error);
        showError(`Failed to load questions: ${error.message}`);
    }
}

// ==========================================
// RENDER QUIZ
// ==========================================

function renderQuiz() {
    questionsGrid.innerHTML = '';
    
    state.questions.forEach((question, index) => {
        const questionCard = createQuestionCard(question, index);
        questionsGrid.appendChild(questionCard);
    });
    
    updateNavigation();
}

function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `question-${index}`;
    
    let optionsHTML = '';
    question.options.forEach((option, optionIndex) => {
        const optionId = `q${index}o${optionIndex}`;
        const isChecked = state.answers[question._id] === optionIndex ? 'checked' : '';
        const selectedClass = state.answers[question._id] === optionIndex ? 'selected' : '';
        
        let optionContent = '';
        if (option.text) {
            optionContent += `<span class="option-text">${escapeHtml(option.text)}</span>`;
        }
        if (option.imageUrl) {
            optionContent += `<img src="${option.imageUrl}" alt="Option ${optionIndex + 1}" class="option-image" onerror="handleImageError(this)">`;
        }
        
        optionsHTML += `
            <label class="option ${selectedClass}">
                <input 
                    type="radio" 
                    name="question-${index}" 
                    value="${optionIndex}" 
                    id="${optionId}"
                    ${isChecked}
                    onchange="selectAnswer('${question._id}', ${optionIndex})"
                >
                <div class="option-content">
                    ${optionContent}
                </div>
            </label>
        `;
    });
    
    card.innerHTML = `
        <div class="question-number">${index + 1}</div>
        <h3 class="question-text">${escapeHtml(question.questionText)}</h3>
        ${question.imageUrl ? `<img src="${question.imageUrl}" alt="Question ${index + 1}" class="question-image" onerror="handleImageError(this)">` : ''}
        <div class="options-container">
            ${optionsHTML}
        </div>
    `;
    
    return card;
}

// ==========================================
// ANSWER SELECTION
// ==========================================

function selectAnswer(questionId, answerIndex) {
    state.answers[questionId] = answerIndex;
    
    // Update UI
    const question = state.questions.find(q => q._id === questionId);
    const optionLabels = document.querySelectorAll(`[name="question-${state.questions.indexOf(question)}"]`);
    optionLabels.forEach((option, index) => {
        const label = option.parentElement;
        if (index === answerIndex) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    });
    
    updateNavigation();
}

// ==========================================
// NAVIGATION
// ==========================================

function updateNavigation() {
    const allAnswered = Object.values(state.answers).every(ans => ans !== null);
    
    // Update progress
    const progress = (Object.values(state.answers).filter(ans => ans !== null).length / state.questions.length) * 100;
    progressFill.style.width = progress + '%';
    
    // Update button states
    prevBtn.disabled = state.currentQuestionIndex === 0;
    nextBtn.disabled = state.currentQuestionIndex === state.questions.length - 1;
    submitBtn.disabled = !allAnswered;
    submitBtn.textContent = allAnswered ? 'Submit Quiz' : 'Answer All Questions';
}

function nextQuestion() {
    if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex++;
        currentQuestionDisplay.textContent = state.currentQuestionIndex + 1;
        scrollToCurrentQuestion();
        updateNavigation();
    }
}

function previousQuestion() {
    if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
        currentQuestionDisplay.textContent = state.currentQuestionIndex + 1;
        scrollToCurrentQuestion();
        updateNavigation();
    }
}

function scrollToCurrentQuestion() {
    const currentCard = document.getElementById(`question-${state.currentQuestionIndex}`);
    if (currentCard) {
        currentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ==========================================
// SUBMIT QUIZ
// ==========================================

async function submitQuiz() {
    try {
        // Prepare answers in the format expected by backend
        const answers = state.questions.map((q, index) => ({
            questionId: q._id,
            selectedAnswer: state.answers[q._id]
        }));
        
        const timeTaken = Math.floor((Date.now() - state.startTime) / 1000);
        
        // Get auth token if it exists
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
        
        const response = await fetch(`${apiBaseUrl}/questions/round/${state.roundNumber}/submit`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                answers: answers,
                timeTaken: timeTaken
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit quiz');
        }
        
        // Display results
        displayResults(data.score, state.questions.length);
        state.isSubmitted = true;
        
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert(`Error submitting quiz: ${error.message}`);
    }
}

// ==========================================
// RESULTS DISPLAY
// ==========================================

function displayResults(score, total) {
    const percentage = Math.round((score / total) * 100);
    const scoreValue = document.getElementById('scoreValue');
    const totalScore = document.getElementById('totalScore');
    const resultPercentage = document.getElementById('resultPercentage');
    const resultMessage = document.getElementById('resultMessage');
    
    scoreValue.textContent = score;
    totalScore.textContent = total;
    resultPercentage.textContent = `${percentage}%`;
    
    // Personalized message based on score
    if (percentage === 100) {
        resultMessage.textContent = 'Perfect Score! 🌟 Outstanding!';
        resultMessage.style.color = 'var(--success-color)';
    } else if (percentage >= 80) {
        resultMessage.textContent = 'Excellent Work! 🎯 Great job!';
        resultMessage.style.color = 'var(--success-color)';
    } else if (percentage >= 60) {
        resultMessage.textContent = 'Good Effort! 👍 Keep practicing!';
        resultMessage.style.color = 'var(--primary-color)';
    } else if (percentage >= 40) {
        resultMessage.textContent = 'Fair Try! 📚 Review and try again!';
        resultMessage.style.color = 'var(--warning-color)';
    } else {
        resultMessage.textContent = 'Keep Learning! 💪 Try again!';
        resultMessage.style.color = 'var(--warning-color)';
    }
    
    showResults();
}

function restartQuiz() {
    // Reset state
    state.answers = {};
    state.currentQuestionIndex = 0;
    state.isSubmitted = false;
    state.startTime = Date.now();
    
    // Reset answers object
    state.questions.forEach(q => {
        if (q._id) {
            state.answers[q._id] = null;
        }
    });
    
    currentQuestionDisplay.textContent = 1;
    renderQuiz();
    showQuiz();
}

// ==========================================
// UI STATE MANAGEMENT
// ==========================================

function showLoading() {
    loadingState.classList.remove('hidden');
    quizContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    errorState.classList.add('hidden');
}

function showQuiz() {
    loadingState.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    errorState.classList.add('hidden');
}

function showResults() {
    loadingState.classList.add('hidden');
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    errorState.classList.add('hidden');
}

function showError(message) {
    loadingState.classList.add('hidden');
    quizContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    errorState.classList.remove('hidden');
    
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
}

// ==========================================
// TIMER
// ==========================================

function startTimer() {
    state.startTime = Date.now();
    
    setInterval(() => {
        if (!state.isSubmitted) {
            const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }, 1000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function handleImageError(img) {
    img.source = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23eee" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
    img.alt = 'Image not available';
}

// Handle token storage from auth system
function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Debug helper - log current state
function debugState() {
    console.log('Current State:', state);
    console.log('Answers:', state.answers);
}
