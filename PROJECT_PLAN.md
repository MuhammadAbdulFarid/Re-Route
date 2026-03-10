# Re-Route Platform Enhancement Plan

## Reverse Logistics SaaS for UMKMs

---

## 📊 Information Gathered

### Current System Status:

The platform already has a solid foundation with:

1. **Database Schema (Prisma/SQLite)**
   - Multi-store support with `Store` model (includes slug for white-label)
   - User roles: PlatformOwner, Merchant, User
   - MarketplaceConnection for Shopee, Tokopedia, TikTok
   - ReturnRequest with status flow: pending → approved → shipped → received → dispositioned
   - Inventory tracking
   - Subscription & Transaction models for monetization
   - FraudAlert system
   - Conversation/Message for internal chat

2. **Backend Services**
   - MarketplaceService (OAuth flow, order sync)
   - LabelService (HTML label generation with barcode)
   - AIDispositionService (rule-based analysis)
   - FraudDetectionService (pattern analysis)
   - CourierService (waybill generation)

3. **Frontend**
   - AdminDashboard (return management, inventory)
   - ReturnPortal (customer return submission)
   - UserDashboard
   - Login component

---

## 🎯 Implementation Plan

### Phase 1: Multi-Role Dashboard & Store Identity

#### 1.1 Admin Header Enhancement

- **File:** `frontend/src/components/AdminDashboard.jsx`
- Add store name and logo display in header
- Implement store switcher dropdown
- Show current active store context

#### 1.2 Switch Store Feature

- **Backend:** Enhance `storeController.js` with user-stores relationship
- **Frontend:** Create StoreSwitcher component
- Add API endpoint: `GET /api/stores/user/:userId`

#### 1.3 White-Label Return Portal

- **Backend:** Create route `/api/returns/portal/:storeSlug`
- **Frontend:** Create `WhiteLabelPortal.jsx`
- Dynamically load store branding (logo, name, colors)
- Remove Re-Route branding from customer-facing pages

---

### Phase 2: Marketplace Integration (Omnichannel)

#### 2.1 Connect Account UI

- **File:** Create `frontend/src/components/MarketplaceConnect.jsx`
- Display marketplace logos (Shopee, Tokopedia, TikTok)
- Show connection status for each
- OAuth popup flow simulation

#### 2.2 Manual Order Entry

- **Backend:** Enhance `orderController.js` - add manual order creation
- **Frontend:** Create `ManualOrderEntry.jsx`
- Form with: Order Number, Customer Name, Phone, Product, SKU, Price

#### 2.3 Bulk Upload via CSV

- **Backend:** Enhance `bulkUploadController.js`
- Support CSV format: orderNumber,customerName,customerPhone,productName,productSku,price
- **Frontend:** Create `BulkUpload.jsx` with file drop zone

---

### Phase 3: Professional Features

#### 3.1 Automated Return Label Download

- **Backend:** Enhance `labelService.js` - add PDF generation
- Add barcode visualization using library (JsBarcode)
- **Frontend:** Add "Download Label" button in ReturnPortal
- Generate downloadable PDF/HTML label

#### 3.2 AI Smart Disposition Dashboard

- **Backend:** Enhance `dispositionController.js` - add analysis triggers
- **Frontend:** Create `AIDispositionPanel.jsx`
- Display: Restock/Repair/Write-off recommendations
- Show confidence score and reasoning
- Add admin override capability

#### 3.3 Internal Resolution Center

- **Backend:** Enhance `chatController.js` - add conversation management
- **Frontend:** Create `ResolutionCenter.jsx`
- Chat interface between Admin and Customer
- Link conversations to specific return requests
- Message status (read/unread)

---

### Phase 4: Business & Monetization (Owner Dashboard)

#### 4.1 Revenue Dashboard

- **Backend:** Already implemented in `revenueController.js`
- **Frontend:** Create `RevenueDashboard.jsx` for platform owner
- Display:
  - Total subscription revenue (MRR)
  - Service fee per transaction
  - Logistics kickback estimates
  - Revenue trends chart

#### 4.2 Fraud Detection Dashboard

- **Backend:** Already implemented in `fraudController.js`
- **Frontend:** Create `FraudDashboard.jsx`
- Display alerts by severity
- Customer risk scores
- Pattern detection results

---

## 📁 Files to Create/Modify

### New Files:

```
frontend/src/components/
├── StoreSwitcher.jsx          # Store switching dropdown
├── WhiteLabelPortal.jsx       # Branded customer return portal
├── MarketplaceConnect.jsx     # Marketplace OAuth UI
├── ManualOrderEntry.jsx       # Manual order form
├── BulkUpload.jsx             # CSV upload component
├── LabelDownload.jsx          # Label/barcode download
├── AIDispositionPanel.jsx     # AI analysis display
├── ResolutionCenter.jsx      # Chat interface
├── RevenueDashboard.jsx       # Owner revenue view
└── FraudDashboard.jsx         # Owner fraud alerts

backend/src/controllers/
└── [existing controllers - enhancement only]
```

### Files to Modify:

```
frontend/src/components/
├── AdminDashboard.jsx         # Add store header, switcher
├── ReturnPortal.jsx           # White-label support
├── App.jsx                    # Add new routes

backend/src/
├── routes/*.js                # Add new endpoints as needed
└── services/*.js              # Enhance existing services
```

---

## 🛠 Tech Stack Recommendations

### For Enhanced Features:

| Feature            | Recommended Library     | Alternative                  |
| ------------------ | ----------------------- | ---------------------------- |
| Barcode Generation | `jsbarcode`             | `bwip-js`                    |
| PDF Labels         | `jspdf` + `html2canvas` | `pdfkit`                     |
| Charts (Revenue)   | `recharts`              | `chart.js`                   |
| CSV Parser         | `papaparse`             | `xlsx`                       |
| Image Analysis     | `tensorFlow.js`         | External API (OpenAI Vision) |
| Real-time Chat     | `socket.io`             | Polling (simpler)            |

### Architecture Improvements:

- Add Redis for caching marketplace tokens
- Use Bull Queue for background jobs (order sync)
- Implement WebSocket for real-time chat
- Add CDN for label/image storage

---

## 📋 Implementation Steps (TODO)

1. [ ] **Admin Header Enhancement**
   - [ ] Add store name/logo display
   - [ ] Create StoreSwitcher component
   - [ ] Wire up store context

2. [ ] **White-Label Portal**
   - [ ] Create dynamic route for store slug
   - [ ] Load store branding dynamically

3. [ ] **Marketplace Connect UI**
   - [ ] Design marketplace connection cards
   - [ ] Implement OAuth flow UI

4. [ ] **Manual Order & Bulk Upload**
   - [ ] Create manual order form
   - [ ] Implement CSV upload parser

5. [ ] **Label Generation**
   - [ ] Add barcode generation
   - [ ] Create downloadable label

6. [ ] **AI Disposition UI**
   - [ ] Display recommendation cards
   - [ ] Add admin actions

7. [ ] **Resolution Center**
   - [ ] Chat interface
   - [ ] Message threading

8. [ ] **Owner Dashboards**
   - [ ] Revenue analytics
   - [ ] Fraud alerts display

---

## ⚠️ Notes

- The current AI disposition is rule-based simulation. For production, integrate with OpenAI Vision API or train a custom ML model.
- Marketplace OAuth requires valid API keys from each platform (Shopee Partner ID, Tokopedia Client ID, TikTok Partner ID).
- Real-time chat requires WebSocket server setup.
- For production, replace SQLite with PostgreSQL for better scalability.

---

_Plan created for Re-Route Platform v2.0 Enhancement_
