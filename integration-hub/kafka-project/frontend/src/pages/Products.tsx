import { useEffect, useState } from "react";
import api from "../api/client";
import { addToCart } from "../api/cart";
import { Product } from "../api/types";
import { formatPrice } from "../utils/format";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<{ items?: Product[]; products?: Product[] } | Product[]>("/products")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items ?? res.data.products;
        setProducts(data ?? []);
      })
      .catch((err) => setError(err.response?.data?.error ?? "failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const onAdd = (p: Product) => {
    addToCart({
      product_id: p.id,
      sku: p.sku,
      name: p.name,
      price_cents: p.price_cents,
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1200);
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error">{error}</p>;
  if (products.length === 0) return <p>No products available.</p>;

  return (
    <div>
      <h2>Products</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <h3>{p.name}</h3>
            <p className="muted">{p.sku}</p>
            <p>{p.description}</p>
            <p className="price">{formatPrice(p.price_cents)}</p>
            <p className="muted">Stock: {p.stock}</p>
            <button onClick={() => onAdd(p)} disabled={p.stock <= 0}>
              {added === p.id ? "Added!" : p.stock <= 0 ? "Out of stock" : "Add to cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
