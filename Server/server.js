require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const roundRoutes = require("./routes/roundRoutes");
const { resetRoundStatesToWaiting } = require("./controllers/roundControlController");

const app = express();
const server = http.createServer(app);

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
  'https://relic-rush.vercel.app'
];

const configuredAllowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST']
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("disconnect", () => {});
});


app.get("/", (req, res) => {
  res.send("Relic Rush Backend Running 🚀");
});

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", roundRoutes);

const PORT = process.env.PORT || 5000;

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Stop the existing backend instance and restart.`);
    process.exit(1);
    return;
  }

  console.error("❌ Server runtime error:", error.message);
  process.exit(1);
});

const bootstrap = async () => {
  try {
    await connectDB();
    server.listen(PORT, "0.0.0.0", async () => {
      try {
        await resetRoundStatesToWaiting();
        console.log("🔄 Round states reset to waiting on server startup");
      } catch (resetError) {
        console.error("❌ Failed to reset round states:", resetError.message);
        process.exit(1);
        return;
      }

      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server bootstrap failed:", error.message);
    process.exit(1);
  }
};

bootstrap();
