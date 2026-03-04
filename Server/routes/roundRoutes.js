const express = require("express");
const router = express.Router();

const {
  getRoundStatuses,
  getRoundStatusByRound,
  startRound
} = require("../controllers/roundControlController");
const { protect, checkAdmin } = require("../middleware/authMiddleware");

router.get("/round-status", protect, getRoundStatuses);
router.get("/round-status/:round", protect, getRoundStatusByRound);
router.post("/admin/start-round/:round", checkAdmin, startRound);

module.exports = router;
