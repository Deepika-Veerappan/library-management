import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function UserDashboard() {
  const [borrows, setBorrows] = useState([]);

  useEffect(() => {
    const fetchBorrows = async () => {
      const res = await API.get("/users/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setBorrows(res.data.borrowHistory || []);
    };

    fetchBorrows();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>My Borrowed Books</h2>

        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map((b) => (
              <tr key={b._id}>
                <td>{b.book?.name}</td>
                <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                <td>{b.status}</td>
                <td>₹{b.fineAmount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default UserDashboard;