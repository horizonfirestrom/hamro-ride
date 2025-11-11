import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await apiLogin(email, password);
      login(res.accessToken, res.user);

      if (res.user.role === "PASSENGER") nav("/passenger");
      else if (res.user.role === "DRIVER") nav("/driver");
      else nav("/admin");
    } catch {
      setError("Invalid email or password");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Hamro Ride – Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <div>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
