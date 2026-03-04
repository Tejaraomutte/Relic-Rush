require("dotenv").config();
const mongoose = require("mongoose");

async function removeEmailFromUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const usersCollection = mongoose.connection.db.collection("users");
    const result = await usersCollection.updateMany(
      { email: { $exists: true } },
      { $unset: { email: "" } }
    );

    console.log(`Removed email field from ${result.modifiedCount} user(s).`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to remove email fields:", error.message);
    process.exit(1);
  }
}

removeEmailFromUsers();