import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function Profile() {
  const [user, setUser] = useState({});

  useEffect(() => {
    API.get("/users/profile").then((res) => {
      setUser(res.data);
    });
  }, []);

  return (
    <>
      <Navbar />
      <h2 style={{ textAlign: "center" }}>Profile</h2>

      <div style={{ textAlign: "center" }}>
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Role:</b> {user.role}</p>
      </div>
    </>
  );
}

export default Profile;