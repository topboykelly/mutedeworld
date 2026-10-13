export type OrderItem = {
  product_id: string;
  slug: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  price: number;
};

export type OrderRow = {
  id: string;
  reference: string;
  status: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  region: string;
  city: string;
  address: string;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  admin_note: string;
  created_at: string;
};

export function itemCount(order: Pick<OrderRow, "items">) {
  return order.items.reduce((sum, i) => sum + i.qty, 0);
}
