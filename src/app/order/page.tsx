'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SIZES, FLAVORS, TOPPINGS, ZONES } from '@/lib/config';
import { createOrder } from '@/lib/api';

interface State {
  sizeId: string;
  flavors: string[];
  toppings: string[];
  zoneIdx: number | null;
  name: string;
  phone: string;
  address: string;
  note: string;
}

const INIT: State = {
  sizeId: '', flavors: [], toppings: [], zoneIdx: null,
  name: '', phone: '', address: '', note: '',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-zinc-900 rounded-2xl p-4">
      <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function OrderPage() {
  const [s, setS] = useState<State>(INIT);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  const sz = SIZES.find(x => x.id === s.sizeId);
  const extraTops = Math.max(0, s.toppings.length - (sz?.freeTops ?? 0));
  const subtotal = (sz?.price ?? 0) + extraTops * 5;
  const deliveryFee = s.zoneIdx !== null ? ZONES[s.zoneIdx].fee : 0;
  const total = subtotal + deliveryFee;
  const canOrder = sz && s.flavors.length > 0 && s.zoneIdx !== null && s.name.trim() && s.address.trim();

  function toggleFlavor(id: string) {
    setS(prev => {
      const has = prev.flavors.includes(id);
      if (has) return { ...prev, flavors: prev.flavors.filter(f => f !== id) };
      if ((sz?.maxFlavor ?? 1) <= prev.flavors.length) return prev;
      return { ...prev, flavors: [...prev.flavors, id] };
    });
  }

  function toggleTopping(id: string) {
    setS(prev => {
      const has = prev.toppings.includes(id);
      return { ...prev, toppings: has ? prev.toppings.filter(t => t !== id) : [...prev.toppings, id] };
    });
  }

  function setSize(id: string) {
    const newSz = SIZES.find(x => x.id === id)!;
    setS(prev => ({
      ...prev,
      sizeId: id,
      flavors: prev.flavors.slice(0, newSz.maxFlavor),
    }));
  }

  async function submit() {
    if (!canOrder) return;
    setErr('');
    setLoading(true);
    try {
      const items = s.flavors.map(fid => {
        const f = FLAVORS.find(x => x.id === fid)!;
        return { label: f.label, size: s.sizeId, price: sz!.price };
      });
      const toppingItems = s.toppings.map((tid, i) => {
        const t = TOPPINGS.find(x => x.id === tid)!;
        return { label: t.label, price: (sz!.freeTops > i) ? 0 : 5 };
      });
      const payload = {
        customer_name: s.name.trim(),
        phone: s.phone.trim(),
        address: s.address.trim(),
        note: s.note.trim(),
        source: 'WEBSITE',
        items,
        toppings: toppingItems,
        subtotal,
        delivery_fee: deliveryFee,
        total,
      };
      const res = await createOrder(payload);
      if (res.success && res.order_no) {
        router.push(`/order/${res.order_no}`);
      } else {
        setErr(res.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } catch (e) {
      setErr('เชื่อมต่อไม่ได้ กรุณาลองใหม่');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const chip = (active: boolean) =>
    `rounded-xl border-2 p-3 flex items-center gap-2 transition-all cursor-pointer select-none ${
      active ? 'border-purple-500 bg-purple-950 text-white' : 'border-zinc-700 bg-zinc-800 text-zinc-300'
    }`;

  return (
    <div className="min-h-screen bg-zinc-950 pb-48">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-white text-xl">←</Link>
        <h1 className="font-bold text-white text-lg">สั่งไอศกรีม</h1>
      </header>

      <div className="max-w-md mx-auto p-4 flex flex-col gap-4">

        {/* Size */}
        <Section title="ขนาด">
          <div className="grid grid-cols-2 gap-3">
            {SIZES.map(sz => (
              <button
                key={sz.id}
                onClick={() => setSize(sz.id)}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${
                  s.sizeId === sz.id
                    ? 'border-purple-500 bg-purple-950'
                    : 'border-zinc-700 bg-zinc-800'
                }`}
              >
                <div className="text-2xl font-black text-white">{sz.label}</div>
                <div className="text-purple-300 font-bold text-lg">{sz.price}฿</div>
                <div className="text-zinc-400 text-xs mt-1">{sz.scoops} Scoops</div>
                <div className="text-zinc-400 text-xs">
                  {sz.maxFlavor === 1 ? '1 รส' : `สูงสุด ${sz.maxFlavor} รส`}
                </div>
                {sz.freeTops > 0 && (
                  <div className="text-green-400 text-xs">ฟรีท็อปปิ้ง 1 อย่าง</div>
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Flavor */}
        <Section title={`รสชาติ${sz ? ` (เลือกได้ ${sz.maxFlavor} รส)` : ''}`}>
          {!s.sizeId ? (
            <p className="text-zinc-500 text-sm">เลือกขนาดก่อน</p>
          ) : (
            <div className="flex flex-col gap-2">
              {FLAVORS.map(f => {
                const active = s.flavors.includes(f.id);
                const disabled = !active && s.flavors.length >= (sz?.maxFlavor ?? 1);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFlavor(f.id)}
                    disabled={disabled}
                    className={`${chip(active)} ${disabled ? 'opacity-40' : ''}`}
                  >
                    <span className="text-xl">{f.emoji}</span>
                    <span className="font-medium">{f.label}</span>
                    {active && <span className="ml-auto text-purple-400">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        {/* Toppings */}
        <Section title={`ท็อปปิ้ง (+5฿${sz?.freeTops ? ` • L ได้ฟรี 1` : ''})`}>
          <div className="flex flex-col gap-2">
            {TOPPINGS.map((t, i) => {
              const active = s.toppings.includes(t.id);
              const freeSlot = sz && sz.freeTops > 0 && i < sz.freeTops && active;
              const posInTops = s.toppings.indexOf(t.id);
              const isFree = active && sz && posInTops < sz.freeTops;
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTopping(t.id)}
                  className={chip(active)}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="font-medium">{t.label}</span>
                  {active && isFree && (
                    <span className="ml-auto text-green-400 text-xs font-bold">ฟรี</span>
                  )}
                  {active && !isFree && (
                    <span className="ml-auto text-purple-400 text-xs">+5฿</span>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Delivery Zone */}
        <Section title="โซนจัดส่ง">
          <div className="flex flex-col gap-2">
            {ZONES.map((z, i) => (
              <button
                key={i}
                onClick={() => setS(prev => ({ ...prev, zoneIdx: i }))}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  s.zoneIdx === i
                    ? 'border-purple-500 bg-purple-950'
                    : 'border-zinc-700 bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-300">{z.label}</span>
                  {s.zoneIdx === i && <span className="text-purple-400 ml-auto">✓</span>}
                </div>
                <div className="text-zinc-400 text-xs mt-1">{z.areas}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Customer Info */}
        <Section title="ข้อมูลลูกค้า">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">ชื่อ *</label>
              <input
                type="text"
                value={s.name}
                onChange={e => setS(p => ({ ...p, name: e.target.value }))}
                placeholder="ชื่อลูกค้า"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">เบอร์โทร</label>
              <input
                type="tel"
                value={s.phone}
                onChange={e => setS(p => ({ ...p, phone: e.target.value }))}
                placeholder="08xxxxxxxx"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">ที่อยู่จัดส่ง *</label>
              <input
                type="text"
                value={s.address}
                onChange={e => setS(p => ({ ...p, address: e.target.value }))}
                placeholder="บ้านเลขที่ / ซอย / ตึก"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">โน้ต</label>
              <input
                type="text"
                value={s.note}
                onChange={e => setS(p => ({ ...p, note: e.target.value }))}
                placeholder="หมายเหตุเพิ่มเติม"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </Section>

      </div>

      {/* Sticky Bottom Summary + Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 p-4">
        <div className="max-w-md mx-auto">
          {sz && (
            <div className="flex justify-between text-sm text-zinc-400 mb-1">
              <span>ไอศกรีม {sz.label} {s.flavors.length > 0 && `(${s.flavors.map(fid => FLAVORS.find(f=>f.id===fid)?.label).join(', ')})`}</span>
              <span>{sz.price}฿</span>
            </div>
          )}
          {extraTops > 0 && (
            <div className="flex justify-between text-sm text-zinc-400 mb-1">
              <span>ท็อปปิ้งเพิ่ม ×{extraTops}</span>
              <span>+{extraTops * 5}฿</span>
            </div>
          )}
          {s.zoneIdx !== null && (
            <div className="flex justify-between text-sm text-zinc-400 mb-2">
              <span>ค่าส่ง</span>
              <span>{deliveryFee}฿</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-white text-lg mb-3">
            <span>รวม</span>
            <span>{total}฿</span>
          </div>
          {err && <p className="text-red-400 text-sm mb-2 text-center">{err}</p>}
          <button
            onClick={submit}
            disabled={!canOrder || loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold text-lg py-4 rounded-2xl transition-colors"
          >
            {loading ? '⏳ กำลังส่ง...' : canOrder ? '✓ สั่งเลย!' : '⚠️ กรอกข้อมูลให้ครบ'}
          </button>
        </div>
      </div>
    </div>
  );
}
