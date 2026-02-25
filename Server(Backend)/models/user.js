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
  isLoggedIn: { type: Boolean, default: false },
  rounds: {
    type: [roundSchema],
    default: []
  },
  roundsPlayed: {
    round1Played: { type: Boolean, default: false },
    round2Played: { type: Boolean, default: false },
    round3Played: { type: Boolean, default: false }
  },
  scores: {
    round1: { type: Number, default: 0 },
    round2: { type: Number, default: 0 },
    round3: { type: Number, default: 0 }
  },
  totalScore: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre("save", function updateTotalScore() {
  const rounds = Array.isArray(this.rounds) ? this.rounds : [];
  const getRound = (roundNumber) => rounds.find((round) => round.roundNumber === roundNumber);
  const getScore = (roundNumber) => {
    const round = getRound(roundNumber);
    return Number(round?.roundScore || 0);
  };

  this.scores = {
    round1: getScore(1),
    round2: getScore(2),
    round3: getScore(3)
  };

  this.roundsPlayed = {
    round1Played: Boolean(getRound(1)),
    round2Played: Boolean(getRound(2)),
    round3Played: Boolean(getRound(3))
  };

  this.totalScore = rounds.reduce((sum, round) => sum + (round.roundScore || 0), 0);
});

module.exports = mongoose.model("User", userSchema);
