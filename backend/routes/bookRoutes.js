const express = require("express");
const Book = require("../models/Book");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

module.exports = router;