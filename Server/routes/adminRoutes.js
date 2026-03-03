const express = require("express");
const router = express.Router();

const { getAdminLeaderboard, createTeamByAdmin, updateTeamByAdmin } = require("../controllers/authController");
const { checkAdmin } = require("../middleware/authMiddleware");

router.get("/leaderboard", checkAdmin, getAdminLeaderboard);
router.post("/teams", checkAdmin, createTeamByAdmin);
router.put("/update-team/:id", checkAdmin, updateTeamByAdmin);

module.exports = router;