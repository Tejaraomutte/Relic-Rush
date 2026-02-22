const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  round1Score: { type: Number, default: 0 },
  round2Score: { type: Number, default: 0 },
  round3Score: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
