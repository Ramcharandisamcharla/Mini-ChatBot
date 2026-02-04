// routes/chats.js
import express from "express";
import { v4 as uuid } from "uuid";
import validator from "validator";
import db from "../db/index.js";
import { generateAIResponse } from "../services/aiService.js";

const router = express.Router();

// POST /api/chats
router.post("/", (req, res) => {
  const id = uuid();
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO chats (id, title, createdAt) VALUES (?, ?, ?)`
  ).run(id, "New Chat", createdAt);

  res.status(201).json({ id, title: "New Chat", createdAt });
});

// GET /api/chats
router.get("/", (req, res) => {
  const chats = db
    .prepare(`SELECT * FROM chats ORDER BY createdAt DESC`)
    .all();

  res.json(chats);
});

// GET /api/chats/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const chat = db
    .prepare(`SELECT * FROM chats WHERE id = ?`)
    .get(id);

  if (!chat) {
    return res.status(404).json({
      error: "Chat not found",
      code: "NOT_FOUND",
    });
  }

  const messages = db
    .prepare(
      `SELECT * FROM messages WHERE chatId = ? ORDER BY createdAt ASC`
    )
    .all(id);

  res.json({ chat, messages });
});

// POST /api/chats/:id/messages
router.post("/:id/messages", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  // Validation
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({
      error: "Message cannot be empty",
      code: "INVALID_INPUT",
    });
  }

  // Sanitize input to prevent XSS attacks
  const sanitizedContent = validator.escape(content.trim());

  if (sanitizedContent.length > 2000) {
    return res.status(400).json({
      error: "Message too long",
      code: "INVALID_INPUT",
    });
  }

  const chat = db
    .prepare(`SELECT * FROM chats WHERE id = ?`)
    .get(id);

  if (!chat) {
    return res.status(404).json({
      error: "Chat not found",
      code: "NOT_FOUND",
    });
  }

  // Save user message
  const userMessageId = uuid();
  const userCreatedAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO messages (id, chatId, role, content, createdAt)
     VALUES (?, ?, ?, ?, ?)`
  ).run(userMessageId, id, "user", sanitizedContent, userCreatedAt);

  // Update chat title from first message
  let updatedTitle = chat.title;
  if (chat.title === "New Chat") {
    updatedTitle = sanitizedContent.slice(0, 40);
    db.prepare(
      `UPDATE chats SET title = ? WHERE id = ?`
    ).run(updatedTitle, id);
  }

  // Fetch conversation so far
  const conversation = db.prepare(
    `SELECT role, content FROM messages WHERE chatId = ? ORDER BY createdAt ASC`
  ).all(id);

  // Generate AI response
  try {
    const aiReply = await generateAIResponse(conversation);

    const assistantContent =
      aiReply ||
      "Sorry, I'm having trouble responding right now. Please try again.";

    // Save assistant message
    const assistantMessageId = uuid();
    const assistantCreatedAt = new Date().toISOString();

    db.prepare(
      `INSERT INTO messages (id, chatId, role, content, createdAt)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      assistantMessageId,
      id,
      "assistant",
      assistantContent,
      assistantCreatedAt
    );

    // Return both messages and updated title
    res.status(201).json({
      userMessage: {
        id: userMessageId,
        role: "user",
        content: sanitizedContent,
        createdAt: userCreatedAt,
      },
      assistantMessage: {
        id: assistantMessageId,
        role: "assistant",
        content: assistantContent,
        createdAt: assistantCreatedAt,
      },
      updatedTitle,
    });
  } catch (aiError) {
    // Return error with specific code for frontend to handle
    return res.status(503).json({
      error: aiError.message || 'Unable to generate response. Please try again.',
      code: aiError.code || 'AI_ERROR',
      userMessage: {
        id: userMessageId,
        role: "user",
        content: sanitizedContent,
        createdAt: userCreatedAt,
      },
    });
  }
});

// DELETE /api/chats/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const chat = db
    .prepare(`SELECT * FROM chats WHERE id = ?`)
    .get(id);

  if (!chat) {
    return res.status(404).json({
      error: "Chat not found",
      code: "NOT_FOUND",
    });
  }

  // Delete all messages associated with this chat
  db.prepare(`DELETE FROM messages WHERE chatId = ?`).run(id);

  // Delete the chat itself
  db.prepare(`DELETE FROM chats WHERE id = ?`).run(id);

  res.json({ message: "Chat deleted successfully", id });
});

export default router;
