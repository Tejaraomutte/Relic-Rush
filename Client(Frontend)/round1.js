// ===============================
// ROUND 1 QUESTIONS WITH IMAGES
// ===============================

const questions = [
  {
    question: "Find the intruder",
    questionImage: "assets/images/q1.webp",
    options: [
      { text: "1", image: null },
      { text: "2", image: null },
      { text: "3", image: null },
      { text: "4", image: null },
      { text: "5", image: null }
    ],
    correct: 1
  },
  {
    question: "A directed graph has four nodes: A, B, C, and D. The edges and their weights are: A -> B (weight 2), A -> C (weight 5), B -> C (weight 1), B -> D (weight 4), C -> D (weight 1). What is the weight of the shortest path from A to D?",
    questionImage: "assets/images/q2.jpg",
    options: [
      { text: "7", image: null },
      { text: "4", image: null },
      { text: "6", image: null },
      { text: "5", image: null }
    ],
    correct: 2
  },
  {
    question: "Solve this number visual riddle",
    questionImage: "assets/images/q3.webp",
    options: [
      { text: "4", image: null },
      { text: "6", image: null },
      { text: "8", image: null },
      { text: "10", image: null }
    ],
    correct: 2
  },
  {
    question: "Solve this question",
    questionImage: "assets/images/q4.webp",
    options: [
      { text: "12", image: null },
      { text: "13", image: null },
      { text: "14", image: null },
      { text: "15", image: null }
    ],
    correct: 1
  },
  {
    question: "Find the figure from the option, that will replace the question mark (?) from the problem figure.",
    questionImage: "assets/images/q2.jpg",
    options: [
      { text: null, image: "assets/images/q5-1.png" },
      { text: null, image: "assets/images/q5-2.png" },
      { text: null, image: "assets/images/q5-3.png" },
      { text: null, image: "assets/images/q5-4.png" }
    ],
    correct: 0
  }
];

const quizContainer = document.getElementById("quiz-container");
const submitBtn = document.getElementById("submitBtn");
const resultDiv = document.getElementById("result");
const timeDisplay = document.getElementById("time");

let timeLeft = 300;
let timer;

// ===============================
// LOAD QUIZ
// ===============================
function loadQuiz() {

  questions.forEach((q, index) => {

    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");

    let questionHTML = `<h3>Q${index + 1}. ${q.question}</h3>`;

    if (q.questionImage) {
      questionHTML += `<img src="${q.questionImage}" class="question-img">`;
    }

    questionHTML += `<div class="options">`;

    q.options.forEach((opt, i) => {

      questionHTML += `
        <label class="option-card">
          <input type="radio" name="q${index}" value="${i}">
          ${opt.text ? `<p>${opt.text}</p>` : ""}
          ${opt.image ? `<img src="${opt.image}" class="option-img">` : ""}
        </label>
      `;
    });

    questionHTML += `</div>`;

    questionDiv.innerHTML = questionHTML;
    quizContainer.appendChild(questionDiv);
  });
}

// ===============================
// TIMER
// ===============================
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      submitQuiz();
    }
  }, 1000);
}

// ===============================
// SUBMIT
// ===============================
function submitQuiz() {

  clearInterval(timer);

  let score = 0;

  questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    if (selected && parseInt(selected.value) === q.correct) {
      score++;
    }
  });

  resultDiv.innerHTML = `
    <h2>🎉 Round Completed!</h2>
    <p>Your Score: ${score} / ${questions.length}</p>
  `;

  submitBtn.disabled = true;
}

submitBtn.addEventListener("click", submitQuiz);

loadQuiz();
startTimer();
