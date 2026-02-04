import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import healthRoute from "./routes/health.js";
import chatRoutes from "./routes/chat.js";
import { FRONTEND_URL } from "./config/config.js";

const app = express();

// Request size limit to prevent large payload attacks
app.use(express.json({ limit: '10kb' }));

// General rate limiter for all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for message sending
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit to 10 messages per minute per IP
  message: { error: 'Too many messages, please slow down.', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Apply rate limiters
app.use('/api/', apiLimiter);

app.use("/", healthRoute);
app.use("/api/chats", chatRoutes);

// Apply stricter rate limit to message sending
app.use('/api/chats/:id/messages', messageLimiter);

export default app;
