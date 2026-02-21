import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookData, setBookData] = useState({
    bookId: "",
    name: "",
    description: "",
    genre: ""
  });

  useEffect(() => {
    API.get("/admin/users").then(res => setUsers(res.data));
    API.get("/books").then(res => setBooks(res.data));
  }, []);

  const addBook = async () => {
    await API.post("/admin/add-book", bookData);
    alert("Book Added");
  };

  const issueBook = async (userId, bookId) => {
    await API.post("/admin/issue-book", {
      userId,
      bookId,
      dueDate: new Date(Date.now() + 7*24*60*60*1000)
    });
    alert("Book Issued");
  };

  return (
    <>
      <Navbar />
      <h2>Admin Dashboard</h2>

      <h3>Add Book</h3>
      <input placeholder="Book ID" onChange={e=>setBookData({...bookData, bookId:e.target.value})}/>
      <input placeholder="Name" onChange={e=>setBookData({...bookData, name:e.target.value})}/>
      <input placeholder="Description" onChange={e=>setBookData({...bookData, description:e.target.value})}/>
      <input placeholder="Genre" onChange={e=>setBookData({...bookData, genre:e.target.value})}/>
      <button onClick={addBook}>Add</button>

      <h3>Issue Book</h3>
      {users.map(user=>(
        <div key={user._id}>
          <p>{user.name}</p>
          {books.map(book=>(
            <button key={book._id} onClick={()=>issueBook(user._id, book._id)}>
              Issue {book.name}
            </button>
          ))}
        </div>
      ))}
    </>
  );
}

export default AdminDashboard;