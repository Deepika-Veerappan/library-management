require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const PORT = process.env.PORT || 5000;
connectDB();
const helmet = require("helmet");
const app = express();
app.get("/", (req, res) => {
  res.send("Library Backend API is running successfully");
});
app.use(
  cors({
    origin: [
      "https://library-management-k4l5tmpvr-deepika-veerappans-projects.vercel.app",
      "https://library-management-mzsz4s6z6-deepika-veerappans-projects.vercel.app"
    ],
    credentials: true
  })
);
app.use(express.json());
app.use(helmet());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});