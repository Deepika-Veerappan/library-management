import { Link } from "react-router-dom";

function Navbar() {

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const role = localStorage.getItem("role");

  return (
    <nav style={{ padding: "15px", background: "#ddd", display: "flex", gap: "20px" }}>
      {role === "admin" ? (
        <Link to="/admin">Dashboard</Link>
      ) : (
        <>
          <Link to="/home">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/profile">Profile</Link>
        </>
      )}

      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default Navbar;