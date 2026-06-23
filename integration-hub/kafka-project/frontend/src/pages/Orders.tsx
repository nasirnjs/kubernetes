import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { getToken } from "../api/auth";
import { Order } from "../api/types";
import { formatPrice } from "../utils/format";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login?next=/orders");
      return;
    }
    api
      .get<{ orders: Order[] } | Order[]>("/orders")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.orders;
        setOrders(data ?? []);
      })
      .catch((err) => {
        if (err.response?.status === 401) navigate("/login");
        else setError(err.response?.data?.error ?? "failed to load orders");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="error">{error}</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <div>
      <h2>Your orders</h2>
      {orders.map((o) => (
        <div key={o.id} className="card" style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Order #{o.id}</strong>
            <span className="muted">{new Date(o.created_at).toLocaleString()}</span>
          </div>
          <div>Status: {o.status}</div>
          <div>Total: {formatPrice(o.total_cents)}</div>
          {o.items && (
            <ul>
              {o.items.map((it, idx) => (
                <li key={idx}>
                  Product #{it.product_id} × {it.quantity}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
