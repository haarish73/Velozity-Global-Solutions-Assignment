import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DEV"); // ✅ default role

  const { login } = useAuth();
  const navigate = useNavigate();

  // =========================
  // HANDLE AUTH
  // =========================
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      let res;

      if (isLogin) {
        // 🔐 LOGIN
        res = await API.post("/auth/login", { email, password });

        login(res.data);
        navigate("/dashboard");
      } else {
        // 🆕 REGISTER
        res = await API.post("/auth/register", {
          name,
          email,
          password,
          role, // ✅ send selected role
        });

        alert("Registered successfully. Now login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <header className="auth-header">
          <h2>{isLogin ? "Welcome Back" : "Create an Account"}</h2>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to access your dashboard"
              : "Register your account to get started"}
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* REGISTER ONLY FIELDS */}
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>

              {/* ✅ ROLE DROPDOWN */}
              <div className="form-group">
                <label htmlFor="role">Account Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="DEV">Developer</option>
                  <option value="PM">Project Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="toggle-link"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register" : "Sign In"}
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
}