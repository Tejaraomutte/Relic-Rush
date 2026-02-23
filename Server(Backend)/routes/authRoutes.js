const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  submitScore
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/submit-score", submitScore);


module.exports = router;
