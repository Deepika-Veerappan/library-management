import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import eyeOpen from "../assets/eye-open.png";
import eyeClose from "../assets/eye-close.png";
function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toast, setToast] = useState("");
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditToast, setShowEditToast] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [editUser, setEditUser] = useState({
    _id: "",
    name: "",
    email: "",
    password: "",
  });
  /* ===== NEW STATES FOR ADD USER ===== */
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    role: "librarian",
    name: "",
    email: "",
    password: "",
  });
const [stats, setStats] = useState({
  totalUsers: 0,
  totalLibrarians: 0,
  totalBooks: 0,
  issuedBooks: 0,
  overdueBooks: 0
});
const fetchDashboardStats = async () => {
  try {
    const res = await API.get("/admin/dashboard-stats", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    setStats(res.data);
  } catch (err) {
    console.log("Stats fetch failed");
  }
};
  const fetchUsers = async () => {
    const res = await API.get("/admin/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
      fetchDashboardStats();
  }, []);
  const openEditModal = (user) => {
    setEditUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: "", // keep empty for security
    });
    setShowEditModal(true);
  };
  /* Open Delete Modal */
  const openDeleteModal = (id) => {
    setSelectedUserId(id);
    setShowModal(true);
  };

  /* Confirm Delete */
  const confirmDelete = async () => {
    try {
      await API.delete(`/admin/users/${selectedUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUsers(users.filter((u) => u._id !== selectedUserId));
      setShowModal(false);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

    } catch {
      alert("Delete failed");
    }
  };
  const validateAddUser = () => {
    let errors = {};

    if (!newUser.name.trim()) {
      errors.name = "Name is required";
    }

    if (!newUser.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(newUser.email)) {
      errors.email = "Invalid email format";
    }

    if (!newUser.password.trim()) {
      errors.password = "Password is required";
    } else if (newUser.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };
  /* ===== ADD USER FUNCTION ===== */
  const handleAddUser = async () => {

    if (!validateAddUser()) return;

    try {
      await API.post("/admin/users", newUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchUsers();
      setShowAddModal(false);

      setNewUser({
        role: "librarian",
        name: "",
        email: "",
        password: "",
      });

      setAddErrors({}); // clear errors

      setToast("User added successfully");
      setTimeout(() => setToast(""), 3000);

    } catch (err) {
      alert(err.response?.data?.message || "Failed to add user");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* ===== FILTER USERS ===== */
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleEditUser = async () => {
    try {

      const updateData = {
        name: editUser.name,
        email: editUser.email,
      };

      // Only send password if user entered one
      if (editUser.password.trim() !== "") {
        updateData.password = editUser.password;
      }

      await API.put(
        `/admin/users/${editUser._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      fetchUsers();
      setShowEditModal(false);

      setShowEditToast(true);
      setTimeout(() => setShowEditToast(false), 3000);

    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Update failed");
    }
  };
  const resetAddForm = () => {
    setNewUser({
      role: "librarian",
      name: "",
      email: "",
      password: "",
    });
    setAddErrors({});
  };
  return (
    <div>
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-left"><h2>Library Management</h2></div>
        <div className="top-right">
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* CENTER CONTENT */}
      <div className="page-center">
        <h2 className="center-heading">Admin Dashboard</h2>
<div className="summary-cards">
  <div className="card oval">
    <h4>Total Users</h4>
    <p>{stats.totalUsers}</p>
  </div>

  <div className="card oval">
    <h4>Librarians</h4>
    <p>{stats.totalLibrarians}</p>
  </div>

  <div className="card oval">
    <h4>Total Books</h4>
    <p>{stats.totalBooks}</p>
  </div>

  <div className="card oval">
    <h4>Issued Books</h4>
    <p>{stats.issuedBooks}</p>
  </div>

  <div className="card oval overdue">
    <h4>Overdue Books</h4>
    <p>{stats.overdueBooks}</p>
  </div>
</div>
        <div className="dashboard-box admin-box">

          {/* HEADER INSIDE BOX */}
          <div className="admin-header">
            <h3>Users & Librarians</h3>

            <div className="admin-controls">
              <input
                type="text"
                placeholder="Search by name, email or role..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button
                className="btn-add"
                onClick={() => {
                  resetAddForm();
                  setShowAddModal(true);
                }}
              >
                + Add New
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    {u.role !== "admin" && (
                      <>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => openEditModal(u)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn-remove"
                            onClick={() => openDeleteModal(u._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

      {/* DELETE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Do you want to delete this user?</h3>

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Cancel
              </button>

              <button
                className="btn-delete"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add New User</h3>

            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
            >
              <option value="admin">Admin</option>
              <option value="librarian">Librarian</option>
            </select>

            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => {
                setNewUser({ ...newUser, name: e.target.value });
                setAddErrors({ ...addErrors, name: "" });
              }}
            />
            {addErrors.name && (
              <p className="error-text">{addErrors.name}</p>
            )}
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => {
                setNewUser({ ...newUser, email: e.target.value });
                setAddErrors({ ...addErrors, email: "" });
              }}
            />
            {addErrors.email && (
              <p className="error-text">{addErrors.email}</p>
            )}

            <div style={{ position: "relative" }}>
              <input
                type={showAddPassword ? "text" : "password"}
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => {
                  setNewUser({ ...newUser, password: e.target.value });
                  setAddErrors({ ...addErrors, password: "" });
                }}
              />

              <img
                src={showAddPassword ? eyeClose : eyeOpen}
                alt="toggle password"
                onClick={() => setShowAddPassword(!showAddPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer"
                }}
              />
            </div>
            {addErrors.password && (
              <p className="error-text">{addErrors.password}</p>
            )}
            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn-blue"
                onClick={handleAddUser}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit User</h3>

            <input
              type="text"
              placeholder="New Name"
              value={editUser.name}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="New Email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="New Password"
              value={editUser.password}
              onChange={(e) =>
                setEditUser({ ...editUser, password: e.target.value })
              }
            />

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn-blue"
                onClick={handleEditUser}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE TOAST */}
      {showToast && (
        <div className="toast">
          User deleted successfully
        </div>
      )}

      {/* ADD USER TOAST */}
      {toast && (
        <div className="toast-message">
          {toast}
        </div>
      )}
      {/* EDIT TOAST */}
      {showEditToast && (
        <div className="toast">
          User edited successfully
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;