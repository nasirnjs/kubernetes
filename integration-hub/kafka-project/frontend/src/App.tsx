import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { getToken, clearToken } from "./api/auth";
import { cartItemCount } from "./api/cart";

export default function App() {
  const navigate = useNavigate();
  const [token, setTokenState] = useState<string | null>(getToken());
  const [count, setCount] = useState<number>(cartItemCount());

  useEffect(() => {
    const refresh = () => {
      setTokenState(getToken());
      setCount(cartItemCount());
    };
    window.addEventListener("cart-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cart-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const logout = () => {
    clearToken();
    setTokenState(null);
    navigate("/login");
  };

  return (
    <div className="container">
      <nav className="nav">
        <h1>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            E-commerce
          </Link>
        </h1>
        <div className="nav-links">
          <Link to="/">Products</Link>
          <Link to="/cart">Cart{count > 0 ? ` (${count})` : ""}</Link>
          {token ? (
            <>
              <Link to="/orders">Orders</Link>
              <Link to="/profile">Profile</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
