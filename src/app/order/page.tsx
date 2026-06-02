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
    <section className="bg-white border border-violet-200 rounded-2xl p-4">
      <h2 className="text-[.68rem] font-bold text-[#7C6F9F] uppercase tracking-widest mb-3">{title}</h2>
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

  const chipClass = (active: boolean) =>
    `rounded-xl border-2 p-3 flex items-center gap-2 transition-all cursor-pointer select-none font-medium text-sm ${
      active
        ? 'border-violet-600 bg-violet-100 text-violet-800'
        : 'border-violet-200 bg-white text-[#1E1B2E]'
    }`;

  return (
    <div className="min-h-screen bg-violet-50 pb-52">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-violet-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-[#7C6F9F] hover:text-violet-700 text-xl leading-none">←</Link>
        <h1 className="font-bold text-violet-800 text-lg">สั่งไอศกรีม</h1>
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
                    ? 'border-violet-600 bg-violet-100'
                    : 'border-violet-200 bg-white'
                }`}
              >
                <div className="text-2xl font-black text-violet-800">{sz.label}</div>
                <div className="text-violet-600 font-bold text-lg">{sz.price}฿</div>
                <div className="text-[#7C6F9F] text-xs mt-1">{sz.scoops} Scoops</div>
                <div className="text-[#7C6F9F] text-xs">
                  {sz.maxFlavor === 1 ? '1 รส' : `สูงสุด ${sz.maxFlavor} รส`}
                </div>
                {sz.freeTops > 0 && (
                  <div className="text-green-600 text-xs font-semibold mt-0.5">ฟรีท็อปปิ้ง 1 อย่าง</div>
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Flavor */}
        <Section title={`รสชาติ${sz ? ` (เลือกได้ ${sz.maxFlavor} รส)` : ''}`}>
          {!s.sizeId ? (
            <p className="text-[#7C6F9F] text-sm">เลือกขนาดก่อน</p>
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
                    className={`${chipClass(active)} ${disabled ? 'opacity-40' : ''}`}
                  >
                    <span className="text-xl">{f.emoji}</span>
                    <span>{f.label}</span>
                    {active && <span className="ml-auto text-violet-600 font-bold">✓</span>}
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
              const posInTops = s.toppings.indexOf(t.id);
              const isFree = active && sz && posInTops < sz.freeTops;
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTopping(t.id)}
                  className={chipClass(active)}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span>{t.label}</span>
                  {active && isFree && (
                    <span className="ml-auto text-green-600 text-xs font-bold">ฟรี</span>
                  )}
                  {active && !isFree && (
                    <span className="ml-auto text-violet-600 text-xs font-semibold">+5฿</span>
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
                    ? 'border-violet-600 bg-violet-100'
                    : 'border-violet-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-violet-700">{z.label}</span>
                  {s.zoneIdx === i && <span className="text-violet-600 ml-auto font-bold">✓</span>}
                </div>
                <div className="text-[#7C6F9F] text-xs mt-1">{z.areas}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Customer Info */}
        <Section title="ข้อมูลลูกค้า">
          <div className="flex flex-col gap-3">
            {[
              { key: 'name',    label: 'ชื่อ',         required: true,  type: 'text', ph: 'ชื่อลูกค้า' },
              { key: 'phone',   label: 'เบอร์โทร',     required: false, type: 'tel',  ph: '08xxxxxxxx' },
              { key: 'address', label: 'ที่อยู่จัดส่ง', required: true,  type: 'text', ph: 'บ้านเลขที่ / ซอย / ตึก' },
              { key: 'note',    label: 'โน้ต',          required: false, type: 'text', ph: 'หมายเหตุเพิ่มเติม' },
            ].map(field => (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-[.72rem] font-semibold text-[#7C6F9F] mb-1">
                  {field.label}
                  {field.required !== undefined && (
                    <span className={`text-[.65rem] font-medium px-1.5 py-0.5 rounded-full ${field.required ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'}`}>
                      {field.required ? 'จำเป็น' : 'ไม่จำเป็น'}
                    </span>
                  )}
                </label>
                <input
                  type={field.type}
                  value={s[field.key as keyof State] as string}
                  onChange={e => setS(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.ph}
                  className="w-full border-2 border-violet-200 rounded-xl px-4 py-2.5 text-sm text-[#1E1B2E] placeholder-[#7C6F9F] bg-violet-50 focus:outline-none focus:border-violet-600 focus:bg-white transition-colors"
                />
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* Sticky Bottom Summary + Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-violet-200 p-4 shadow-[0_-4px_20px_rgba(109,40,217,0.08)]">
        <div className="max-w-md mx-auto">
          {sz && (
            <div className="flex justify-between text-sm text-[#7C6F9F] mb-1">
              <span>
                ไอศกรีม {sz.label}
                {s.flavors.length > 0 && ` (${s.flavors.map(fid => FLAVORS.find(f => f.id === fid)?.label).join(', ')})`}
              </span>
              <span>{sz.price}฿</span>
            </div>
          )}
          {extraTops > 0 && (
            <div className="flex justify-between text-sm text-[#7C6F9F] mb-1">
              <span>ท็อปปิ้งเพิ่ม ×{extraTops}</span>
              <span>+{extraTops * 5}฿</span>
            </div>
          )}
          {s.zoneIdx !== null && (
            <div className="flex justify-between text-sm text-[#7C6F9F] mb-2">
              <span>ค่าส่ง</span>
              <span>{deliveryFee}฿</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-[#1E1B2E] text-lg mb-3">
            <span>รวม</span>
            <span className="text-violet-700">{total}฿</span>
          </div>
          {err && <p className="text-red-600 text-sm mb-2 text-center">{err}</p>}
          <button
            onClick={submit}
            disabled={!canOrder || loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-200 disabled:text-[#7C6F9F] text-white font-bold text-lg py-3.5 rounded-2xl transition-colors shadow-sm"
          >
            {loading ? '⏳ กำลังส่ง...' : canOrder ? '✓ สั่งเลย!' : '⚠️ กรอกข้อมูลให้ครบ'}
          </button>
        </div>
      </div>
    </div>
  );
}
