import { useState, useEffect } from "react";
import API from "../api";
import UserNavbar from "../components/UserNavbar";
import "./UserDashboard.css";

function UserDashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");

  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);

  /* ---------------- HOME BOOKS ---------------- */

  const fetchBooks = async () => {

    const res = await API.get("/users/my-books", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    setBooks(res.data);
  };

  /* ---------------- ALL BOOKS ---------------- */

  const fetchAllBooks = async () => {

    const res = await API.get("/books");

    setAllBooks(res.data);

    let sorted = [...res.data].sort((a,b)=> b.totalBorrows - a.totalBorrows);

    let popular = [];
    let rank = 1;
    let prevIssued = null;

    for(let i=0;i<sorted.length;i++){

      let book = sorted[i];

      if(prevIssued === null){
        popular.push(book);
        prevIssued = book.totalBorrows;
      }

      else if(book.totalBorrows === prevIssued){
        popular.push(book);
      }

      else{

        rank++;

        if(rank > 5) break;

        popular.push(book);
        prevIssued = book.totalBorrows;
      }
    }

    setPopularBooks(popular);
  };


  /* ---------------- USE EFFECT ---------------- */

  useEffect(()=>{

    fetchBooks();
    fetchAllBooks();

  },[]);

const calculateFine = (dueDate) => {

  const today = new Date();
  const due = new Date(dueDate);

  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays * 10 : 0;
};
  /* ---------------- PAGE RENDER ---------------- */

  const renderPage = () => {

    /* ---------- HOME ---------- */

    if(activePage==="home"){

      return(

        <div className="table-container">

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

              {books.length === 0 ? (

                <tr>
                  <td colSpan="4" className="no-books">
                    No books were borrowed
                  </td>
                </tr>

              ) : (

                books.map((b)=>{

                  const fine = b.status === "Issued"
  ? calculateFine(b.dueDate)
  : 0;

                  return(

                    <tr key={b._id}>

                      <td>{b.book?.title}</td>

                      <td>
                        {new Date(b.dueDate).toLocaleDateString()}
                      </td>

                      <td>
                        {b.status==="Returned"
                          ? "Returned"
                          : "Not Returned"}
                      </td>

                      <td>₹ {fine}</td>

                    </tr>

                  )
                })

              )}

            </tbody>

          </table>

        </div>

      )
    }


    /* ---------- EXPLORE ---------- */

    if(activePage==="explore"){

      return(

        <div className="explore-page">

          <h2>Explore Books</h2>

          <div className="book-grid">

            {allBooks.map((b)=>(
              <div key={b._id} className="book-card">

                <h3>{b.title}</h3>

                <p><b>ID:</b> {b.bookId}</p>

                <p>{b.description}</p>

              </div>
            ))}

          </div>

        </div>

      )
    }


    /* ---------- POPULAR ---------- */

    if(activePage==="popular"){

  return(

    <div className="popular-container">

      <h2 className="section-title">
        🏆 Top 3 Most Issued Books
      </h2>

      <div className="popular-grid">

        {popularBooks.slice(0,3).map((b,index)=>(

          <div key={b._id} className="popular-card">

            <div className="book-id">{b.bookId}</div>

            <div className="rank">#{index+1}</div>

            <h3>{b.title}</h3>

            <div className="total-issued">
              Total Issued: {b.totalBorrows}
            </div>

          </div>

        ))}

      </div>

    </div>

  )
}

  };


  return(

    <div className="dashboard-container">

      {/* NAVBAR */}
      <UserNavbar />

      {/* TITLE BAR */}

      <div className="dashboard-title-bar">

        <div
          className={`menu-box ${sidebarOpen ? "active" : ""}`}
          onClick={()=>setSidebarOpen(!sidebarOpen)}
        >
         <span className="menu-icon">☰</span>
        </div>

        <h1 className="dashboard-heading">
          User Dashboard
        </h1>

      </div>


      {/* SIDEBAR */}

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        <button
          className={activePage==="home" ? "active" : ""}
          onClick={()=>setActivePage("home")}
        >
          Home
        </button>

        <button
          className={activePage==="explore" ? "active" : ""}
          onClick={()=>setActivePage("explore")}
        >
          Explore
        </button>

        <button
          className={activePage==="popular" ? "active" : ""}
          onClick={()=>setActivePage("popular")}
        >
          Popular Books
        </button>

      </div>


      {/* CONTENT */}

      <div className={`page-content ${sidebarOpen ? "shift" : ""}`}>
        {renderPage()}
      </div>

    </div>

  )

}

export default UserDashboard;