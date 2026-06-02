# Scoop by Loki Ecosystem V1

## Overview

ระบบประกอบด้วย 2 ส่วน

### 1. Customer Ordering Website

เว็บไซต์สำหรับลูกค้าสั่งไอศกรีม (Next.js 15)

### 2. IcePOS

ระบบหลังร้านสำหรับจัดการออเดอร์ คำนวณต้นทุน กำไร สต็อก และรายงาน

ทั้งสองระบบใช้ฐานข้อมูลเดียวกัน (Google Sheets via GAS)

---

# Business Goal

ลดขั้นตอนการสั่งซื้อจาก Messenger

เดิม

Facebook Post
→ Messenger
→ ถามรสชาติ
→ ถามขนาด
→ ถามท็อปปิ้ง
→ ถามที่อยู่
→ ส่ง QR
→ รอชำระ

ใหม่ (Website Order)

Facebook Post
→ Website
→ เลือกสินค้า + กรอกที่อยู่
→ ส่งออเดอร์
→ ออเดอร์เข้า IcePOS อัตโนมัติ
→ ร้านได้รับแจ้งเตือนใน Facebook

---

# Tech Stack

Frontend (Customer Website)

 Next.js 15
 TypeScript
 TailwindCSS

Frontend (IcePOS)

 Vanilla JS (single-file, no build step)

Backend

 Google Apps Script (GAS) Web App

Database

 Google Sheets

QR Generation

 promptpay-qr (frontend library)
 qrcode.js (render QR image)

Hosting

 Vercel (both)

---

# System Architecture

```
Customer Website (Next.js)
        ↓ POST order
Google Apps Script (GAS)
        ↓ append row
Google Sheets (Database)
        ↓ read data
IcePOS Admin Panel (Vanilla JS)
```

---

# ORDER SOURCES — 2 แบบ

## Type 1: Website Order

```
ลูกค้าเห็น Facebook Post
→ กดลิ้งค์เข้าเว็บ
→ สั่งบนเว็บ (เลือก flavor / size / topping / ที่อยู่)
→ ออเดอร์เข้า IcePOS อัตโนมัติ
→ ร้านได้รับแจ้งเตือนใน Facebook
→ ร้าน gen QR PromptPay ใน IcePOS → copy ส่งใน Messenger เอง
```

source = WEBSITE

## Type 2: Facebook Direct Order

```
ลูกค้าทัก Messenger โดยตรง
→ ร้านกด "สร้างออเดอร์" ใน IcePOS เอง
→ กรอกข้อมูลใน IcePOS
→ gen QR PromptPay → copy ส่งใน Messenger เอง
```

source = FACEBOOK

หลังจากนั้น flow เหมือนกันทั้งสองแบบ

---

# CUSTOMER WEBSITE

## Mobile First

ออกแบบสำหรับมือถือเป็นหลัก

---

## Home Page

แสดง

 โลโก้ Scoop by Loki
 สโลแกน "กินก่อนแบกทีหลัง"

ปุ่ม

[ สั่งไอศกรีม ]

---

## Order Page

### Flavor Selection

 Chocolate
 Cookies & Cream
 Vanilla

---

### Size Selection

M
 5 Scoops
 1 Flavor
 50 THB

L
 8 Scoops
 Max 2 Flavors
 Free 1 Topping
 75 THB

---

### Toppings

 Oreo
 Brownie
 Cornflakes
 Ovaltine Powder
 Chocolate Sauce

Extra topping +5 THB

---

### Delivery Zone

5 THB
 Pruksa 116

15 THB
 Malee / Tawanork 14-16 / Namrong / Setthabut
 Fullhouse / Zoom / Charoensuk / Pink Bridge

20 THB
 Porn 3 / Porn 4 / Pornthavee / Four B / Maple
 Moo Nam Khaeng / R.S. / Icon / East Alley / Kave

---

### Customer Information

 Name
 Phone
 Address
 Note

---

### Order Summary

แสดง Selected Items + Delivery Fee + Total Price (Auto Calculate)

---

### Submit Order

สร้างออเดอร์ → Status: WAITING_FOR_STORE

Generate Order Number → SL000001

---

# CUSTOMER TRACKING PAGE

URL: /order/[orderNumber]

ลูกค้าติดตามสถานะได้

Possible Status

 WAITING_FOR_STORE — รอร้านรับออเดอร์
 WAITING_PAYMENT — รอชำระเงิน
 PAID — ชำระแล้ว
 MAKING — กำลังทำ
 READY_TO_DELIVER — พร้อมส่ง
 DELIVERING — กำลังส่ง
 DELIVERED — ส่งสำเร็จ
 CANCELLED — ยกเลิก

---

# ICEPOS ADMIN

## Existing Features — KEEP ALL

 POS (walk-in)
 Cost Calculation
 Profit Calculation
 Stock Management
 Sales History
 Reports
 Break-even Analysis

Do NOT remove or redesign existing POS flow.

---

## New Module: Online Orders

เพิ่มเมนู "Online Orders" ใน IcePOS

### Online Orders List

แสดง: Order Number / Customer Name / Total / Status / Created At / Source

### Order Detail

แสดง: Customer Info / Items / Toppings / Delivery Fee / Total / Payment Status / Order Status

---

# PROMPTPAY QR GENERATION (ใน IcePOS)

IcePOS สามารถ gen QR PromptPay ได้เลยตาม order amount

Config (ตั้งครั้งเดียว)
 เบอร์โทร PromptPay ของร้าน

เมื่อรับออเดอร์
 กด "สร้าง QR"
 ระบบ gen QR พร้อมยอดเงินตรงตาม order
 [ Copy รูป QR ] หรือ [ Download ]
 ร้านนำไปส่งให้ลูกค้าใน Messenger เอง

Library (frontend only — ไม่ต้อง API)
 promptpay-qr — gen payload string จากเบอร์ + จำนวนเงิน
 qrcode.js — render QR เป็นรูป

---

# ORDER FLOW (Step by Step)

## Step 1 — ลูกค้าสั่ง
 Website: ลูกค้ากดสั่งบนเว็บ → เข้า IcePOS อัตโนมัติ
 Facebook: ร้านกด "สร้างออเดอร์" ใน IcePOS เอง

Status: WAITING_FOR_STORE

---

## Step 2 — ร้านรับออเดอร์

ร้านกด "รับออเดอร์"

IcePOS gen QR PromptPay ตามยอด order

ร้าน copy QR → ส่งให้ลูกค้าใน Messenger เอง

IcePOS gen ข้อความให้ copy:

```
รับออเดอร์แล้วครับ 🍨
Order #SL0001

กรุณาโอนเงิน [ยอด] บาท
ผ่าน PromptPay ตาม QR ด้านบน

โอนแล้วส่งสลิปมาได้เลยครับ 🙏
```

Status: WAITING_PAYMENT

---

## Step 3 — ลูกค้าโอน + ส่งสลิป

ลูกค้าส่งสลิปมาทาง Messenger

ร้านตรวจสอบสลิปเอง

---

## Step 4 — ร้านยืนยันการชำระ

ร้านกด "ยืนยันการชำระ" ใน IcePOS

รายได้เข้าระบบคำนวณต้นทุน/กำไรอัตโนมัติ

IcePOS gen ข้อความให้ copy:

```
ได้รับเงินแล้วครับ ✅
กำลังตักไอศกรีมให้เลยครับ 🍨
```

Status: PAID → MAKING

---

## Step 5 — ทำเสร็จ

ร้านกด "ทำเสร็จแล้ว"

IcePOS gen ข้อความให้ copy:

```
ไอศกรีมพร้อมแล้วครับ 🍦
กำลังออกส่งเดี๋ยวนี้เลยครับ!
```

Status: READY_TO_DELIVER

---

## Step 6 — ออกส่ง

ร้านกด "กำลังส่ง"

IcePOS gen ข้อความให้ copy:

```
ออกส่งแล้วครับ 🛵
ใกล้ถึงแล้ว รอรับได้เลยครับ!
```

Status: DELIVERING

---

## Step 7 — ส่งสำเร็จ

ร้านถ่ายรูปสินค้าไว้หน้าบ้าน

อัปโหลดรูปใน IcePOS

กด "จัดส่งสำเร็จ"

IcePOS gen ข้อความให้ copy (พร้อม order number):

```
📦 จัดส่งเรียบร้อยแล้วครับ

🍨 Order #SL0001

สินค้าวางไว้หน้าบ้านเรียบร้อย

📸 [รูปภาพ]

รีบลงมาเอาก่อนนะครับ
ไอศกรีมกำลังจะละลาย 😆🍦

ขอบคุณที่อุดหนุน Scoop by Loki 💜
```

ร้าน copy ข้อความ + รูป → ส่งใน Messenger เอง

Status: DELIVERED

---

## Step Cancel — ยกเลิก

ยกเลิกได้เฉพาะ status: WAITING_FOR_STORE หรือ WAITING_PAYMENT

ร้านกด "ยกเลิกออเดอร์" + ระบุเหตุผล

Status: CANCELLED

---

# MANUAL ORDER CREATION (IcePOS)

ปุ่ม [ + สร้างออเดอร์ ] ใน Online Orders

Required Fields
 Customer Name
 Phone
 Address
 Flavor + Size + Toppings
 Note (optional)

Source = FACEBOOK (default) / LINE / WALK_IN

หลังบันทึก → เข้า workflow เดียวกับ website order ทุกอย่าง

---

# ORDER SOURCES

 WEBSITE — สั่งผ่านเว็บไซต์
 FACEBOOK — ทักมาทาง Messenger ร้านกรอกเอง
 LINE — ทักมาทาง LINE ร้านกรอกเอง
 WALK_IN — ลูกค้าหน้าร้าน

---

# PRICING REFERENCE (Source of Truth)

ข้อมูลนี้ใช้ hardcode เป็นค่าเริ่มต้นใน IcePOS และ Customer Website

## รสชาติ (Flavors)

 ช็อกโกแลต
 คุกกี้แอนด์ครีม
 วานิลลา

## ขนาด (Sizes)

M — 50฿
 5 Scoops
 เลือกได้ 1 รส

L — 75฿
 8 Scoops
 เลือกได้สูงสุด 2 รส
 ฟรีท็อปปิ้ง 1 อย่าง

## ท็อปปิ้ง (Toppings) — +5฿ ต่ออย่าง

 โอรีโอ้
 บราวนี่
 คอร์นเฟลก
 ผงโอวัลติน
 ซอสช็อกโกแลต

หมายเหตุ: L ได้ฟรี 1 อย่าง → อย่างที่ 2 ขึ้นไปคิด +5฿

## ค่าส่ง (Delivery Zones)

5฿
 พฤกษา 116

15฿
 ซ.มาลี
 ตะวันออก 14-16
 นำรงค์
 เศรษฐบุตร
 Fullhouse
 ซ.ซูม
 เจริญสุข
 สะพานชมพู

20฿
 พร 3
 พร 4
 พรทวี
 โฟร์บี
 Maple
 หมูน้ำแข็ง
 R.S.
 Icon
 ซ.อีส
 Kave

---

# DATABASE SCHEMA

## Orders
 id
 order_no
 customer_name
 phone
 address
 note
 source
 subtotal
 delivery_fee
 total
 payment_status
 order_status
 delivery_photo_url
 created_at

## OrderItems
 id
 order_id
 flavor
 size
 quantity
 unit_price

## OrderToppings
 id
 order_id
 topping_name
 topping_price

## DeliveryZones
 id
 zone_name
 delivery_fee

## Payments
 id
 order_id
 amount
 verified_at

## Config
 promptpay_number (เบอร์ PromptPay ของร้าน)

---

# DASHBOARD WIDGETS

 Waiting Orders (WAITING_FOR_STORE + WAITING_PAYMENT)
 Making Orders (MAKING)
 Delivering Orders (DELIVERING)
 Today's Revenue
 Today's Profit
 Today's Orders

---

# Future V2

 Customer Accounts
 Loyalty Points
 Discount Coupons
 LINE Notification (automated)
 Discord Notification
 Auto PromptPay Verification
 Inventory Auto Deduction
 Delivery Analytics
 Facebook Messenger API Integration (automated send)

For V1 focus only on order management and integration with existing IcePOS.
All communication (QR, status messages) = IcePOS generates text/image → store sends manually in Messenger.
