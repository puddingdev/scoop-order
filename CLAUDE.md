# CLAUDE.md — scoop-order

## โปรเจกต์คืออะไร
Customer Ordering Website สำหรับ **Scoop by Loki** ร้านไอศกรีม Delivery
เป็นส่วนหนึ่งของ Scoop by Loki Ecosystem V1 (ดู `docs/PRD.md`)

## Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Deploy**: Vercel (static + SSR)
- **Backend**: Google Apps Script (GAS) Web App — ดู `docs/API.md`
- **Database**: Google Sheets (ผ่าน GAS — ไม่ได้ connect โดยตรง)

## ไฟล์หลัก
```
src/
  lib/
    config.ts   — ราคา, menu data, GAS_URL, status labels
    api.ts      — createOrder(), getOrderByNo(), type OrderData
  app/
    page.tsx                     — Home page
    order/page.tsx               — Order page (multi-step form)
    order/[orderNo]/page.tsx     — Tracking page
    layout.tsx                   — Root layout (lang=th, metadata)
    globals.css                  — Tailwind import + dark theme colors
public/
  logo.png     — โลโก้ Scoop by Loki
docs/
  API.md       — GAS endpoint spec ครบ
  PRD.md       — PRD + Architecture ของ Ecosystem ทั้งหมด
```

## GAS URL
```
https://script.google.com/macros/s/AKfycbwolgQGSX47gYFK2biDG3a2j6jV93_cSALtu7V72Ju-5nKS2C9cl1rO36ZZaIlX5aEyLg/exec
```
อยู่ใน `src/lib/config.ts` ตัวแปร `GAS_URL`

## CORS — สำคัญมาก
GAS POST ต้องใช้ `Content-Type: text/plain;charset=utf-8` เสมอ
ไม่งั้น browser จะส่ง preflight OPTIONS ซึ่ง GAS ไม่รองรับ

```typescript
await fetch(GAS_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({ action: '...', payload: { ... } }),
});
```

## Menu Data (Source of Truth)
อยู่ใน `src/lib/config.ts` ตามเมนูจริง:
- M = 50฿ (5 scoops, 1 รส)
- L = 75฿ (8 scoops, max 2 รส, ฟรีท็อปปิ้ง 1)
- ท็อปปิ้ง extra = +5฿ ต่ออย่าง

## Deploy workflow
```
แก้โค้ด → git push → Vercel auto-deploy
```

## ความสัมพันธ์กับโปรเจกต์อื่น
- **IcePOS** (`d:\Project\icePOS`) — Admin panel ของร้าน ดูและจัดการออเดอร์ที่ลูกค้าสั่งมา
- **GAS** — Backend ร่วมกัน ทั้ง scoop-order และ IcePOS ใช้ GAS URL เดียวกัน
- **Google Sheets** — Database ร่วมกัน sheet `online_orders`
