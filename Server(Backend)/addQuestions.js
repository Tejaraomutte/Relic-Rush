const mongoose = require('mongoose');
require('dotenv').config();

const questionSchema = new mongoose.Schema(
  {
    questionText: String,
    imageUrl: String,
    options: [
      {
        text: String,
        imageUrl: String
      }
    ],
    correctAnswer: Number,
    round: Number
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);

async function addSampleQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing questions for round 1
    await Question.deleteMany({ round: 1 });
    console.log('Cleared existing questions');

    // Add sample questions
    const sampleQuestions = [
      {
        questionText: 'What is the capital of France?',
        imageUrl: null,
        options: [
          { text: 'London', imageUrl: null },
          { text: 'Paris', imageUrl: null },
          { text: 'Berlin', imageUrl: null },
          { text: 'Madrid', imageUrl: null }
        ],
        correctAnswer: 1,
        round: 1
      },
      {
        questionText: 'Which planet is known as the Red Planet?',
        imageUrl: null,
        options: [
          { text: 'Venus', imageUrl: null },
          { text: 'Mars', imageUrl: null },
          { text: 'Jupiter', imageUrl: null },
          { text: 'Saturn', imageUrl: null }
        ],
        correctAnswer: 1,
        round: 1
      },
      {
        questionText: 'Who wrote Romeo and Juliet?',
        imageUrl: null,
        options: [
          { text: 'Jane Austen', imageUrl: null },
          { text: 'Mark Twain', imageUrl: null },
          { text: 'William Shakespeare', imageUrl: null },
          { text: 'Charles Dickens', imageUrl: null }
        ],
        correctAnswer: 2,
        round: 1
      },
      {
        questionText: 'What is the largest ocean on Earth?',
        imageUrl: null,
        options: [
          { text: 'Atlantic Ocean', imageUrl: null },
          { text: 'Indian Ocean', imageUrl: null },
          { text: 'Arctic Ocean', imageUrl: null },
          { text: 'Pacific Ocean', imageUrl: null }
        ],
        correctAnswer: 3,
        round: 1
      },
      {
        questionText: 'In what year did the Titanic sink?',
        imageUrl: null,
        options: [
          { text: '1900', imageUrl: null },
          { text: '1912', imageUrl: null },
          { text: '1920', imageUrl: null },
          { text: '1931', imageUrl: null }
        ],
        correctAnswer: 1,
        round: 1
      }
    ];

    const inserted = await Question.insertMany(sampleQuestions);
    console.log(`✅ Added ${inserted.length} sample questions for Round 1`);

    // Verify they were added
    const count = await Question.countDocuments({ round: 1 });
    console.log(`Total questions in Round 1: ${count}`);

    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addSampleQuestions();
