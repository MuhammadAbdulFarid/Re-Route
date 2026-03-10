# Re-Route Platform - Technical Documentation

## Reverse Logistics SaaS for UMKMs

---

## 📊 Database Schema (ERD)

### Core Entities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLATFORM OWNER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - email: String (unique)                                                   │
│ - name: String                                                            │
│ - createdAt: DateTime                                                     │
│ - updatedAt: DateTime                                                      │
│                                                                             │
│ Relations:                                                                 │
│   ├── Subscriptions (1:N)                                                  │
│   ├── Transactions (1:N)                                                   │
│   └── FraudAlerts (1:N)                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER (MERCHANT)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - email: String (unique)                                                  │
│ - name: String                                                            │
│ - phone: String?                                                          │
│ - businessName: String                                                    │
│ - role: String (merchant, admin, owner)                                   │
│ - createdAt: DateTime                                                     │
│ - updatedAt: DateTime                                                     │
│                                                                             │
│ Relations:                                                                 │
│   ├── Stores (1:N)                                                        │
│   ├── Orders (1:N)                                                         │
│   ├── ReturnRequests (1:N)                                                │
│   ├── Inventory (1:N)                                                      │
│   ├── Conversations (1:N)                                                  │
│   └── Messages (1:N)                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                STORE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - name: String                                                            │
│ - slug: String (unique) - for white-label URL                            │
│ - logo: String?                                                           │
│ - description: String?                                                    │
│ - address: String?                                                        │
│ - phone: String?                                                          │
│ - email: String?                                                          │
│ - isActive: Boolean                                                       │
│ - userId: UUID (FK)                                                       │
│ - createdAt: DateTime                                                     │
│ - updatedAt: DateTime                                                     │
│                                                                             │
│ Relations:                                                                 │
│   ├── Orders (1:N)                                                        │
│   ├── ReturnRequests (1:N)                                                │
│   ├── Inventory (1:N)                                                     │
│   ├── MarketplaceConnections (1:N)                                        │
│   └── Conversations (1:N)                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                ORDER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - orderNumber: String (unique)                                            │
│ - source: String (shopee, tokopedia, tiktok, manual)                    │
│ - customerName: String                                                    │
│ - customerPhone: String                                                   │
│ - customerEmail: String?                                                  │
│ - productName: String                                                     │
│ - productSku: String?                                                     │
│ - quantity: Int                                                           │
│ - price: Float                                                            │
│ - status: String (pending, shipped, delivered, returned, cancelled)         │
│ - notes: String?                                                          │
│ - userId: UUID (FK)                                                       │
│ - storeId: UUID (FK)?                                                    │
│ - createdAt: DateTime                                                     │
│ - updatedAt: DateTime                                                     │
│                                                                             │
│ Relations:                                                                 │
│   └── ReturnRequests (1:N)                                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           RETURN REQUEST                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - returnNumber: String (unique) - RTR-XXXX format                        │
│ - reason: String                                                          │
│ - description: String?                                                    │
│ - photoUrl: String?                                                       │
│ - status: String (pending, approved, shipped, received, rejected,          │
│                    dispositioned)                                          │
│ - courierName: String?                                                    │
│ - waybillNumber: String?                                                 │
│ - waybillLabelUrl: String?                                               │
│ - barcodeUrl: String?                                                     │
│ - shippingCost: Float                                                     │
│ - disposition: String? (restock, repair, writeoff)                       │
│ - dispositionNote: String?                                                │
│ - processedAt: DateTime?                                                  │
│ - receivedAt: DateTime?                                                   │
│ - orderId: UUID (FK)                                                     │
│ - userId: UUID (FK)                                                      │
│ - storeId: UUID (FK)?                                                    │
│ - createdAt: DateTime                                                     │
│ - updatedAt: DateTime                                                     │
│                                                                             │
│ Relations:                                                                 │
│   ├── Conversation (1:1)                                                  │
│   └── ReturnDisposition (1:1)                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        MARKETPLACE CONNECTION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - marketplace: String (shopee, tokopedia, tiktok)                        │
│ - shopId: String                                                          │
│ - shopName: String                                                        │
│ - accessToken: String? (encrypted)                                        │
│ - refreshToken: String? (encrypted)                                       │
│ - tokenExpiry: DateTime?                                                  │
│ - isActive: Boolean                                                       │
│ - lastSync: DateTime?                                                     │
│ - storeId: UUID (FK)                                                      │
│ - createdAt: DateTime                                                     │
│ - updatedAt: DateTime                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             TRANSACTION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - type: String (subscription_fee, service_fee, logistics_kickback)        │
│ - amount: Float                                                           │
│ - currency: String (IDR)                                                  │
│ - status: String (pending, completed, failed)                             │
│ - description: String?                                                    │
│ - metadata: String? (JSON)                                               │
│ - platformOwnerId: UUID (FK)                                             │
│ - storeId: UUID (FK)?                                                    │
│ - returnId: UUID (FK)?                                                   │
│ - createdAt: DateTime                                                     │
│ - updatedAt: DateTime                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRAUD ALERT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - type: String (suspicious_return_pattern, fake_photo,                   │
│                 multiple_returns)                                         │
│ - severity: String (low, medium, high, critical)                         │
│ - status: String (open, investigating, resolved, dismissed)             │
│ - description: String                                                    │
│ - evidence: String? (JSON)                                               │
│ - resolution: String?                                                     │
│ - platformOwnerId: UUID (FK)                                             │
│ - customerId: String                                                      │
│ - returnId: UUID (FK)?                                                   │
│ - createdAt: DateTime                                                     │
│ - resolvedAt: DateTime?                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             CONVERSATION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - type: String (return, general)                                         │
│ - status: String (open, resolved, closed)                                 │
│ - storeId: UUID (FK)                                                      │
│ - userId: UUID (FK) - Customer                                           │
│ - returnId: UUID (FK)? - Optional linked return                          │
│ - createdAt: DateTime                                                     │
│ - updatedAt: DateTime                                                     │
│ - resolvedAt: DateTime?                                                  │
│                                                                             │
│ Relations:                                                                 │
│   └── Messages (1:N)                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                MESSAGE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - content: String                                                         │
│ - senderType: String (customer, merchant, system)                        │
│ - senderId: String                                                        │
│ - conversationId: UUID (FK)                                              │
│ - userId: UUID (FK)                                                      │
│ - isRead: Boolean                                                         │
│ - createdAt: DateTime                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          RETURN DISPOSITION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ - id: UUID (PK)                                                           │
│ - recommendation: String (restock, repair, writeoff)                      │
│ - confidence: Float (0-100)                                              │
│ - reasoning: String?                                                      │
│ - condition: String? (good, fair, poor)                                  │
│ - estimatedValue: Float?                                                 │
│ - damageDetected: Boolean                                                │
│ - damageType: String?                                                     │
│ - wearLevel: String? (new, light, moderate, heavy)                      │
│ - photoAnalysis: String? (JSON)                                          │
│ - returnId: UUID (FK)                                                    │
│ - createdAt: DateTime                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ User Flow Navigation

### Customer (Pelanggan)

```
Landing Page
    │
    ├──▶ Portal Retur Umum (re-route.id/returns)
    │       │
    │       └── Submit Return Request
    │               │
    │               └── View Status
    │
    └──▶ White-Label Portal (toko.slug.id/returns)
            │
            └── Submit Return (Branded Experience)
```

### Merchant (Admin Toko)

```
Dashboard Admin (/admin)
    │
    ├──▶ Returns Management
    │       ├── Approve/Reject Return
    │       ├── Generate Waybill
    │       └── Download Label
    │
    ├──▶ Inventory Management
    │
    ├──▶ Integrasi Marketplace (/admin/marketplace)
    │       ├── Connect Shopee
    │       ├── Connect Tokopedia
    │       └── Connect TikTok Shop
    │
    ├──▶ Orders
    │       ├── Manual Entry (/admin/orders/manual)
    │       └── Bulk Upload (/admin/orders/bulk)
    │
    ├──▶ Resolution Center (/admin/chat)
    │       └── Chat with Customers
    │
    └──▶ AI Analysis (/admin/ai-analysis)
            └── Smart Disposition Recommendations
```

### Platform Owner

```
Owner Dashboard
    │
    ├──▶ Revenue Dashboard (/owner/revenue)
    │       ├── Subscription Revenue
    │       ├── Service Fee
    │       └── Logistics Kickback
    │
    └──▶ Fraud Detection (/owner/fraud)
            ├── Alert Management
            └── Risk Customers
```

---

## 🛠️ Tech Stack Recommendations

### Frontend

| Component      | Technology   | Version |
| -------------- | ------------ | ------- |
| Framework      | React + Vite | 18.x    |
| Styling        | Tailwind CSS | 3.x     |
| Routing        | React Router | 6.x     |
| HTTP Client    | Axios        | 1.x     |
| Charts         | Recharts     | Latest  |
| Barcode        | JsBarcode    | Latest  |
| PDF Generation | jsPDF        | Latest  |
| CSV Parser     | Papaparse    | Latest  |
| Icons          | Heroicons    | Latest  |

### Backend

| Component      | Technology                       | Version |
| -------------- | -------------------------------- | ------- |
| Server         | Express.js                       | 4.x     |
| Database       | Prisma ORM                       | 5.x     |
| Database       | SQLite (Dev) / PostgreSQL (Prod) | -       |
| File Upload    | Multer                           | 1.x     |
| Authentication | JWT                              | Latest  |

### External Integrations

| Service         | Purpose                      |
| --------------- | ---------------------------- |
| Shopee API      | Order sync, returns          |
| Tokopedia API   | Order sync, returns          |
| TikTok Shop API | Order sync, returns          |
| JNE API         | Waybill generation           |
| SiCepat API     | Waybill generation           |
| J&T API         | Waybill generation           |
| OpenAI Vision   | AI photo analysis (optional) |

---

## 📁 Project Structure

```
re-route/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── dev.db             # SQLite dev database
│   │   └── seed.js            # Seed data
│   ├── src/
│   │   ├── index.js           # Express server entry
│   │   ├── prisma.js          # Prisma client
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # API routes
│   │   └── services/          # Business logic
│   ├── uploads/               # Uploaded files
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StoreSwitcher.jsx
│   │   │   ├── MarketplaceConnect.jsx
│   │   │   ├── ManualOrderEntry.jsx
│   │   │   ├── BulkUpload.jsx
│   │   │   ├── ResolutionCenter.jsx
│   │   │   ├── RevenueDashboard.jsx
│   │   │   ├── FraudDashboard.jsx
│   │   │   ├── WhiteLabelPortal.jsx
│   │   │   └── LabelDownload.jsx
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── PROJECT_PLAN.md
└── TECHNICAL_DOCUMENTATION.md
```

---

## 🔗 API Endpoints Summary

### Store Management

- `GET /api/stores` - List stores
- `POST /api/stores` - Create store
- `GET /api/stores/:id` - Get store
- `GET /api/stores/slug/:slug` - Get by slug (white-label)
- `PATCH /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Marketplace

- `GET /api/marketplace/connections` - List connections
- `POST /api/marketplace/connect` - Initiate OAuth
- `POST /api/marketplace/callback` - OAuth callback
- `POST /api/marketplace/sync` - Sync orders
- `DELETE /api/marketplace/connections/:id` - Disconnect

### Orders

- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `POST /api/bulk/upload` - Bulk import

### Returns

- `GET /api/returns` - List returns
- `POST /api/returns/submit` - Submit return
- `PATCH /api/returns/approve/:id` - Approve & generate waybill
- `PATCH /api/returns/reject/:id` - Reject return

### Labels

- `POST /api/labels/generate` - Generate label
- `GET /api/labels/:id` - Get label data
- `GET /api/labels/:id/html` - Get printable HTML

### Disposition

- `POST /api/disposition/analyze` - AI analysis
- `GET /api/disposition/:id` - Get recommendation

### Chat

- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message

### Revenue (Owner)

- `GET /api/revenue/dashboard` - Revenue overview
- `GET /api/revenue/transactions` - Transaction list

### Fraud (Owner)

- `GET /api/fraud/dashboard` - Fraud overview
- `GET /api/fraud/alerts` - Alert list
- `PATCH /api/fraud/alerts/:id` - Update alert status

---

_Documentation Version: 1.0_
_Generated for Re-Route Platform v2.0_
