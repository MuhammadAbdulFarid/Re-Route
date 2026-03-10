# Re-Route - Reverse Logistics Platform for UMKMs

A comprehensive reverse logistics management platform for small and medium businesses (UMKMs) in Indonesia. Re-Route enables businesses to manage product returns efficiently with professional features including AI-powered disposition, marketplace integrations, and automated return label generation.

## ✨ Features

### 1. Multi-Role Dashboard & Store Identity

- **Store Switcher**: Manage multiple brands/stores from a single admin account
- **White-Label Portal**: Branded return page for customers (e.g., `yourtstore.reroute.id/returns`)
- **Professional UI**: Modern SaaS-like interface

### 2. Marketplace Integration (Omnichannel)

- **Shopee Integration**: Connect and sync orders automatically
- **Tokopedia Integration**: Order and return synchronization
- **TikTok Shop Integration**: E-commerce platform support
- **Manual Order Entry**: For WhatsApp/Offline sales
- **Bulk Upload**: CSV/Excel import for order data

### 3. Professional Features

- **Automated Return Label**: Generate downloadable shipping labels with barcode
- **AI Smart Disposition**: Automatic recommendation (Restock/Repair/Write-off)
- **Internal Resolution Center**: Chat system between merchant and customer

### 4. Business & Monetization (Platform Owner)

- **Revenue Dashboard**: Monitor subscription fees, service fees, logistics kickback
- **Fraud Detection**: Alert system for suspicious return patterns

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

```bash
cd re-route
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Set up database**

```bash
cd ../backend
npx prisma migrate dev
npx prisma seed
```

5. **Start the backend server**

```bash
npm run dev
# Server runs on http://localhost:3001
```

6. **Start the frontend**

```bash
cd ../frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📱 Application Routes

| Route                  | Description               |
| ---------------------- | ------------------------- |
| `/`                    | Main return portal        |
| `/returns/:storeSlug`  | White-label return portal |
| `/login`               | User login                |
| `/admin`               | Admin dashboard           |
| `/admin/marketplace`   | Marketplace connections   |
| `/admin/orders/manual` | Manual order entry        |
| `/admin/orders/bulk`   | Bulk CSV upload           |
| `/admin/chat`          | Resolution center         |
| `/admin/ai-analysis`   | AI disposition            |
| `/owner/revenue`       | Revenue dashboard (owner) |
| `/owner/fraud`         | Fraud detection (owner)   |

---

## 🛠️ Tech Stack

### Frontend

- React 18 + Vite
- Tailwind CSS
- React Router 6
- Axios
- Recharts

### Backend

- Express.js
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- Multer (file uploads)

---

## 📁 Project Structure

```
re-route/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── PROJECT_PLAN.md
├── TECHNICAL_DOCUMENTATION.md
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
DATABASE_URL="file:./dev.db"

# Marketplace API Keys (optional - for production)
SHOPEE_PARTNER_ID=your_shopee_partner_id
SHOPEE_REDIRECT_URI=http://localhost:3001/api/marketplace/callback
TOKOPEDIA_CLIENT_ID=your_tokopedia_client_id
TOKOPEDIA_REDIRECT_URI=http://localhost:3001/api/marketplace/callback
TIKTOK_PARTNER_ID=your_tiktok_partner_id
TIKTOK_REDIRECT_URI=http://localhost:3001/api/marketplace/callback
```

---

## 📊 Database Schema

The platform uses the following main entities:

- **PlatformOwner**: Platform administrator
- **User**: Merchant/admin accounts
- **Store**: Multiple stores per merchant
- **Order**: Customer orders from various sources
- **ReturnRequest**: Return requests with status tracking
- **MarketplaceConnection**: OAuth connections to marketplaces
- **Transaction**: Revenue tracking
- **FraudAlert**: Suspicious activity detection
- **Conversation/Message**: Internal chat system
- **ReturnDisposition**: AI analysis results

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

Re-Route Team - Reverse Logistics SaaS Platform for Indonesian UMKMs
