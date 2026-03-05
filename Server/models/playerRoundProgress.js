const mongoose = require("mongoose");

const playerRoundProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  roundId: { type: Number, required: true, min: 1, max: 3, index: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true, min: 1 },
  completed: { type: Boolean, default: false },
  score: { type: Number, default: 0 }
}, { timestamps: true });

playerRoundProgressSchema.index({ userId: 1, roundId: 1 }, { unique: true });

module.exports = mongoose.model("PlayerRoundProgress", playerRoundProgressSchema);