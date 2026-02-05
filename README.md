# MiniChatbot — Fullstack AI Chat Application

A lightweight ChatGPT-style web application demonstrating clean architecture, robust error handling, and production-ready engineering practices.

The goal of this project is not feature quantity, but **clean architecture**, **correctness**, **edge-case handling**, and **production-ready thinking**.

---

## 🚀 Live URLs

**Frontend (Vercel):https://mini-chatbot-sand.vercel.app

**Backend API (Render):https://chatbot-backend-13rz.onrender.com/health

> **Note:** The backend is hosted on Render’s free tier, which may briefly go to sleep after inactivity; on the first request it may take a few seconds to wake up.

> **Local Development:**  
> Frontend: `http://localhost:5173`  
> Backend: `http://localhost:3001`  
> Health Check: `http://localhost:3001/health`

---

## 🧠 Overview

This application allows users to:

- ✅ Create new chat sessions
- ✅ Send messages and receive AI (or mock AI) responses
- ✅ View and continue previous conversations
- ✅ Persist chat history across page refreshes
- ✅ Delete conversations
- ✅ Interact with a responsive, polished chat UI with dark/light themes
- ✅ Monitor backend connection status in real-time

**AI orchestration, validation, and persistence are handled entirely on the backend.**

---

## 🛠 Tech Stack

### Frontend
- **React 19.2** (Vite) - Modern UI library with fast HMR
- **Tailwind CSS 3.4** - Utility-first styling
- **React Router 7.13** - Client-side routing
- **React Context API** - State management
- **Fetch API** - HTTP client with retry logic

### Backend
- **Node.js** with **Express 5.2** - RESTful API server
- **better-sqlite3 12.6** - Embedded SQL database
- **express-rate-limit 8.2** - Request throttling
- **validator 13.15** - Input sanitization
- **CORS 2.8** - Cross-origin security
- **dotenv 17.2** - Environment configuration

### AI Layer
- **OpenAI API** (gpt-3.5-turbo) - AI responses (backend only)
- **Mock AI fallback** when API key is not configured

---

## ✨ Features Implemented

### Chat UI
- ✅ Chat-style interface with user vs assistant messages
- ✅ Enter to send, auto-scroll to latest message
- ✅ Disabled send on empty/whitespace-only input
- ✅ **Edit and resend messages** - Click edit icon on user messages to modify and regenerate AI response
- ✅ Loading indicator with animated typing dots
- ✅ Inline error handling inside chat UI
- ✅ Message timestamps
- ✅ Responsive layout (mobile & desktop)
- ✅ Dark/Light theme toggle with system preference detection
- ✅ Backend connection status indicator

### Chats & History
- ✅ Create new chats (auto-cleanup of empty chats)
- ✅ List previous chats with loading skeleton
- ✅ Chat titles auto-generated from first user message (40 char limit)
- ✅ **Real-time title update** in sidebar after first message
- ✅ Click a chat to load its messages
- ✅ Delete conversations with confirmation
- ✅ Chats persist across page refresh
- ✅ URL-based chat navigation (`/chat/:chatId`)

### Error Handling & Reliability
- ✅ **Auto-retry** on network failures (3 attempts, exponential backoff)
- ✅ **Timeout handling** (30s default, 45s for AI responses)
- ✅ **Offline detection** with user-friendly error messages
- ✅ Empty chat state handling
- ✅ Invalid chat ID handling
- ✅ Rate limiting (100 req/15min, 10 msg/min)
- ✅ Input validation and XSS sanitization
- ✅ Message length limits (2000 characters)
- ✅ Request size limits (10KB)

---

## 📡 Backend API

### Health Check
```
GET /health
→ { "status": "ok" }
```

### Chats
```
POST   /api/chats                    → Create new chat
GET    /api/chats                    → List all chats
GET    /api/chats/:id                → Get chat with messages
DELETE /api/chats/:id                → Delete chat
POST   /api/chats/:id/messages       → Send message, get AI response
```

### Response Format
**Success:**
```json
{
  "userMessage": { "id": "...", "role": "user", "content": "...", "createdAt": "..." },
  "assistantMessage": { "id": "...", "role": "assistant", "content": "...", "createdAt": "..." },
  "updatedTitle": "Chat title..."
}
```

**Error:**
```json
{
  "error": "Message too long",
  "code": "INVALID_INPUT"
}
```

---

## 🗄️ Data Model

### Chat
- `id` 
- `title` 
- `createdAt` 

### Message
- `id` 
- `chatId` 
- `role` 
- `content` 
- `createdAt` 

---

## 🤖 AI Integration

**AI calls occur only on the backend** for security and control.

**System Prompt:**
```
"You are a helpful assistant."
```

**Full conversation history** is sent to maintain context across messages.

### Mock AI Fallback

If `AI_API_KEY` is not configured, the backend returns:
```
"This is a mock AI response. AI API key is not configured."
```

**Why Mock AI?**
- ✅ Prevents accidental API costs
- ✅ Allows testing without API keys
- ✅ Ensures app remains functional in all environments
- ✅ Improves security (no exposed secrets)

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)
```env
PORT=3001
FRONTEND_URL=<YOUR_FRONTEND_URL>
DATABASE_URL=./chat.db
AI_API_KEY=<YOUR_OPENAI_API_KEY>
```

### Frontend (`Frontend/.env`)
```env
VITE_API_URL=<YOUR_BACKEND_API_URL>
```

> ⚠️ **Security:** Never commit `.env` files. Use `.env.example` templates provided.

---

## 🧯 Error Handling & Edge Cases

**Handled on both frontend and backend:**

| Edge Case | Solution |
|-----------|----------|
| Empty/whitespace messages | Blocked client-side, validated server-side |
| Very long messages (>2000 chars) | Rejected with clear error |
| Invalid chat IDs | 404 error with proper message |
| Rapid submissions | Rate limiting (10 msg/min) |
| AI provider failure/timeout | Graceful error message |
| Network failures | Auto-retry with exponential backoff |
| Offline state | Detected and displayed to user |
| Page refresh | Chat state restored from URL |
| Empty chats | Auto-deleted when switching chats |

**Consistent Error Format:**
```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

Error codes: `INVALID_INPUT`, `NOT_FOUND`, `RATE_LIMIT`, `TIMEOUT`, `NETWORK_ERROR`, `OFFLINE`

---

## 🧠 Architectural Decisions

### Backend as Source of Truth
All persistence, validation, and AI orchestration live on the backend. Frontend is a pure presentation layer.

### AI Isolation
Frontend **never** accesses AI providers or secrets. All AI logic is server-side.

### Context API for State Management
Chosen for simplicity and clarity. Easy to migrate to Redux/Zustand if needed.

### SQLite for Fast Setup
Schema designed for easy migration to PostgreSQL for production scaling.

### Mock AI Fallback
Improves reliability, security, and cost control without sacrificing functionality.

### Auto-Retry with Exponential Backoff
Network failures are automatically retried (1s, 2s, 4s delays) for better UX.

### Real-time Title Updates
Chat titles update immediately in sidebar when first message is sent (no need to switch chats).

### Health Check Monitoring
Frontend pings `/health` endpoint on startup to verify backend connectivity.

---

## 🛠 Local Setup

### Prerequisites
- Node.js v16 or higher
- npm or yarn

### Installation

**1. Clone & Navigate**
```bash
git clone <repository-url>
cd Minichatbot
```

**2. Backend Setup**
```bash
cd Backend
npm install
# Copy the example .env file and add your OpenAI API key
cp .env.example .env
# Edit .env and replace 'your_openai_api_key_here' with your actual OpenAI API key
npm run dev
```

**3. Frontend Setup**
```bash
cd Frontend
npm install
# Copy the example .env file
cp .env.example .env
# Edit .env if your backend URL is different from http://localhost:3001
npm run dev
```

**4. Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health: http://localhost:3001/health

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd Frontend
npm run build
# Deploy dist/ folder
```
**Environment Variables:**
- `VITE_API_URL=<your-deployed-backend-url>`

### Backend (Render/Railway/Heroku)
```bash
cd Backend
npm start
```
**Environment Variables:**
- `PORT` (auto-assigned by platform)
- `FRONTEND_URL=<your-deployed-frontend-url>`
- `DATABASE_URL=./chat.db` (or PostgreSQL URL)
- `AI_API_KEY=<your-openai-api-key>`

### Production Considerations
- ✅ Replace SQLite with PostgreSQL for scalability
- ✅ Use process manager (PM2) for Node.js
- ✅ Enable HTTPS on both services
- ✅ Configure CORS to production domain only
- ✅ Use Redis for distributed rate limiting
- ✅ Implement proper logging (Winston/Pino)
- ✅ Add authentication/authorization
- ✅ Implement message pagination

---

## ⚖️ Trade-offs & Known Limitations

### Database
- **SQLite** used for simplicity and fast setup
  - ❌ Synchronous (blocks event loop)
  - ❌ Not suitable for horizontal scaling
  - ❌ Limited concurrent write performance
  - ✅ **Production:** Migrate to PostgreSQL/MySQL

### Security
- ❌ No user authentication/authorization (intentionally out of scope)
- ❌ Rate limiting is IP-based (can be bypassed with proxies)
- ✅ Input sanitization prevents XSS attacks
- ✅ Request size limits prevent large payload attacks
- ✅ CORS properly configured
- ✅ AI keys never exposed to client

### Features Not Implemented
- ❌ Message pagination (all messages loaded at once)
- ❌ Message search functionality
- ❌ File/image upload
- ❌ Real-time updates via WebSockets
- ❌ User profiles or multi-user support
- ❌ AI streaming responses
- ❌ Conversation context limits (could hit token limits on very long chats)

### Performance
- ❌ No server-side caching
- ❌ No CDN for static assets
- ✅ Client-side retry logic with exponential backoff
- ✅ Request timeouts prevent hanging connections
- ✅ Loading states for better UX
- ✅ Auto-scroll optimization

---

## 📌 Summary

This project demonstrates:

✅ **Full-stack system design** - Clean separation of concerns  
✅ **RESTful API development** - Proper HTTP methods and status codes  
✅ **Secure AI integration** - Backend-only AI calls, mock fallback  
✅ **Edge case handling** - Comprehensive validation and error handling  
✅ **Production-oriented engineering** - Rate limiting, timeouts, retries, health checks  
✅ **Clean code practices** - Modular architecture, readable code  
✅ **User experience focus** - Loading states, error messages, responsive design  

---

## 👤 Author

Disamcharla Ram Charan  
Computer Science Engineering Student  
Full-Stack Developer (React, Node.js, AI-driven systems)

**Contact:**  
- GitHub:  
- LinkedIn:   
- Email: charandisamcharla@gmail.com

---

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

