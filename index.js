require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes"); // <-- your OTP routes

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// Auth routes
app.use("/auth", authRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is up and running on port ${PORT}!`);
});
