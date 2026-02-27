const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  submitScore,
  getPublicLeaderboard
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/submit-score", protect, submitScore);
router.get("/leaderboard", getPublicLeaderboard);


module.exports = router;
