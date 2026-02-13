const express = require("express");
const router = express.Router();

const Question = require("../models/Question");
const User = require("../models/user");
const { protect } = require("../middleware/authMiddleware");


// ----------------------------------------
// 1️⃣ Add Question
// POST /api/questions/add
// ----------------------------------------
router.post("/add", async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------
// 2️⃣ Get Round 1 Questions
// GET /api/questions/round1
// ----------------------------------------
router.get("/round1", async (req, res) => {
  try {
    const questions = await Question.find({ round: 1 })
      .select("-correctAnswer"); // hide answers

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------
// 3️⃣ Submit Round 1
// POST /api/questions/round1/submit
// ----------------------------------------
router.post("/round1/submit", protect, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: "No answers submitted" });
    }

    let score = 0;

    for (let ans of answers) {
      const question = await Question.findById(ans.questionId);

      if (question && question.correctAnswer === ans.selectedAnswer) {
        score++;
      }
    }

    const user = await User.findById(req.user._id);

    // Prevent re-submission
    if (user.currentRound >= 1) {
      return res.status(400).json({ message: "Round already submitted" });
    }

    user.score = score;
    user.currentRound = 1; // Round 1 completed
    await user.save();

    res.json({
      message: "Round 1 submitted successfully",
      score
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
