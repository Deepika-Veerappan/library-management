import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LibrarianDashboard.css";

function LibrarianDashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ added
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);

  const [showBookModal, setShowBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiesError, setCopiesError] = useState("");
  const [bookIdError, setBookIdError] = useState("");
  const [formError, setFormError] = useState("");
  const [nonReturnedBooks, setNonReturnedBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;
  const [bookData, setBookData] = useState({
    bookId: "",
    title: "",
    author: "",
    genre: "",
    description: "",
    availableCopies: "",
  });

  const [issueData, setIssueData] = useState({
    bookId: "",
    userEmail: "",
    copies: 1,
  });

  const API = "http://localhost:5000/api/books";
  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* ===== TOAST ===== */
  const showSuccess = (msg) => {
    toast.success(msg, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeButton: false,
      icon: false,
      className: "custom-dark-toast",
    });
  };

  const showError = (msg) => {
    toast.error(msg, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeButton: false,
      className: "custom-dark-toast",
    });
  };

  useEffect(() => {
    fetchBooks();
    fetchIssuedBooks();
    fetchNonReturnedBooks();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  const fetchNonReturnedBooks = async () => {
    try {
      const res = await axios.get(`${API}/nonreturned`, config);
      setNonReturnedBooks(res.data);
    } catch {
      showError("Failed to load non-returned books");
    }
  };
  const calculateFine = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);

    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays * 10 : 0; // ₹5 per day
  };
  const handleSendReminder = async (id) => {
    try {
      await axios.post(`${API}/send-reminder/${id}`, {}, config);
      showSuccess("Reminder Sent Successfully");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to send reminder");
    }
  };
  const fetchBooks = async () => {
    try {
      const res = await axios.get(API, config);
      setBooks(res.data);
    } catch {
      showError("Failed to load books");
    }
  };

  const fetchIssuedBooks = async () => {
    try {
      const res = await axios.get(`${API}/issued`, config);
      setIssuedBooks(res.data);
    } catch {
      showError("Failed to load issued books");
    }
  };

  /* ===== BOOK HANDLERS (UNCHANGED) ===== */
  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBookData({ ...bookData, [name]: value });
    setFormError("");

    if (name === "availableCopies") setCopiesError("");
    if (name === "bookId") {
      setBookIdError("");
      const exists = books.some(
        (book) =>
          String(book.bookId) === String(value) &&
          book._id !== bookData._id
      );
      if (exists) setBookIdError("Book ID already exists");
    }
  };

  const handleAddBook = async () => {
    setFormError("");
    setCopiesError("");

    if (
      !bookData.bookId ||
      !bookData.title ||
      !bookData.author ||
      !bookData.genre ||
      !bookData.description ||
      !bookData.availableCopies
    ) {
      setFormError("Enter all details to add book");
      return;
    }

    if (Number(bookData.availableCopies) <= 0) {
      setCopiesError("Invalid no of books");
      return;
    }

    if (bookIdError) return;

    try {
      await axios.post(API, bookData, config);
      showSuccess("Book Added Successfully");
      fetchBooks();
      setShowBookModal(false);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add book");
    }
  };

  const handleEditBook = async () => {
    if (!bookData.availableCopies || Number(bookData.availableCopies) <= 0) {
      setCopiesError("Invalid no of books");
      return;
    }

    try {
      await axios.put(`${API}/${bookData._id}`, bookData, config);
      showSuccess("Book Updated Successfully");
      fetchBooks();
      setShowBookModal(false);
    } catch (err) {
      showError(err.response?.data?.message || "Update failed");
    }
  };

  const confirmDeleteBook = async () => {
    try {
      await axios.delete(`${API}/${deleteId}`, config);
      showSuccess("Book Deleted Successfully");
      fetchBooks();
    } catch {
      showError("Delete Failed");
    }
    setShowDeleteModal(false);
  };

  const handleIssueChange = (e) => {
    setIssueData({ ...issueData, [e.target.name]: e.target.value });
  };

  const handleIssueSubmit = async () => {
    try {
      const res = await axios.post(`${API}/issue`, issueData, config);
      showSuccess("Book Issued Successfully");
      setShowIssueModal(false);
      await fetchNonReturnedBooks();
      fetchBooks();
      fetchIssuedBooks();
    } catch (err) {
      showError(err.response?.data?.message || "Issue Failed");
    }
  };

  const handleReturn = async (id) => {
    try {
      await axios.post(`${API}/return/${id}`, {}, config);
      showSuccess("Book Returned Successfully");
      fetchBooks();
      fetchIssuedBooks();
      setNonReturnedBooks(prev =>
        prev.filter(book => book._id !== id)
      );
    } catch (err) {
      showError(err.response?.data?.message || "Return Failed");
    }
  };

  const sortedBooks = [...books].sort(
    (a, b) => (b.totalBorrows || 0) - (a.totalBorrows || 0)
  );
  // ===== RANKING LOGIC (handles ties) =====
let rank = 0;
let prevCount = null;

const rankedBooks = sortedBooks.map((book) => {
  const count = book.totalBorrows || 0;

  if (count !== prevCount) {
    rank++;
    prevCount = count;
  }

  return { ...book, rank };
});

// Take only rank 1, 2, 3
const topBooks = rankedBooks.filter(book => book.rank <= 3);

// Remaining books (exclude top ones)
const remainingTrackingBooks = rankedBooks.filter(book => book.rank > 3);
  // ===== DASHBOARD STATS =====
  // ===== DASHBOARD STATS =====

  // Total physical books (original stock)
  const totalBooks = books.reduce(
    (sum, book) =>
      sum + (book.availableCopies || 0) + (book.activeIssued || 0),
    0
  );

  // Lifetime issued
  const totalIssuedLifetime = books.reduce(
    (sum, book) => sum + (book.totalBorrows || 0),
    0
  );

  // Currently issued
  const totalCurrentlyIssued = books.reduce(
    (sum, book) => sum + (book.activeIssued || 0),
    0
  );

  // Currently available
  const totalAvailable = books.reduce(
    (sum, book) => sum + (book.availableCopies || 0),
    0
  );
  const filteredBooks = books.filter((book) =>
    (book.bookId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (book.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (book.author?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (book.genre?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const isSearching = searchTerm.trim() !== "";
  
  return (
    <div className="librarian-container">
      <ToastContainer />

      {/* HEADER */}
      <div className="top-header">
        <h2>Library Management</h2>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* DASHBOARD TITLE + HAMBURGER */}
      <div className="dashboard-title-bar">
        <div
          className={`menu-box ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="menu-icon">☰</span>
        </div>
        <h1 className="librarian-heading">Librarian Dashboard</h1>
      </div>

      <div className="main-layout">
        {/* SIDEBAR (TOGGLE ADDED) */}
        {sidebarOpen && (
          <div className="sidebar">
            <div
              className={`nav-item ${activeTab === "books" ? "active" : ""}`}
              onClick={() => setActiveTab("books")}
            >
              Books
            </div>
            <div
              className={`nav-item ${activeTab === "issues" ? "active" : ""}`}
              onClick={() => setActiveTab("issues")}
            >
              Issue Books
            </div>
            <div
              className={`nav-item ${activeTab === "nonreturned" ? "active" : ""}`}
              onClick={() => setActiveTab("nonreturned")}
            >
              Non-Returned Books
            </div>
            <div
              className={`nav-item ${activeTab === "tracking" ? "active" : ""}`}
              onClick={() => setActiveTab("tracking")}
            >
              Book Tracking
            </div>
          </div>
        )}

        {/* CONTENT AREA (UNCHANGED) */}
        <div className="content-area">
          {/* ===== DASHBOARD STATS BOXES ===== */}
          {/* ALL YOUR EXISTING TABS BELOW — NO CHANGES */}
          {/* BOOKS TAB */}
          {activeTab === "books" && (
            <div className="table-container">
              <div className="page-header">
                <h3>Books List</h3>

                <div className="header-actions">
                  <input
                    type="text"
                    placeholder="Search books..."
                    className="search-bar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <button
                    className="add-btn blue-form-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setCopiesError("");
                      setFormError("");
                      setBookIdError("");
                      setBookData({
                        _id: "",
                        bookId: "",
                        title: "",
                        author: "",
                        genre: "",
                        description: "",
                        availableCopies: "",
                      });
                      setShowBookModal(true);
                    }}
                  >
                    + Add Book
                  </button>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Book ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBooks.length > 0 ? (
                    (isSearching ? filteredBooks : currentBooks).map((book) => (
                      <tr key={book._id}>
                        <td>{book.bookId}</td>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.genre}</td>
                        <td>{book.availableCopies}</td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setIsEditing(true);
                              setCopiesError("");
                              setBookIdError("");
                              setFormError("");
                              setBookData({
                                _id: book._id,
                                bookId: book.bookId,
                                title: book.title || "",
                                author: book.author || "",
                                genre: book.genre || "",
                                description: book.description || "",
                                availableCopies: book.availableCopies || "",
                              });

                              setShowBookModal(true);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => {
                              setDeleteId(book._id);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data-text">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagination" style={{ display: isSearching ? "none" : "flex" }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Prev
                </button>

                <span>
                  Page {currentPage} of {totalPages || 1}
                </span>

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ISSUE TAB */}
          {activeTab === "issues" && (
            <div className="issue-box">

              {/* Header */}
              <div className="issue-box-header">
                <h3 className="issue-heading">Issue Books</h3>

                <button
                  className="blue-form-btn"
                  onClick={() => setShowIssueModal(true)}
                >
                  + Issue Book
                </button>
              </div>

              {/* Table */}
              <table>
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Book</th>
                    <th>Copies</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBooks.map((issue) => (
                    <tr key={issue._id}>
                      <td>{issue.userEmail}</td>
                      <td>{issue.book?.title}</td>
                      <td>{issue.copiesIssued}</td>
                      <td>{issue.status}</td>
                      <td>
                        {issue.status === "Issued" && (
                          <button
                            className="edit-btn"
                            onClick={() => handleReturn(issue._id)}
                          >
                            Mark as Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}
          {/* NON-RETURNED TAB */}
          {activeTab === "nonreturned" && (
            <div className="table-container">
              <h3>Non-Returned Books</h3>

              <table>
                <thead>
                  <tr>
                    <th>Book ID</th>
                    <th>User Email</th>
                    <th>Issued Date</th>
                    <th>Due Date</th>
                    <th>Fine Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {nonReturnedBooks.length > 0 ? (
                    nonReturnedBooks.map((issue) => (
                      <tr key={issue._id} className={
                        calculateFine(issue.dueDate) > 0
                          ? "overdue-row"
                          : ""
                      }>
                        <td>{issue.book?.bookId}</td>
                        <td>{issue.userEmail}</td>
                        <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                        <td>
                          {issue.dueDate
                            ? new Date(issue.dueDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          ₹{calculateFine(issue.dueDate)}
                        </td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => handleSendReminder(issue._id)}
                          >
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data-text">
                        No Non-Returned Books
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* TRACKING TAB */}
          {activeTab === "tracking" && (
            <div>

              {/* ===== STATS OUTSIDE TABLE BOX ===== */}
              <div className="stats-container">
                <div className="stat-box">
                  <h4>Total Books</h4>
                  <p>{totalBooks}</p>
                </div>

                <div className="stat-box">
                  <h4>Total Books Issued (Lifetime)</h4>
                  <p>{totalIssuedLifetime}</p>
                </div>

                <div className="stat-box">
                  <h4>Currently Issued Books</h4>
                  <p>{totalCurrentlyIssued}</p>
                </div>

                <div className="stat-box">
                  <h4>Currently Available Books</h4>
                  <p>{totalAvailable}</p>
                </div>
              </div>

              {/* ===== EXISTING TABLE BOX ===== */}
              {/* ===== TOP 3 SECTION ===== */}
<div className="top-books-section">
  <h3>🏆 Top 3 Most Issued Books</h3>

  <div className="top-books-container">
    {topBooks.map((book) => (
      <div key={book._id} className={`rank-box rank-${book.rank}`}>
  <div className="rank-book-id">{book.bookId}</div>
  <h4>#{book.rank}</h4>
  <p className="rank-title">{book.title}</p>
  <p>Total Issued: {book.totalBorrows || 0}</p>
</div>
    ))}
  </div>
</div>

{/* ===== REMAINING TABLE ===== */}
<div className="table-container">
  <h3>Other Books</h3>

  <table>
    <thead>
      <tr>
        <th>Book ID</th>
        <th>Title</th>
        <th>Total Issued</th>
      </tr>
    </thead>
    <tbody>
      {remainingTrackingBooks.map((book) => (
        <tr key={book._id}>
          <td>{book.bookId}</td>
          <td>{book.title}</td>
          <td>{book.totalBorrows || 0}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
            </div>
          )}
        </div>
      </div>

      {/* BOOK MODAL */}
      {showBookModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{isEditing ? "Edit Book" : "Add Book"}</h3>

            <input
              type="text"
              name="bookId"
              value={bookData.bookId}
              onChange={handleBookChange}
              placeholder="Book ID"
              readOnly={isEditing}
              className={!bookData.bookId && formError ? "input-error" : ""}

            />

            {bookIdError && (
              <p className="bookid-error-text">{bookIdError}</p>
            )}
            <input name="title" value={bookData.title} onChange={handleBookChange} placeholder="Title" className={!bookData.title && formError ? "input-error" : ""} />
            <input name="author" value={bookData.author} onChange={handleBookChange} placeholder="Author" className={!bookData.author && formError ? "input-error" : ""} />
            <input name="genre" value={bookData.genre} onChange={handleBookChange} placeholder="Genre" className={!bookData.genre && formError ? "input-error" : ""} />
            <textarea name="description" value={bookData.description} onChange={handleBookChange} placeholder="Description" className={!bookData.description && formError ? "input-error" : ""} />
            <input
              type="number"
              name="availableCopies"
              value={bookData.availableCopies}
              onChange={handleBookChange}
              placeholder="Available Copies"
              className={!bookData.availableCopies && formError ? "input-error" : ""}
            />

            {copiesError && (
              <p className="copies-error-text">{copiesError}</p>
            )}
            {formError && (
              <p className="form-error-text">{formError}</p>
            )}
            <div className="modal-buttons">
              <button onClick={() => setShowBookModal(false)}>Cancel</button>
              <button className="blue-form-btn" onClick={isEditing ? handleEditBook : handleAddBook}>
                {isEditing ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ISSUE MODAL */}
      {showIssueModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Issue Book</h3>

            <input name="bookId" onChange={handleIssueChange} placeholder="Book ID" />
            <input name="userEmail" onChange={handleIssueChange} placeholder="User Email" />
            <input type="number" name="copies" onChange={handleIssueChange} placeholder="No of Copies" />

            <div className="modal-buttons">
              <button onClick={() => setShowIssueModal(false)}>Cancel</button>
              <button className="blue-form-btn" onClick={handleIssueSubmit}>Issue</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE POPUP */}
      {showDeleteModal && (
        <div className="delete-overlay">
          <div className="delete-popup">
            <h3>Do you want to delete this book?</h3>
            <div className="delete-popup-buttons">
              <button className="popup-cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="popup-delete-btn" onClick={confirmDeleteBook}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibrarianDashboard;