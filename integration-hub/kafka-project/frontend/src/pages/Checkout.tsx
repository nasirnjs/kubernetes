import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { getToken } from "../api/auth";
import { cartTotalCents, clearCart, getCart } from "../api/cart";
import { Order, Payment } from "../api/types";
import { formatPrice } from "../utils/format";

type Step = "review" | "processing" | "done";

export default function Checkout() {
  const navigate = useNavigate();
  const [items] = useState(getCart());
  const [step, setStep] = useState<Step>("review");
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login?next=/checkout");
    }
  }, [navigate]);

  const total = cartTotalCents(items);

  const onPlaceOrder = async () => {
    if (items.length === 0) return;
    setError(null);
    setStep("processing");
    try {
      const orderRes = await api.post<Order>("/orders", {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      setOrder(orderRes.data);

      const payRes = await api.post<Payment>("/payments", {
        order_id: orderRes.data.id,
        amount_cents: orderRes.data.total_cents ?? total,
      });
      setPayment(payRes.data);

      clearCart();
      setStep("done");
    } catch (err: any) {
      setError(err.response?.data?.error ?? "checkout failed");
      setStep("review");
    }
  };

  if (items.length === 0 && step !== "done") {
    return (
      <div className="card">
        <h2>Cart is empty</h2>
        <Link to="/">Browse products</Link>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="card">
        <h2>Order confirmed</h2>
        <p>
          <strong>Order #{order?.id}</strong> — {formatPrice(order?.total_cents ?? 0)}
        </p>
        <p>Payment status: {payment?.status}</p>
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Link to="/orders">View orders</Link>
          <Link to="/">Keep shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Checkout</h2>
      <ul>
        {items.map((i) => (
          <li key={i.product_id}>
            {i.name} × {i.quantity} — {formatPrice(i.price_cents * i.quantity)}
          </li>
        ))}
      </ul>
      <p>
        <strong>Total: {formatPrice(total)}</strong>
      </p>
      {error && <p className="error">{error}</p>}
      <button onClick={onPlaceOrder} disabled={step === "processing"}>
        {step === "processing" ? "Processing..." : "Place order & pay"}
      </button>
    </div>
  );
}
