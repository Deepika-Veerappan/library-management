import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import eyeOpen from "../assets/eye-open.png";
import eyeClose from "../assets/eye-close.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Error State
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // ✅ Validation Function
  const validateLogin = () => {
    let newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Please enter your email";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Please enter password";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
        role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "librarian") navigate("/librarian");
      else navigate("/user");

    } catch (err) {
      // Backend error handling
      if (err.response?.data?.message === "Invalid email") {
        setErrors((prev) => ({ ...prev, email: "Invalid email" }));
      } else if (err.response?.data?.message === "Invalid password") {
        setErrors((prev) => ({ ...prev, password: "Invalid password" }));
      } else {
        setErrors({
          email: "Invalid email",
          password: "Invalid password",
        });
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-content">
        <h1 className="app-title">Library Management</h1>

        <div className="auth-box">
          <h2>Login</h2>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
          </select>

          {/* EMAIL FIELD */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: "" });
            }}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && (
            <p className="error-text">{errors.email}</p>
          )}

          {/* PASSWORD FIELD */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: "" });
              }}
              className={errors.password ? "input-error" : ""}
              style={{ paddingRight: "45px" }}
            />

            <img
              src={showPassword ? eyeClose : eyeOpen}
              alt="toggle password"
              onClick={() => setShowPassword(!showPassword)}
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

          {errors.password && (
            <p className="error-text">{errors.password}</p>
          )}

          <button className="btn-blue" onClick={handleLogin}>
            Login
          </button>

          <p style={{ marginTop: "15px" }}>
            New user?{" "}
            <Link to="/register" style={{ color: "#38bdf8" }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;