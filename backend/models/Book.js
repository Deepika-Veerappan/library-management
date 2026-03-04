const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: String,
    description: String,
    availableCopies: { type: Number, required: true },

    activeIssued: { type: Number, default: 0 },   // currently issued
    totalBorrows: { type: Number, default: 0 },   // lifetime popularity
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);