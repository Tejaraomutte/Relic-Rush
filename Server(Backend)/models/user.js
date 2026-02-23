const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  questionsSolved: { type: Number, default: 0 },
  questionTimes: [{ type: Number }],
  totalRoundTime: { type: Number, default: 0 },
  roundScore: { type: Number, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
  role: { type: String, enum: ["admin", "participant"], default: "participant" },
  password: { type: String, required: true },
  rounds: {
    type: [roundSchema],
    default: []
  },
  totalScore: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre("save", function updateTotalScore() {
  this.totalScore = (this.rounds || []).reduce((sum, round) => sum + (round.roundScore || 0), 0);
});

module.exports = mongoose.model("User", userSchema);
