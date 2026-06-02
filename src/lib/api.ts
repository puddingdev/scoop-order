import { GAS_URL } from './config';

export async function createOrder(payload: object) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'createOrder', payload }),
  });
  return res.json() as Promise<{ success: boolean; order_no?: string; error?: string }>;
}

export async function getOrderByNo(order_no: string) {
  const res = await fetch(`${GAS_URL}?action=getOrderByNo&order_no=${order_no}`, {
    cache: 'no-store',
  });
  return res.json() as Promise<{ order: OrderData | null }>;
}

export interface OrderData {
  order_no:           string;
  customer_name:      string;
  phone:              string;
  address:            string;
  note:               string;
  source:             string;
  items:              { label: string; size: string; price: number }[];
  toppings:           { label: string; price: number }[];
  subtotal:           number;
  delivery_fee:       number;
  total:              number;
  payment_status:     string;
  order_status:       string;
  delivery_photo_url: string;
  created_at:         string;
}
