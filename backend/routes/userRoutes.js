const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});

module.exports = router;