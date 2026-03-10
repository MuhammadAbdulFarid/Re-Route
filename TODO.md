# TODO - Chat with Admin Feature

## 1. Schema Update

- [x] Add `chatStatus` field to Conversation model (bot, waiting_admin, active, resolved)
- [x] Change database from SQLite to PostgreSQL

## 2. Backend - chatController.js

- [x] Add endpoint to update chat status (bot → waiting_admin) - `requestAdminChat`
- [x] Add endpoint to get conversations by chatStatus for admin - `getAdminConversations`
- [x] Add endpoint to accept chat (waiting_admin → active) - `acceptChat`
- [x] Add endpoint to send message and auto-update status to "active"

## 3. Backend - chatRoutes.js

- [x] Add new routes:
  - POST `/api/chat/request-admin` - Client requests admin
  - GET `/api/chat/admin/conversations` - Admin gets waiting_admin/active chats
  - POST `/api/chat/accept-chat` - Admin accepts chat

## 4. Frontend - CustomerService.jsx (Client Side)

- [x] Add "Hubungi Admin" button
- [x] Add state management for chatStatus (bot, waiting_admin, active, resolved)
- [x] Show different UI based on chatStatus
- [x] Show status badge in header

## 5. Frontend - ResolutionCenter.jsx (Admin Side)

- [x] Add polling mechanism for real-time updates (onSnapshot-like with setInterval)
- [x] Filter to show only "waiting_admin" or "active" conversations
- [x] Add status indicator for each conversation
- [x] Add "Terima Percakapan" button for waiting_admin chats
- [x] Add filter tabs (Semua, Menunggu, Aktif)

## 6. API Service Updates

- [x] Add new API endpoints to api.js:
  - `requestAdminChat`
  - `getAdminConversations`
  - `acceptChat`

## 7. Environment Configuration

- [x] Create .env file for PostgreSQL connection
- [x] Update schema.prisma datasource to PostgreSQL

## Usage Flow:

1. Client starts chat → status is "bot"
2. Client clicks "Hubungi Admin" → status changes to "waiting_admin"
3. Admin sees conversation in waiting list → clicks "Terima Percakapan"
4. Status changes to "active" → both can chat in real-time
