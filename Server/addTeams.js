const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/user');

async function addTeams() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const teams = [
      {
        teamName: 'TeamAlpha',
        password: 'TeamAlpha@Relic',
        role: 'participant',
        isLoggedIn: false,
        rounds: [],
        roundsPlayed: {
          round1Played: false,
          round2Played: false,
          round3Played: false
        },
        scores: {
          round1: 0,
          round2: 0,
          round3: 0
        },
        totalScore: 0
      },
      {
        teamName: 'TejaHema',
        password: 'TejaHema@Relic',
        role: 'participant',
        isLoggedIn: false,
        rounds: [],
        roundsPlayed: {
          round1Played: false,
          round2Played: false,
          round3Played: false
        },
        scores: {
          round1: 0,
          round2: 0,
          round3: 0
        },
        totalScore: 0
      }
    ];

    for (const teamData of teams) {
      // Check if team already exists
      const existingTeam = await User.findOne({ teamName: teamData.teamName });
      
      if (existingTeam) {
        console.log(`Team "${teamData.teamName}" already exists. Skipping...`);
        continue;
      }

      // Create new team
      const team = await User.create(teamData);
      console.log(`✓ Created team: ${team.teamName}`);
    }

    console.log('\n✅ Teams added successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error adding teams:', error);
    process.exit(1);
  }
}

addTeams();
