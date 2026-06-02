# 🍨 Scoop by Loki — Customer Ordering Website

> Part of the **Scoop by Loki Ecosystem** — an end-to-end ice cream delivery system built for a small Thai dessert shop.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com)

---

## What is this?

A **mobile-first customer ordering website** that replaces the manual Messenger-based order flow.

**Before:** Customer → Facebook Post → DM the shop → back-and-forth asking flavor / size / address → shop manually types everything  
**After:** Customer → Website → select items + fill address → submit → order lands in [IcePOS](https://github.com/puddingdev/icepos) automatically

---

## Ecosystem

This repo is one piece of a two-app system that shares a single Google Sheets database via Google Apps Script.

| App | Repo | Role |
|-----|------|------|
| **Customer Website** | [`scoop-order`](https://github.com/puddingdev/scoop-order) ← you are here | Mobile ordering, order tracking |
| **Admin Panel** | [`icepos`](https://github.com/puddingdev/icepos) | Order management, PromptPay QR generation, cost/profit tracking |

```
Customer Website (Next.js)
        │
        │  POST order
        ▼
Google Apps Script (GAS Web App)
        │
        │  append / read rows
        ▼
Google Sheets  ◄──────────────────── IcePOS Admin Panel (Vanilla JS)
```

---

## Features

- **3-step order form** — flavor selection, size & toppings, customer info
- **Auto price calculation** — size + extra toppings + delivery zone fee
- **Order tracking page** — `/order/[orderNo]` polls live status from GAS
- **Mobile-first UI** — designed for Thai smartphone users
- **No login required** — frictionless checkout experience

---

## Order Flow

```
Customer lands on website
  → Selects flavor (Chocolate / Cookies & Cream / Vanilla)
  → Picks size  M (50฿ · 5 scoops)  or  L (75฿ · 8 scoops + 1 free topping)
  → Adds toppings (Oreo, Brownie, Cornflakes, Ovaltine, Choc Sauce · +5฿ each)
  → Chooses delivery zone (5฿ / 15฿ / 20฿)
  → Fills name · phone · address
  → Submits → Order #SL000001 created
  → Redirected to tracking page
  → Shop receives order in IcePOS → confirms → sends PromptPay QR via Messenger
  → Customer pays → shop updates status → delivers
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Google Apps Script Web App |
| Database | Google Sheets |
| Hosting | Vercel |

---

## Project Structure

```
src/
  lib/
    config.ts          — menu data, pricing, delivery zones, GAS_URL
    api.ts             — createOrder(), getOrderByNo(), OrderData type
  app/
    page.tsx           — Home page
    order/page.tsx     — Multi-step order form
    order/[orderNo]/   — Live order tracking
    layout.tsx         — Root layout
    globals.css        — Tailwind + dark theme
public/
  logo.png             — Scoop by Loki logo
```

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note on CORS:** The GAS backend requires `Content-Type: text/plain;charset=utf-8` on all POST requests. Using `application/json` triggers a preflight OPTIONS request that GAS does not support.

---

## Related

- [IcePOS — Admin Panel](https://github.com/puddingdev/icepos) — The shop-side counterpart. Manages all orders from this website plus walk-in POS, cost tracking, and PromptPay QR generation.
