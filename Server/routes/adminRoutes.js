const express = require("express");
const router = express.Router();

const { getAdminLeaderboard } = require("../controllers/authController");
const { checkAdmin } = require("../middleware/authMiddleware");

router.get("/leaderboard", checkAdmin, getAdminLeaderboard);

module.exports = router;