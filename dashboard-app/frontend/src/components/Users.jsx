import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/DIA.png";
import "./Users.css";
const UsersPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    university: "",
    company: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin
        // ? "http://localhost:5000/api/users/login"
        // : "http://localhost:5000/api/users/register";
        ? "/api/users/login"
        : "/api/users/register";
      const response = await axios.post(endpoint, formData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
      if (isLogin) navigate("/home");
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      name: "",
      university: "",
      company: "",
      address: "",
      phone: "",
    });
    setError("");
    if (isLogin) navigate("/");
  };

  return (
    <div className="container">
      <div className="image-section">
        <img src={logo} alt="Login illustration" />
      </div>

      <div className="form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>
              {isLogin ? "Welcome to DIA ICT FEST 2k25!" : "Create Account"}
            </h2>
            <p>
              {isLogin
                ? "Please sign in to your account"
                : "Sign up to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-fields">
              {!isLogin && (
                <>
                  <div className="input-group">
                    <span className="input-icon">👤</span>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="input-group">
                    <span className="input-icon">🎓</span>
                    <input
                      name="university"
                      type="text"
                      value={formData.university}
                      onChange={handleInputChange}
                      placeholder="University Name"
                    />
                  </div>

                  <div className="input-group">
                    <span className="input-icon">🏢</span>
                    <input
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Company Name"
                    />
                  </div>

                  <div className="input-group">
                    <span className="input-icon">📍</span>
                    <input
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Address"
                    />
                  </div>

                  <div className="form-row">
                    <div className="input-group half">
                      <span className="input-icon">📱</span>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="input-group">
                <span className="input-icon">✉️</span>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                />
              </div>

              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {isLogin && (
              <div className="forgot-password">
                <button type="button">Forgot password?</button>
              </div>
            )}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign in" : "Sign up"}
              {!loading && <span className="arrow">→</span>}
            </button>
          </form>

          <div className="toggle-form">
            <button type="button" onClick={toggleForm}>
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
