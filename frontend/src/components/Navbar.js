import { Link } from "react-router-dom";

function Navbar() {
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="navbar">
      <div className="nav-links">
        {role === "admin" ? (
          <Link to="/admin">Dashboard</Link>
        ) : (
          <>
            <Link to="/home">Home</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}
      </div>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;