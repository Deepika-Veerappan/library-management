const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    userEmail: String,

    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },

    copiesIssued: Number,

    status: {
      type: String,
      default: "Issued", // Issued | Returned
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    returnDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Borrow", borrowSchema);