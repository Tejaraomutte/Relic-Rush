const mongoose = require("mongoose");

const questionSchema = mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true
    },

    imageUrl: {
      type: String
    },

    options: [
      {
        type: String,
        required: true
      }
    ],

    correctAnswer: {
      type: Number, // index of correct option
      required: true
    },

    round: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
