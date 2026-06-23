import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CartItem,
  cartTotalCents,
  getCart,
  removeFromCart,
  updateQuantity,
} from "../api/cart";
import { formatPrice } from "../utils/format";

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>(getCart());
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = () => setItems(getCart());
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  const onQty = (productId: number, qty: number) => {
    updateQuantity(productId, qty);
    setItems(getCart());
  };

  const onRemove = (productId: number) => {
    removeFromCart(productId);
    setItems(getCart());
  };

  if (items.length === 0) {
    return (
      <div className="card">
        <h2>Your cart is empty</h2>
        <Link to="/">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Cart</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.product_id}>
              <td>
                <div>{i.name}</div>
                <div className="muted">{i.sku}</div>
              </td>
              <td>{formatPrice(i.price_cents)}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={(e) => onQty(i.product_id, parseInt(e.target.value, 10) || 0)}
                  style={{ width: 64 }}
                />
              </td>
              <td>{formatPrice(i.price_cents * i.quantity)}</td>
              <td>
                <button className="link-btn" onClick={() => onRemove(i.product_id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: "right" }}>
              <strong>Total</strong>
            </td>
            <td colSpan={2}>
              <strong>{formatPrice(cartTotalCents(items))}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link to="/">Continue shopping</Link>
        <button onClick={() => navigate("/checkout")}>Checkout</button>
      </div>
    </div>
  );
}
