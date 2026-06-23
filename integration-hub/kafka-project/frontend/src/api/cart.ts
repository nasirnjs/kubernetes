const CART_KEY = "ecom_cart";

export type CartItem = {
  product_id: number;
  sku: string;
  name: string;
  price_cents: number;
  quantity: number;
};

export function getCart(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1): void {
  const cart = getCart();
  const existing = cart.find((c) => c.product_id === item.product_id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  saveCart(cart);
}

export function updateQuantity(productId: number, qty: number): void {
  const cart = getCart();
  const item = cart.find((c) => c.product_id === productId);
  if (!item) return;
  if (qty <= 0) {
    saveCart(cart.filter((c) => c.product_id !== productId));
  } else {
    item.quantity = qty;
    saveCart(cart);
  }
}

export function removeFromCart(productId: number): void {
  saveCart(getCart().filter((c) => c.product_id !== productId));
}

export function clearCart(): void {
  saveCart([]);
}

export function cartTotalCents(items: CartItem[] = getCart()): number {
  return items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
}

export function cartItemCount(items: CartItem[] = getCart()): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
