const mongoose = require("mongoose");

const roundStateSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true, min: 1, max: 3 },
  status: {
    type: String,
    enum: ["waiting", "active", "completed"],
    default: "waiting"
  },
  durationSeconds: { type: Number, default: 600, min: 1 },
  startedAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { _id: false });

const roundControlSchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  rounds: {
    type: [roundStateSchema],
    default: [
      { roundNumber: 1, status: "waiting", durationSeconds: 600 },
      { roundNumber: 2, status: "waiting", durationSeconds: 1200 },
      { roundNumber: 3, status: "waiting", durationSeconds: 900 }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model("RoundControl", roundControlSchema);
