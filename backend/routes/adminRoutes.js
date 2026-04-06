const express = require("express");
const User = require("../models/User");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// 👑 View all users (Admin only)
router.get("/users", protect, authorize("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// 👑 Delete user (Admin only)
router.delete("/users/:id", protect, authorize("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});
router.post("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: "User added successfully" });

  } catch (error) {
    console.error("ADD USER ERROR:", error); // 👈 IMPORTANT
    res.status(500).json({ message: error.message }); // 👈 SHOW REAL ERROR
  }
});
router.put("/users/:id", protect, authorize("admin"), async (req, res) => {
  const { name, email, password } = req.body;

  const updateData = { name, email };

  if (password) {
    updateData.password = password;
  }

  await User.findByIdAndUpdate(req.params.id, updateData);

  res.json({ message: "User updated successfully" });
});

router.get("/dashboard-stats", protect, authorize("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalLibrarians = await User.countDocuments({ role: "librarian" });

    // total book copies
    const booksData = await Book.aggregate([
      {
        $project: {
          totalCopies: { $add: ["$availableCopies", "$activeIssued"] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalCopies" }
        }
      }
    ]);

    const totalBooks = booksData[0]?.total || 0;

    // issued books
    const issuedData = await Borrow.aggregate([
      { $match: { status: "Issued" } },
      { $group: { _id: null, total: { $sum: "$copiesIssued" } } }
    ]);

    const issuedBooks = issuedData[0]?.total || 0;

    // overdue books
    const today = new Date();

    const overdueData = await Borrow.aggregate([
      {
        $match: {
          status: "Issued",
          dueDate: { $lt: today }
        }
      },
      { $group: { _id: null, total: { $sum: "$copiesIssued" } } }
    ]);

    const overdueBooks = overdueData[0]?.total || 0;

    res.json({
      totalUsers,
      totalLibrarians,
      totalBooks,
      issuedBooks,
      overdueBooks
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
});
router.get("/tracking/books-issued", async (req, res) => {
  try {
    const data = await Borrow.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$issueDate" },
            year: { $year: "$issueDate" }
          },
          totalBooks: { $sum: "$copiesIssued" }
        }
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          totalBooks: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Book tracking error" });
  }
});
module.exports = router;