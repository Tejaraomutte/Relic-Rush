// ===============================
// ROUND 2 QUESTIONS
// ===============================

const questions = [
  {
    question: "What does CSS stand for?",
    questionImage: "assets/images/q6.jpg",
    options: [
      { text: "Cascading Style Sheets", image: null },
      { text: "Computer Style Sheets", image: null },
      { text: "Cascading Syntax Sheets", image: null },
      { text: "None of the above", image: null }
    ],
    correct: 0
  },
  {
    question: "Which of these is NOT a JavaScript data type?",
    questionImage: "assets/images/q7.jpg",
    options: [
      { text: "String", image: null },
      { text: "Boolean", image: null },
      { text: "Character", image: null },
      { text: "Number", image: null }
    ],
    correct: 2
  },
  {
    question: "What is the time complexity of binary search?",
    questionImage: "assets/images/q8.jpg",
    options: [
      { text: "O(n)", image: null },
      { text: "O(log n)", image: null },
      { text: "O(n²)", image: null },
      { text: "O(n log n)", image: null }
    ],
    correct: 1
  },
  {
    question: "In what year was Python first released?",
    questionImage: "assets/images/q9.jpg",
    options: [
      { text: "1989", image: null },
      { text: "1995", image: null },
      { text: "2000", image: null },
      { text: "2005", image: null }
    ],
    correct: 0
  },
  {
    question: "What does REST stand for?",
    questionImage: "assets/images/q10.jpg",
    options: [
      { text: "Representational State Transfer", image: null },
      { text: "Remote Enhanced Service Transfer", image: null },
      { text: "Request Enhanced Store Transfer", image: null },
      { text: "Response Encoding Service Transfer", image: null }
    ],
    correct: 0
  }
];

// ===============================
// ROUND 2 LOGIC
// ===============================

const ROUND_NUMBER = 2;
const ROUND_DURATION = 300; // 5 minutes in seconds
let currentQuestionIndex = 0;
let selectedAnswers = new Array(questions.length).fill(null);
let timeLeft = ROUND_DURATION;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuthentication()) {
        return;
    }

    // Initialize round
    initializeRound();
});

/**
 * Initialize round
 */
function initializeRound() {
    updateLampsIndicator(ROUND_NUMBER);
    loadQuestion(currentQuestionIndex);
    startCountdownTimer(ROUND_DURATION, onTimerTick, onTimeUp);
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const submitBtn = document.getElementById('submitBtn');
    const backBtn = document.getElementById('backBtn');

    submitBtn.addEventListener('click', submitCurrentQuestion);
    backBtn.addEventListener('click', goBack);
}

/**
 * Load a question
 */
function loadQuestion(index) {
    if (index < 0 || index >= questions.length) {
        return;
    }

    currentQuestionIndex = index;
    const question = questions[index];

    // Update question text
    const questionText = document.getElementById('questionText');
    questionText.textContent = `Q${index + 1}. ${question.question}`;

    // Update question image
    const questionImage = document.getElementById('questionImage');
    if (question.questionImage) {
        questionImage.src = question.questionImage;
        questionImage.style.display = 'block';
    } else {
        questionImage.style.display = 'none';
    }

    // Render options
    renderOptions(question, index);
}

/**
 * Render options for current question
 */
function renderOptions(question, questionIndex) {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';

    question.options.forEach((option, optionIndex) => {
        const card = document.createElement('div');
        card.className = 'option-card';
        
        if (selectedAnswers[questionIndex] === optionIndex) {
            card.classList.add('selected');
        }

        let content = '';
        if (option.text) {
            content = `<p>${option.text}</p>`;
        }
        if (option.image) {
            content += `<img src="${option.image}" alt="Option ${optionIndex + 1}">`;
        }

        card.innerHTML = content;
        card.addEventListener('click', () => selectOption(questionIndex, optionIndex, card));
        optionsGrid.appendChild(card);
    });
}

/**
 * Select an option
 */
function selectOption(questionIndex, optionIndex, element) {
    // Remove selected class from all cards
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selected class to clicked card
    element.classList.add('selected');

    // Store answer
    selectedAnswers[questionIndex] = optionIndex;
}

/**
 * Submit current question
 */
function submitCurrentQuestion() {
    // Check if answer is selected
    if (selectedAnswers[currentQuestionIndex] === null) {
        showResultMessage('Please select an answer before submitting', 'error');
        return;
    }

    // Check if this is the last question
    if (currentQuestionIndex === questions.length - 1) {
        // All questions answered, calculate score
        calculateAndSubmitRound();
    } else {
        // Move to next question
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }
}

/**
 * Calculate round score and submit
 */
function calculateAndSubmitRound() {
    clearInterval(timerInterval);

    let score = 0;
    selectedAnswers.forEach((answer, index) => {
        if (answer === questions[index].correct) {
            score++;
        }
    });

    // Store score in localStorage
    localStorage.setItem('round2Score', score.toString());

    // Update lamps remaining
    const lampsRemaining = parseInt(localStorage.getItem('lampsRemaining')) || 3;
    const newLampsRemaining = Math.max(lampsRemaining - 1, 1);
    localStorage.setItem('lampsRemaining', newLampsRemaining.toString());

    // Submit score to backend
    const user = JSON.parse(localStorage.getItem('user'));
    submitRoundScore(user.email, ROUND_NUMBER, score).then(() => {
        showRoundComplete(score);
    });
}

/**
 * Show round complete message
 */
function showRoundComplete(score) {
    const resultDiv = document.getElementById('resultDiv');
    resultDiv.innerHTML = `
        <div style="animation: resultAppear 0.6s ease-out;">
            <h2>🎉 Round 2 Completed!</h2>
            <p>Your Score: <strong>${score} / ${questions.length}</strong></p>
            <p>Proceeding to Round 3...</p>
        </div>
    `;
    resultDiv.style.display = 'block';

    // Redirect to next round after delay
    setTimeout(() => {
        window.location.href = 'round3.html';
    }, 2000);
}

/**
 * Show result message
 */
function showResultMessage(message, type) {
    const resultDiv = document.getElementById('resultDiv');
    resultDiv.textContent = message;
    resultDiv.className = `result-message ${type}`;
    resultDiv.style.display = 'block';

    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 3000);
}

/**
 * Timer tick callback
 */
function onTimerTick(timeRemaining) {
    // Could be used for additional UI updates
}

/**
 * Time up callback
 */
function onTimeUp() {
    showResultMessage('⏱️ Time is up! Submitting your answers...', 'info');
    setTimeout(() => {
        calculateAndSubmitRound();
    }, 1000);
}

/**
 * Go back function
 */
function goBack() {
    if (window.confirm('Are you sure you want to go back? Your progress will be lost.')) {
        window.location.href = 'index.html';
    }
}
