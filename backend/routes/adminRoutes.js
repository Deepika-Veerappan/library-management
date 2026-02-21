const express = require("express");
const Book = require("../models/Book");
const User = require("../models/User");
const Borrow = require("../models/Borrow");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// ✅ Add Book
router.post("/add-book", protect, adminOnly, async (req, res) => {
  const book = await Book.create(req.body);
  res.json(book);
});


// ✅ View All Users
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find();
  res.json(users);
});


// ✅ Issue Book
router.post("/issue-book", protect, adminOnly, async (req, res) => {
  const { userId, bookId, dueDate } = req.body;

  const borrow = await Borrow.create({
    user: userId,
    book: bookId,
    dueDate
  });

  res.json({ message: "Book Issued", borrow });
});


// ✅ Return Book + Auto Fine
router.post("/return-book/:id", protect, adminOnly, async (req, res) => {
  const borrow = await Borrow.findById(req.params.id);

  if (!borrow) return res.status(404).json({ message: "Record not found" });

  const today = new Date();
  borrow.returnDate = today;
  borrow.status = "Returned";

  if (today > borrow.dueDate) {
    const daysLate = Math.ceil(
      (today - borrow.dueDate) / (1000 * 60 * 60 * 24)
    );
    borrow.fineAmount = daysLate * 10; // ₹10 per day
  }

  await borrow.save();

  res.json({ message: "Book Returned", borrow });
});


module.exports = router;