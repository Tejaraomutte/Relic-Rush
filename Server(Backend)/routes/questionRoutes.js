const express = require("express");
const router = express.Router();

const Question = require("../models/Question");
const User = require("../models/user");
const { protect } = require("../middleware/authMiddleware");

// ======================================================
// 1️⃣ ADD QUESTION (TEXT OR IMAGE)
// POST /api/questions/add
// ======================================================
router.post("/add", protect, async (req, res) => {
  try {
    // Only admin can add questions
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const {
      questionText,
      questionImage,
      options,
      correctAnswer,
      round
    } = req.body;

    const question = await Question.create({
      questionText,
      questionImage,
      options,
      correctAnswer,
      round
    });

    res.status(201).json(question);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ======================================================
// 2️⃣ GET ROUND QUESTIONS (HIDE ANSWERS)
// GET /api/questions/round/:roundNumber
// ======================================================
router.get("/round/:roundNumber", async (req, res) => {
  try {
    const questions = await Question.find({
      round: req.params.roundNumber
    }).select("-correctAnswer");

    res.json(questions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ======================================================
// 3️⃣ SUBMIT ROUND
// POST /api/questions/round/:roundNumber/submit
// ======================================================
router.post("/round/:roundNumber/submit", protect, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const roundNumber = Number(req.params.roundNumber);

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: "No answers submitted" });
    }

    const user = await User.findById(req.user._id);

    // Prevent re-submission
    if (user.currentRound >= roundNumber) {
      return res.status(400).json({ message: "Round already submitted" });
    }

    let score = 0;

    for (let ans of answers) {
      const question = await Question.findById(ans.questionId);

      if (question && question.correctAnswer === ans.selectedAnswer) {
        score++;
      }
    }

    user.score += score;
    user.currentRound = roundNumber;
    user.timeTaken = timeTaken || 0;

    await user.save();

    res.json({
      message: `Round ${roundNumber} submitted successfully`,
      score
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ======================================================
// 4️⃣ LEADERBOARD
// GET /api/questions/leaderboard
// ======================================================
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find({ eliminated: false })
      .sort({ score: -1, timeTaken: 1 })
      .select("-password");

    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ======================================================
// 5️⃣ DELETE ALL QUESTIONS (ADMIN)
// DELETE /api/questions/delete-all
// ======================================================
router.delete("/delete-all", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    await Question.deleteMany({});
    res.json({ message: "All questions deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
