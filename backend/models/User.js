const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "librarian", "user"],
    default: "user",
  },
});

/* 🔐 HASH PASSWORD BEFORE SAVE */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
module.exports = mongoose.model("User", userSchema);