# API.md — Google Apps Script

## Web App URL

```
https://script.google.com/macros/s/AKfycbwolgQGSX47gYFK2biDG3a2j6jV93_cSALtu7V72Ju-5nKS2C9cl1rO36ZZaIlX5aEyLg/exec
```

ใส่ URL นี้ใน `index.html` ที่ตัวแปร `GAS_URL`

---

## Endpoints

### POST — บันทึกข้อมูล

**Body (JSON):**
```json
{ "action": "...", "payload": { ... } }
```

---

#### action: `log` — POS เดิม (ไม่เปลี่ยน)

**payload ขาย:**
```json
{
  "type": "sale",
  "date": "2025-06-01T10:30:00.000Z",
  "size": "L",
  "flavors": ["chocolate", "vanilla"],
  "toppings": ["oreo"],
  "price": 79,
  "cost": 38,
  "profit": 41
}
```

**payload กินเอง:**
```json
{
  "type": "eat",
  "date": "2025-06-01T11:00:00.000Z",
  "ice": { "chocolate": 2 },
  "top": { "oreo": 1 }
}
```

**payload ซื้อสต็อก:**
```json
{
  "type": "purchase",
  "date": "2025-06-01T09:00:00.000Z",
  "category": "ice",
  "name": "ช็อกโกแลต",
  "qty": 80,
  "unit": "สกู๊ป",
  "price": 259,
  "costPerUnit": 3.24
}
```

**payload config:**
```json
{
  "type": "config",
  "key": "sizes",
  "value": "[{\"id\":\"M\",...}]"
}
```

---

#### action: `createOrder` — สร้างออเดอร์ออนไลน์ใหม่

```json
{
  "action": "createOrder",
  "payload": {
    "customer_name": "สมชาย",
    "phone": "0812345678",
    "address": "พฤกษา 116",
    "note": "",
    "source": "WEBSITE",
    "items": [
      { "flavor": "ช็อกโกแลต", "size": "L", "qty": 1, "unit_price": 75 }
    ],
    "toppings": [
      { "name": "โอรีโอ้", "price": 0 },
      { "name": "บราวนี่", "price": 5 }
    ],
    "subtotal": 80,
    "delivery_fee": 5,
    "total": 85
  }
}
```

**Response:**
```json
{ "success": true, "order_no": "SL000001" }
```

---

#### action: `updateOrderStatus` — เปลี่ยนสถานะออเดอร์

```json
{
  "action": "updateOrderStatus",
  "payload": {
    "order_no": "SL000001",
    "order_status": "MAKING"
  }
}
```

ค่า order_status ที่ใช้ได้:
- `WAITING_FOR_STORE`
- `WAITING_PAYMENT`
- `PAID`
- `MAKING`
- `READY_TO_DELIVER`
- `DELIVERING`
- `DELIVERED`
- `CANCELLED`

**Response:**
```json
{ "success": true }
```

---

#### action: `confirmPayment` — ยืนยันชำระเงิน

```json
{
  "action": "confirmPayment",
  "payload": {
    "order_no": "SL000001"
  }
}
```

ระบบจะเปลี่ยน `payment_status` → `PAID` และ `order_status` → `MAKING` อัตโนมัติ

**Response:**
```json
{ "success": true }
```

---

#### action: `setDeliveryPhoto` — บันทึกรูปจัดส่ง + จบออเดอร์

```json
{
  "action": "setDeliveryPhoto",
  "payload": {
    "order_no": "SL000001",
    "photo_url": "https://drive.google.com/..."
  }
}
```

ระบบจะบันทึก `delivery_photo_url` และเปลี่ยน `order_status` → `DELIVERED`

**Response:**
```json
{ "success": true }
```

---

### GET — ดึงข้อมูล

#### action: `getAll` — POS เดิม (ไม่เปลี่ยน)

```
GET ?action=getAll
```

---

#### action: `getOrders` — ดึงออเดอร์ออนไลน์ทั้งหมด (IcePOS ใช้)

```
GET ?action=getOrders
```

**Response:**
```json
{
  "orders": [
    {
      "order_no": "SL000001",
      "customer_name": "สมชาย",
      "phone": "0812345678",
      "address": "พฤกษา 116",
      "note": "",
      "source": "WEBSITE",
      "items": [{ "flavor": "ช็อกโกแลต", "size": "L", "qty": 1, "unit_price": 75 }],
      "toppings": [{ "name": "โอรีโอ้", "price": 0 }],
      "subtotal": 75,
      "delivery_fee": 5,
      "total": 80,
      "payment_status": "UNPAID",
      "order_status": "WAITING_FOR_STORE",
      "delivery_photo_url": "",
      "created_at": "2025-06-01 10:30:00"
    }
  ]
}
```

---

#### action: `getOrderByNo` — ดึงออเดอร์เดียว (Tracking page ใช้)

```
GET ?action=getOrderByNo&order_no=SL000001
```

**Response:**
```json
{
  "order": {
    "order_no": "SL000001",
    "customer_name": "สมชาย",
    "order_status": "MAKING",
    "payment_status": "PAID",
    ...
  }
}
```

ถ้าไม่พบ:
```json
{ "order": null }
```

---

## Google Sheets Schema

### sheet: `online_orders` (ใหม่)

| order_no | customer_name | phone | address | note | source | items | toppings | subtotal | delivery_fee | total | payment_status | order_status | delivery_photo_url | created_at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SL000001 | สมชาย | 081... | พฤกษา 116 | | WEBSITE | [...JSON...] | [...JSON...] | 75 | 5 | 80 | UNPAID | WAITING_FOR_STORE | | 2025-06-01 10:30 |

หมายเหตุ: `items` และ `toppings` เก็บเป็น JSON string ใน cell เดียว

---

### sheet: `orders` (เดิม — ไม่เปลี่ยน)

| timestamp | type | size | flavors | toppings | price | cost | profit |

### sheet: `purchases` (เดิม — ไม่เปลี่ยน)

| timestamp | category | name | qty | unit | price | costPerUnit |

### sheet: `config` (เดิม — ไม่เปลี่ยน)

| key | value | lastUpdated |

---

## Code.gs (วางใน Apps Script ทับของเดิม)

```javascript
const SPREADSHEET_ID   = '1DejloYurLE5YX7QqIYx96nWVY5dZJHlbzTw155beaRM';
const SHEET_ORDERS     = 'orders';
const SHEET_PURCHASES  = 'purchases';
const SHEET_CONFIG     = 'config';
const SHEET_ONLINE     = 'online_orders';

// ─── ROUTER ──────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const body    = JSON.parse(e.postData.contents);
    const action  = body.action;
    const payload = body.payload;

    if (action === 'log')                return jsonResponse(logEntry(payload));
    if (action === 'createOrder')        return jsonResponse(createOrder(payload));
    if (action === 'updateOrderStatus')  return jsonResponse(updateOrderStatus(payload));
    if (action === 'confirmPayment')     return jsonResponse(confirmPayment(payload));
    if (action === 'setDeliveryPhoto')   return jsonResponse(setDeliveryPhoto(payload));

    return jsonResponse({ success: false, error: 'unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getAll')        return jsonResponse(getAllData());
    if (action === 'getOrders')     return jsonResponse(getOrders());
    if (action === 'getOrderByNo')  return jsonResponse(getOrderByNo(e.parameter.order_no));

    return jsonResponse({ error: 'unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ─── ONLINE ORDERS ────────────────────────────────────────────────────────────

function createOrder(p) {
  const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh   = ss.getSheetByName(SHEET_ONLINE);
  const rows = sh.getLastRow();

  // gen order number: SL000001
  const num      = rows; // row 1 = header, so lastRow after append = count
  const order_no = 'SL' + String(num).padStart(6, '0');

  const ts = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  sh.appendRow([
    order_no,
    p.customer_name || '',
    p.phone         || '',
    p.address       || '',
    p.note          || '',
    p.source        || 'WEBSITE',
    JSON.stringify(p.items    || []),
    JSON.stringify(p.toppings || []),
    p.subtotal      || 0,
    p.delivery_fee  || 0,
    p.total         || 0,
    'UNPAID',
    'WAITING_FOR_STORE',
    '',
    ts
  ]);

  return { success: true, order_no };
}

function updateOrderStatus(p) {
  const row = findOrderRow(p.order_no);
  if (!row) return { success: false, error: 'order not found' };

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_ONLINE);
  sh.getRange(row, 13).setValue(p.order_status); // col 13 = order_status
  return { success: true };
}

function confirmPayment(p) {
  const row = findOrderRow(p.order_no);
  if (!row) return { success: false, error: 'order not found' };

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_ONLINE);
  sh.getRange(row, 12).setValue('PAID');   // col 12 = payment_status
  sh.getRange(row, 13).setValue('MAKING'); // col 13 = order_status
  return { success: true };
}

function setDeliveryPhoto(p) {
  const row = findOrderRow(p.order_no);
  if (!row) return { success: false, error: 'order not found' };

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_ONLINE);
  sh.getRange(row, 14).setValue(p.photo_url  || ''); // col 14 = delivery_photo_url
  sh.getRange(row, 13).setValue('DELIVERED');          // col 13 = order_status
  return { success: true };
}

function getOrders() {
  const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh   = ss.getSheetByName(SHEET_ONLINE);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return { orders: [] };

  const orders = data.slice(1).map(r => ({
    order_no:           r[0],
    customer_name:      r[1],
    phone:              r[2],
    address:            r[3],
    note:               r[4],
    source:             r[5],
    items:              safeJson(r[6], []),
    toppings:           safeJson(r[7], []),
    subtotal:           r[8],
    delivery_fee:       r[9],
    total:              r[10],
    payment_status:     r[11],
    order_status:       r[12],
    delivery_photo_url: r[13],
    created_at:         r[14]
  }));

  return { orders };
}

function getOrderByNo(order_no) {
  if (!order_no) return { order: null };
  const row = findOrderRow(order_no);
  if (!row) return { order: null };

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_ONLINE);
  const r  = sh.getRange(row, 1, 1, 15).getValues()[0];

  return {
    order: {
      order_no:           r[0],
      customer_name:      r[1],
      phone:              r[2],
      address:            r[3],
      note:               r[4],
      source:             r[5],
      items:              safeJson(r[6], []),
      toppings:           safeJson(r[7], []),
      subtotal:           r[8],
      delivery_fee:       r[9],
      total:              r[10],
      payment_status:     r[11],
      order_status:       r[12],
      delivery_photo_url: r[13],
      created_at:         r[14]
    }
  };
}

// ─── POS เดิม ─────────────────────────────────────────────────────────────────

function logEntry(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const d  = new Date(payload.date || new Date());
  const ts = Utilities.formatDate(d, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  if (payload.type === 'sale') {
    const sh = ss.getSheetByName(SHEET_ORDERS);
    sh.appendRow([
      ts, 'sale', payload.size,
      payload.flavors.join(', '),
      (payload.toppings || []).join(', '),
      payload.price, payload.cost, payload.profit
    ]);

  } else if (payload.type === 'eat') {
    const sh      = ss.getSheetByName(SHEET_ORDERS);
    const iceParts = Object.entries(payload.ice || {}).map(([k,v]) => k+' '+v+'สกู๊ป').join(', ');
    const topParts = Object.entries(payload.top || {}).map(([k,v]) => k+' '+v+'เสิร์ฟ').join(', ');
    sh.appendRow([ts, 'eat', '', iceParts, topParts, '', '', '']);

  } else if (payload.type === 'purchase') {
    const sh = ss.getSheetByName(SHEET_PURCHASES);
    sh.appendRow([
      ts, payload.category, payload.name,
      payload.qty, payload.unit, payload.price, payload.costPerUnit
    ]);

  } else if (payload.type === 'config') {
    const sh   = ss.getSheetByName(SHEET_CONFIG);
    const data = sh.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === payload.key) {
        sh.getRange(i+1, 2).setValue(payload.value);
        sh.getRange(i+1, 3).setValue(new Date());
        return { success: true };
      }
    }
    sh.appendRow([payload.key, payload.value, new Date()]);
  }

  return { success: true };
}

function getAllData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const oSh  = ss.getSheetByName(SHEET_ORDERS);
  const oRows = oSh.getDataRange().getValues().slice(1);
  const orders = oRows.map(r => ({
    date: r[0], type: r[1], size: r[2],
    flavors: r[3], toppings: r[4],
    price: r[5], cost: r[6], profit: r[7]
  }));

  const pSh   = ss.getSheetByName(SHEET_PURCHASES);
  const pRows = pSh.getDataRange().getValues().slice(1);
  const purchases = pRows.map(r => ({
    date: r[0], category: r[1], name: r[2],
    qty: r[3], unit: r[4], price: r[5], costPerUnit: r[6]
  }));

  const cSh   = ss.getSheetByName(SHEET_CONFIG);
  const cRows = cSh.getDataRange().getValues();
  const config = {};
  cRows.forEach(r => {
    try { config[r[0]] = JSON.parse(r[1]); }
    catch (e) { config[r[0]] = r[1]; }
  });

  return { orders, purchases, config };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function findOrderRow(order_no) {
  const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh   = ss.getSheetByName(SHEET_ONLINE);
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === order_no) return i + 1; // 1-indexed row
  }
  return null;
}

function safeJson(str, fallback) {
  try { return JSON.parse(str); }
  catch (e) { return fallback; }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── SETUP ────────────────────────────────────────────────────────────────────

function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let o = ss.getSheetByName(SHEET_ORDERS);
  if (!o) o = ss.insertSheet(SHEET_ORDERS);
  o.getRange(1,1,1,8).setValues([['timestamp','type','size','flavors','toppings','price','cost','profit']]);

  let p = ss.getSheetByName(SHEET_PURCHASES);
  if (!p) p = ss.insertSheet(SHEET_PURCHASES);
  p.getRange(1,1,1,7).setValues([['timestamp','category','name','qty','unit','price','costPerUnit']]);

  let c = ss.getSheetByName(SHEET_CONFIG);
  if (!c) c = ss.insertSheet(SHEET_CONFIG);
  c.getRange(1,1,1,3).setValues([['key','value','lastUpdated']]);

  // online_orders sheet (ใหม่)
  let n = ss.getSheetByName(SHEET_ONLINE);
  if (!n) n = ss.insertSheet(SHEET_ONLINE);
  n.getRange(1,1,1,15).setValues([[
    'order_no','customer_name','phone','address','note','source',
    'items','toppings','subtotal','delivery_fee','total',
    'payment_status','order_status','delivery_photo_url','created_at'
  ]]);

  SpreadsheetApp.flush();
  Logger.log('Setup complete!');
}
```

---

## วิธี Deploy

1. เปิด [Google Apps Script](https://script.google.com)
2. วางโค้ดทับ Code.gs เดิม
3. รัน `setupSheets()` ครั้งเดียวเพื่อสร้าง sheet `online_orders`
4. Deploy → New Deployment → Web App → Execute as: Me → Who has access: Anyone
5. Copy URL ใส่ `GAS_URL` ใน `index.html`

---

## วิธีเพิ่ม GAS_URL ใน index.html

```javascript
const GAS_URL = 'https://script.google.com/macros/s/[YOUR_ID]/exec';

async function syncToSheets(payload) {
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'log', payload }),
    });
  } catch (e) {
    console.warn('Sync failed (offline?):', e);
  }
}

async function callGAS(action, payload) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action, payload }),
  });
  return res.json();
}

async function getFromGAS(action, params = {}) {
  const qs  = new URLSearchParams({ action, ...params });
  const res = await fetch(`${GAS_URL}?${qs}`);
  return res.json();
}
```
