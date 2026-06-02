'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getOrderByNo, OrderData } from '@/lib/api';
import { STATUS_LABEL, STATUS_STEPS } from '@/lib/config';

const ACTIVE_STATUSES = new Set(['WAITING_FOR_STORE', 'WAITING_PAYMENT', 'MAKING', 'READY_TO_DELIVER', 'DELIVERING']);

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {STATUS_STEPS.map((st, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={st} className="flex items-center gap-1 shrink-0">
            <div className={`w-3 h-3 rounded-full border-2 ${
              active ? 'bg-purple-500 border-purple-500' :
              done   ? 'bg-purple-800 border-purple-700' :
                       'bg-zinc-800 border-zinc-700'
            }`} />
            {i < STATUS_STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${done ? 'bg-purple-700' : 'bg-zinc-800'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const paid = status === 'PAID';
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
      paid ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
    }`}>
      {paid ? 'ชำระแล้ว ✅' : 'ยังไม่ชำระ'}
    </span>
  );
}

export default function TrackingPage({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = use(params);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await getOrderByNo(orderNo);
      if (res.order) {
        setOrder(res.order);
      } else {
        setErr('ไม่พบออเดอร์ ' + orderNo);
      }
    } catch {
      setErr('เชื่อมต่อไม่ได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [orderNo]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s while order is active
  useEffect(() => {
    if (!order) return;
    if (!ACTIVE_STATUSES.has(order.order_status)) return;
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [order, load]);

  const statusLabel = order ? (STATUS_LABEL[order.order_status] ?? order.order_status) : '';
  const isCancelled = order?.order_status === 'CANCELLED';
  const isDone = order?.order_status === 'DELIVERED';

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-white text-xl">←</Link>
        <h1 className="font-bold text-white text-lg flex-1">ติดตามออเดอร์</h1>
        <button
          onClick={load}
          disabled={loading}
          className="text-purple-400 hover:text-purple-300 disabled:text-zinc-600 text-sm font-medium"
        >
          {loading ? '⏳' : '↻ รีเฟรช'}
        </button>
      </header>

      <div className="max-w-md mx-auto p-4 flex flex-col gap-4">

        {loading && !order && (
          <div className="text-center text-zinc-500 py-16">กำลังโหลด...</div>
        )}

        {err && (
          <div className="bg-red-950 border border-red-800 rounded-2xl p-4 text-red-300 text-center">
            {err}
          </div>
        )}

        {order && (
          <>
            {/* Order No + Status */}
            <div className="bg-zinc-900 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-400 text-sm">ออเดอร์</span>
                <PaymentBadge status={order.payment_status} />
              </div>
              <div className="text-2xl font-black text-white mb-3">{order.order_no}</div>

              <div className={`text-lg font-bold mb-3 ${
                isCancelled ? 'text-red-400' : isDone ? 'text-green-400' : 'text-purple-300'
              }`}>
                {statusLabel}
              </div>

              {!isCancelled && (
                <StatusTimeline status={order.order_status} />
              )}

              {lastRefresh && (
                <p className="text-zinc-600 text-xs mt-3">
                  อัปเดต {lastRefresh.toLocaleTimeString('th-TH')}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="bg-zinc-900 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">รายการ</h2>
              <div className="flex flex-col gap-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-300">🍨 {item.label} ({item.size})</span>
                    <span className="text-zinc-400">{item.price}฿</span>
                  </div>
                ))}
                {order.toppings.length > 0 && order.toppings.map((t, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-300">  • {t.label}</span>
                    <span className="text-zinc-400">{t.price > 0 ? `+${t.price}฿` : 'ฟรี'}</span>
                  </div>
                ))}
                <div className="border-t border-zinc-800 my-1" />
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>ค่าส่ง</span>
                  <span>{order.delivery_fee}฿</span>
                </div>
                <div className="flex justify-between font-bold text-white">
                  <span>รวม</span>
                  <span>{order.total}฿</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-zinc-900 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">ข้อมูลการจัดส่ง</h2>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex gap-2">
                  <span className="text-zinc-500 w-14 shrink-0">ชื่อ</span>
                  <span className="text-zinc-200">{order.customer_name}</span>
                </div>
                {order.phone && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 w-14 shrink-0">เบอร์</span>
                    <span className="text-zinc-200">{order.phone}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-zinc-500 w-14 shrink-0">ที่อยู่</span>
                  <span className="text-zinc-200">{order.address}</span>
                </div>
                {order.note && (
                  <div className="flex gap-2">
                    <span className="text-zinc-500 w-14 shrink-0">โน้ต</span>
                    <span className="text-zinc-200">{order.note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery photo */}
            {order.delivery_photo_url && (
              <div className="bg-zinc-900 rounded-2xl p-4">
                <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">รูปจัดส่ง</h2>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order.delivery_photo_url} alt="delivery" className="rounded-xl w-full" />
              </div>
            )}

            {/* Note for payment */}
            {order.order_status === 'WAITING_PAYMENT' && (
              <div className="bg-purple-950 border border-purple-800 rounded-2xl p-4 text-center">
                <p className="text-purple-200 font-medium">กรุณาโอนเงิน {order.total}฿</p>
                <p className="text-purple-400 text-sm mt-1">ร้านจะส่ง QR PromptPay ให้ทาง Messenger</p>
              </div>
            )}
          </>
        )}

        <Link href="/" className="block text-center text-zinc-600 hover:text-zinc-400 text-sm mt-2">
          ← กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
