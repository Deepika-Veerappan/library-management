const mongoose = require("mongoose");

const purchasedBookSchema = new mongoose.Schema({
  bookId: String,
  bookName: String,
  purchasedDate: Date,
  dueDate: Date,
  fineAmount: Number,
  status: {
    type: String,
    enum: ["Returned", "Not Returned"]
  }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "user"] },
  purchasedBooks: [purchasedBookSchema]
});

module.exports = mongoose.model("User", userSchema);