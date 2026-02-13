require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// 🔥 VERY IMPORTANT MIDDLEWARE
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));


app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const { protect } = require("./middleware/authMiddleware");

app.get("/protected", protect, (req, res) => {
  res.json({
    message: "Access granted 🎉",
    user: req.user
  });
});

