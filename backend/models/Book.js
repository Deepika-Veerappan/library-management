const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookId: String,
  name: String,
  description: String,
  genre: String
});

module.exports = mongoose.model("Book", bookSchema);