const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: String,
  round: Number
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
