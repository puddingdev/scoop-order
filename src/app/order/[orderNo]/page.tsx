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
            <div className={`w-3 h-3 rounded-full border-2 transition-all ${
              active ? 'bg-violet-600 border-violet-600 scale-110' :
              done   ? 'bg-violet-400 border-violet-400' :
                       'bg-violet-100 border-violet-300'
            }`} />
            {i < STATUS_STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${done ? 'bg-violet-400' : 'bg-violet-200'}`} />
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
      paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
    }`}>
      {paid ? 'ชำระแล้ว ✅' : 'ยังไม่ชำระ'}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-violet-200 rounded-2xl p-4">
      <h2 className="text-[.68rem] font-bold text-[#7C6F9F] uppercase tracking-widest mb-3">{title}</h2>
      {children}
    </div>
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
    <div className="min-h-screen bg-violet-50 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-violet-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-[#7C6F9F] hover:text-violet-700 text-xl leading-none">←</Link>
        <h1 className="font-bold text-violet-800 text-lg flex-1">ติดตามออเดอร์</h1>
        <button
          onClick={load}
          disabled={loading}
          className="text-violet-600 hover:text-violet-800 disabled:text-[#7C6F9F] text-sm font-semibold"
        >
          {loading ? '⏳' : '↻ รีเฟรช'}
        </button>
      </header>

      <div className="max-w-md mx-auto p-4 flex flex-col gap-4">

        {loading && !order && (
          <div className="text-center text-[#7C6F9F] py-16">กำลังโหลด...</div>
        )}

        {err && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-center text-sm">
            {err}
          </div>
        )}

        {order && (
          <>
            {/* Order No + Status */}
            <div className="bg-white border border-violet-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#7C6F9F] text-sm">ออเดอร์</span>
                <PaymentBadge status={order.payment_status} />
              </div>
              <div className="text-2xl font-black text-violet-800 mb-3">{order.order_no}</div>

              <div className={`text-lg font-bold mb-3 ${
                isCancelled ? 'text-red-500' : isDone ? 'text-green-600' : 'text-violet-700'
              }`}>
                {statusLabel}
              </div>

              {!isCancelled && <StatusTimeline status={order.order_status} />}

              {lastRefresh && (
                <p className="text-[#7C6F9F] text-xs mt-3">
                  อัปเดต {lastRefresh.toLocaleTimeString('th-TH')}
                </p>
              )}
            </div>

            {/* Items */}
            <Section title="รายการ">
              <div className="flex flex-col gap-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[#1E1B2E]">🍨 {item.label} ({item.size})</span>
                    <span className="text-[#7C6F9F]">{item.price}฿</span>
                  </div>
                ))}
                {order.toppings.length > 0 && order.toppings.map((t, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[#1E1B2E] pl-4">• {t.label}</span>
                    <span className="text-[#7C6F9F]">{t.price > 0 ? `+${t.price}฿` : 'ฟรี'}</span>
                  </div>
                ))}
                <div className="border-t border-violet-100 my-1.5" />
                <div className="flex justify-between text-sm text-[#7C6F9F]">
                  <span>ค่าส่ง</span>
                  <span>{order.delivery_fee}฿</span>
                </div>
                <div className="flex justify-between font-bold text-[#1E1B2E]">
                  <span>รวม</span>
                  <span className="text-violet-700">{order.total}฿</span>
                </div>
              </div>
            </Section>

            {/* Customer Info */}
            <Section title="ข้อมูลการจัดส่ง">
              <div className="flex flex-col gap-1.5 text-sm">
                {[
                  { label: 'ชื่อ',   val: order.customer_name },
                  { label: 'เบอร์',  val: order.phone,   hide: !order.phone },
                  { label: 'ที่อยู่', val: order.address },
                  { label: 'โน้ต',   val: order.note,    hide: !order.note },
                ].filter(r => !r.hide).map(r => (
                  <div key={r.label} className="flex gap-2">
                    <span className="text-[#7C6F9F] w-14 shrink-0">{r.label}</span>
                    <span className="text-[#1E1B2E]">{r.val}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Delivery photo */}
            {order.delivery_photo_url && (
              <Section title="รูปจัดส่ง">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order.delivery_photo_url} alt="delivery" className="rounded-xl w-full" />
              </Section>
            )}

            {/* Payment reminder */}
            {order.order_status === 'WAITING_PAYMENT' && (
              <div className="bg-violet-100 border border-violet-300 rounded-2xl p-4 text-center">
                <p className="text-violet-800 font-semibold">กรุณาโอนเงิน {order.total}฿</p>
                <p className="text-violet-600 text-sm mt-1">ร้านจะส่ง QR PromptPay ให้ทาง Messenger</p>
              </div>
            )}
          </>
        )}

        <Link href="/" className="block text-center text-[#7C6F9F] hover:text-violet-700 text-sm mt-2">
          ← กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
