// ===============================
// ROUND 3 QUESTIONS
// ===============================

const questions = [
  {
    question: "What does HTML stand for?",
    questionImage: "assets/images/q11.jpg",
    options: [
      { text: "HyperText Markup Language", image: null },
      { text: "High Tech Modern Language", image: null },
      { text: "Home Tool Markup Language", image: null },
      { text: "Hyperlinks and Text Markup Language", image: null }
    ],
    correct: 0
  },
  {
    question: "Which sorting algorithm has the best average time complexity?",
    questionImage: "assets/images/q12.jpg",
    options: [
      { text: "Bubble Sort", image: null },
      { text: "Quick Sort", image: null },
      { text: "Insertion Sort", image: null },
      { text: "Selection Sort", image: null }
    ],
    correct: 1
  },
  {
    question: "What does API stand for?",
    questionImage: "assets/images/q13.jpg",
    options: [
      { text: "Application Programming Interface", image: null },
      { text: "Applied Programming Interface", image: null },
      { text: "Application Process Interface", image: null },
      { text: "Advanced Programming Interface", image: null }
    ],
    correct: 0
  },
  {
    question: "Which data structure uses LIFO principle?",
    questionImage: "assets/images/q14.jpg",
    options: [
      { text: "Queue", image: null },
      { text: "Stack", image: null },
      { text: "Tree", image: null },
      { text: "Graph", image: null }
    ],
    correct: 1
  },
  {
    question: "What is the primary purpose of version control?",
    questionImage: "assets/images/q15.jpg",
    options: [
      { text: "Track changes and manage code history", image: null },
      { text: "Encrypt code files", image: null },
      { text: "Compress code files", image: null },
      { text: "Optimize code performance", image: null }
    ],
    correct: 0
  }
];

// ===============================
// ROUND 3 LOGIC
// ===============================

const ROUND_NUMBER = 3;
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
    localStorage.setItem('round3Score', score.toString());

    // Update lamps remaining - only 1 lamp remains
    localStorage.setItem('lampsRemaining', '1');

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
            <h2>🎉 Round 3 Completed!</h2>
            <p>Your Score: <strong>${score} / ${questions.length}</strong></p>
            <p>Proceeding to Final Results...</p>
        </div>
    `;
    resultDiv.style.display = 'block';

    // Redirect to results page after delay
    setTimeout(() => {
        window.location.href = 'result.html';
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
