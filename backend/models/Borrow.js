const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  returnDate: Date,
  fineAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Issued", "Returned"],
    default: "Issued"
  }
});

module.exports = mongoose.model("Borrow", borrowSchema);