import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // ✅ Error state
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
    });

    // ✅ Validation function
    const validateRegister = () => {
        let newErrors = {
            name: "",
            email: "",
            password: "",
        };

        let isValid = true;

        if (!name) {
            newErrors.name = "Please enter your name";
            isValid = false;
        }

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

    const handleRegister = async () => {
        if (!validateRegister()) return;

        try {
            await API.post("/auth/register", {
                name,
                email,
                password,
                role: "user",
            });

            alert("Registered Successfully");
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.message || "Registration Failed");
        }
    };

    return (
        <div className="auth-wrapper">
            <div>
                <h1 className="center-heading">Library Management</h1>

                <div className="auth-box">
                    <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                        Register as User
                    </h2>

                    {/* NAME */}
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setErrors({ ...errors, name: "" });
                        }}
                        className={errors.name ? "input-error" : ""}
                    />
                    {errors.name && (
                        <p className="error-text">{errors.name}</p>
                    )}

                    {/* EMAIL */}
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

                    {/* PASSWORD */}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors({ ...errors, password: "" });
                        }}
                        className={errors.password ? "input-error" : ""}
                    />
                    {errors.password && (
                        <p className="error-text">{errors.password}</p>
                    )}

                    <button className="btn-blue" onClick={handleRegister}>
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;