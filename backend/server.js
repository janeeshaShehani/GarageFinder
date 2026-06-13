const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ✅ CORS must come FIRST, before any routes or other middleware
app.use(cors({
  origin: "*",              // Allow all origins (localhost, hotspot, any IP)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// ✅ Routes registered ONCE with consistent /api/garages (plural)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/garages", require("./routes/garageRoutes"));
app.use("/api/garage", require("./routes/garageRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

app.get("/", (req, res) => {
  res.send("GarageFinder API Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));