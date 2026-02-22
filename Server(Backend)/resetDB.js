require("dotenv").config();
const mongoose = require("mongoose");

async function resetDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    // Drop the users collection to clear old indexes
    await mongoose.connection.db.collection('users').drop();
    console.log("✅ Users collection dropped successfully");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetDB();
