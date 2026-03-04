const express = require("express");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/* ===============================
   GET ALL BOOKS
================================ */
router.get("/", protect, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

/* ===============================
   ADD BOOK
================================ */
router.post("/", protect, authorize("librarian"), async (req, res) => {
  try {
    const { _id, ...bookData } = req.body;

    const book = await Book.create({
      ...bookData,
      availableCopies: Number(bookData.availableCopies),
      activeIssued: 0,
      totalBorrows: 0,
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({
      message: "Error adding book",
      error: err.message,
    });
  }
});

/* ===============================
   EDIT BOOK
================================ */
router.put("/:id", protect, authorize("librarian"), async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        availableCopies: Number(req.body.availableCopies),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating book" });
  }
});

/* ===============================
   DELETE BOOK
================================ */
router.delete("/:id", protect, authorize("librarian"), async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting book" });
  }
});

/* ===============================
   ISSUE BOOK
================================ */
router.post("/issue", protect, authorize("librarian"), async (req, res) => {
  try {
    const { userEmail, bookId, copies } = req.body;

    const numericCopies = parseInt(copies, 10);

    if (isNaN(numericCopies) || numericCopies <= 0) {
      return res.status(400).json({ message: "Invalid copies value" });
    }

    const book = await Book.findOne({ bookId });

    if (!book)
      return res.status(404).json({ message: "Book not found" });

    if (book.availableCopies < numericCopies)
      return res.status(400).json({ message: "Not enough copies available" });

    /* 🔹 Update Stock */
    book.availableCopies -= numericCopies;

    /* 🔹 Update Currently Issued Count */
    book.activeIssued =
      Number(book.activeIssued || 0) + numericCopies;

    /* 🔹 Update Lifetime Popularity */
    book.totalBorrows =
      Number(book.totalBorrows || 0) + numericCopies;

    await book.save();

    /* 🔹 Create Borrow Record */
   /* 🔹 Create Borrow Record */
const issueDate = new Date();
const dueDate = new Date();
dueDate.setDate(issueDate.getDate() + 7); // 7 days loan

const borrow = await Borrow.create({
  userEmail,
  book: book._id,
  copiesIssued: numericCopies,
  status: "Issued",
  issueDate,
  dueDate,
});

    res.json({ message: "Book issued successfully", borrow });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Issue failed" });
  }
});

/* ===============================
   RETURN BOOK
================================ */
router.post("/return/:id", protect, authorize("librarian"), async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id).populate("book");

    if (!borrow)
      return res.status(404).json({ message: "Record not found" });

    if (borrow.status === "Returned")
      return res.status(400).json({ message: "Already returned" });

    const numericCopies = Number(borrow.copiesIssued);

    /* 🔹 Restore Stock */
    borrow.book.availableCopies += numericCopies;

    /* 🔹 Reduce Active Issued Count */
    borrow.book.activeIssued =
      Number(borrow.book.activeIssued) - numericCopies;

    await borrow.book.save();

    borrow.status = "Returned";
    borrow.returnDate = new Date();
    await borrow.save();

    res.json({ message: "Book returned successfully", borrow });

  } catch (err) {
  console.error("RETURN ERROR:", err);
  res.status(500).json({ 
    message: "Return failed",
    error: err.message
  });
}
});

/* ===============================
   GET ISSUED BOOKS
================================ */
router.get("/issued", protect, authorize("librarian"), async (req, res) => {
  try {
    const data = await Borrow.find()
      .populate("book")
      .sort({ createdAt: -1 });

    const today = new Date();

    const updatedData = data.map((record) => {
      const due = new Date(record.dueDate);

      let daysLate = Math.floor(
        (today - due) / (1000 * 60 * 60 * 24)
      );

      daysLate = daysLate > 0 ? daysLate : 0;

      const isOverdue =
        record.status === "Issued" && today > due;

      const fine = daysLate * 10; // ₹10 per day

      return {
        ...record._doc,
        isOverdue,
        daysLate,
        fine,
      };
    });

    res.json(updatedData);

  } catch (err) {
    res.status(500).json({ message: "Error fetching issued books" });
  }
});

/* ===============================
   TRACKING - MOST POPULAR
================================ */
router.get("/tracking/popular", protect, authorize("librarian"), async (req, res) => {
  try {
    const books = await Book.find().sort({ totalBorrows: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Tracking error" });
  }
});

/* ===============================
   TRACKING - CURRENTLY ISSUED
================================ */
router.get("/tracking/active", protect, authorize("librarian"), async (req, res) => {
  try {
    const books = await Book.find().sort({ activeIssued: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Tracking error" });
  }
});
// GET /api/books/nonreturned
router.get("/nonreturned", protect, async (req, res) => {
  try {
    const issues = await Borrow.find({
      status: { $ne: "Returned" },
    }).populate("book");

    res.json(issues);
  } catch (err) {
    console.log("NONRETURNED ERROR:", err);   // 👈 VERY IMPORTANT
    res.status(500).json({ message: "Server error" });
  }
});
// POST /api/books/send-reminder/:id
// POST /api/books/send-reminder/:id
router.post("/send-reminder/:id", protect, authorize("librarian"), async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id).populate("book");

    if (!borrow) {
      return res.status(404).json({ message: "Record not found" });
    }

    // For now, just simulate reminder
    console.log(
      `Reminder sent to ${borrow.userEmail} for Book ID ${borrow.book.bookId}`
    );

    res.json({ message: "Reminder sent successfully" });

  } catch (err) {
    console.log("REMINDER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;