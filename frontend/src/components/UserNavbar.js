import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import "./Navbar.css";

function UserNavbar() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showBox, setShowBox] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* FETCH NOTIFICATIONS */
  const fetchNotifications = async () => {

    try {

      const res = await axios.get(
        "http://library-backend-faa2.onrender.com/api/users/notifications",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setNotifications(res.data);

    } catch (err) {
      console.log(err);
    }

  };

  /* AUTO REFRESH NOTIFICATIONS */
  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  /* BELL CLICK - ONLY OPEN BOX */
  const handleBellClick = () => {
    setShowBox(!showBox);
  };

  /* MARK SINGLE NOTIFICATION AS READ */
  const markSingleAsRead = async (id) => {

    try {

      await axios.put(
        `http://library-backend-faa2.onrender.com/api/users/notifications/${id}/read`,
        {},
        {
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );

    } catch(err){
      console.log(err);
    }

  };

  return (

    <div className="top-header">

      <h2 className="logo">
        Library Management
      </h2>

      <div className="nav-right">

        {/* NOTIFICATION BELL */}
        <div
          className="notification-wrapper"
          onClick={handleBellClick}
        >

          <FaBell className="bell-icon"/>

          {/* BELL RED DOT */}
          {notifications.some(n => !n.isRead) && (
            <span className="notification-dot"></span>
          )}

          {/* NOTIFICATION DROPDOWN */}
          {showBox && (

            <div className="notification-box">

              {notifications.length === 0 ? (

                <p className="no-notification">
                  No new notifications
                </p>

              ) : (

                notifications.map((n, i) => (

                  <div
                    key={i}
                    className="notification-item"
                    onMouseEnter={() => markSingleAsRead(n._id)}
                  >

                    {/* RED DOT BESIDE MESSAGE */}
                    {!n.isRead && (
                      <span className="msg-dot"></span>
                    )}

                    {n.message}

                  </div>

                ))

              )}

            </div>

          )}

        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>

      </div>

    </div>

  );

}

export default UserNavbar;