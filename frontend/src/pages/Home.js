import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function Home() {
  const [borrows, setBorrows] = useState([]);

  useEffect(() => {
    API.get("/users/profile").then((res) => {
      setBorrows(res.data.purchasedBooks || []);
    });
  }, []);

  return (
    <>
      <Navbar />
      <h2 style={{ textAlign: "center" }}>Purchased Books</h2>

      <table border="1" cellPadding="10" style={{ margin: "auto" }}>
        <thead>
          <tr>
            <th>Book ID</th>
            <th>Name</th>
            <th>Purchased</th>
            <th>Due</th>
            <th>Fine</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {borrows.map((b, i) => (
            <tr key={i}>
              <td>{b.bookId}</td>
              <td>{b.bookName}</td>
              <td>{new Date(b.purchasedDate).toDateString()}</td>
              <td>{new Date(b.dueDate).toDateString()}</td>
              <td>{b.fineAmount}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Home;