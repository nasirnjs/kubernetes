export type Product = {
  id: number;
  sku: string;
  name: string;
  description: string;
  price_cents: number;
  stock: number;
};

export type OrderItem = {
  product_id: number;
  quantity: number;
  unit_price_cents?: number;
};

export type Order = {
  id: number;
  user_id: number;
  status: string;
  total_cents: number;
  items: OrderItem[];
  created_at: string;
};

export type Payment = {
  id: number;
  order_id: number;
  amount_cents: number;
  status: string;
  created_at: string;
};
