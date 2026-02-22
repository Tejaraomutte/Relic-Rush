const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getLeaderboard,
  submitScore
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/submit-score", submitScore);
router.get("/leaderboard", getLeaderboard);


module.exports = router;
