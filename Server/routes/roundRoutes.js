const express = require("express");
const router = express.Router();

const {
  getRoundStatuses,
  getRoundStatusByRound,
  startRound,
  getOrCreatePlayerRoundProgress,
  getPlayerRoundProgress,
  completePlayerRound
} = require("../controllers/roundControlController");
const { protect, checkAdmin } = require("../middleware/authMiddleware");

router.get("/round-status", protect, getRoundStatuses);
router.get("/round-status/:round", protect, getRoundStatusByRound);
router.post("/admin/start-round/:round", checkAdmin, startRound);
router.post("/round-progress/:round/enter", protect, getOrCreatePlayerRoundProgress);
router.get("/round-progress/:round", protect, getPlayerRoundProgress);
router.post("/round-progress/:round/complete", protect, completePlayerRound);

module.exports = router;
