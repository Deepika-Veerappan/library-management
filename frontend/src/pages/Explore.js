import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function Explore() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    API.get("/books").then((res) => setBooks(res.data));
  }, []);

  return (
    <>
      <Navbar />
      <h2 style={{ textAlign: "center" }}>Explore Books</h2>

      {books.map((book) => (
        <div key={book._id} style={{ border: "1px solid gray", margin: "20px", padding: "15px" }}>
          <p><b>ID:</b> {book.bookId}</p>
          <p><b>Name:</b> {book.name}</p>
          <p><b>Description:</b> {book.description}</p>
          <p><b>Genre:</b> {book.genre}</p>
        </div>
      ))}
    </>
  );
}

export default Explore;