import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createChat,
  getChats,
  getMessages,
  sendMessage,
  deleteChat,
  checkHealth,
} from "../api";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [editingMessage, setEditingMessage] = useState(null); // { id, content } for message being edited
  const [failedMessages, setFailedMessages] = useState(new Map()); // Map of messageId -> error info

  // Load chats on app start
  useEffect(() => {
    let isCancelled = false;

    async function fetchChats() {
      setChatsLoading(true);
      try {
        // Check backend health first
        await checkHealth();
        if (isCancelled) return;
        setBackendStatus('online');

        const data = await getChats();
        if (isCancelled) return;
        setChats(data);  

        // Restore chat from URL if chatId exists
        if (chatId && data.length > 0) {
          const chat = data.find(c => c.id === chatId);
          if (chat) {
            setCurrentChat(chat);
            const res = await getMessages(chat.id);
            if (isCancelled) return;
            setMessages(res.messages);
          } else {
            // Chat not found, redirect to home
            if (!isCancelled) navigate('/');
          }
        } else {
          // No chatId in URL, clear current chat and messages
          if (!isCancelled) {
            setCurrentChat(null);
            setMessages([]);
          }
        }
      } catch (err) {
        if (isCancelled) return;
        setBackendStatus('offline');
        setError(err.error || "Failed to connect to backend server");
      } finally {
        if (!isCancelled) {
          setChatsLoading(false);
        }
      }
    }
    
    fetchChats();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not when chatId changes

  // Handle URL changes (browser back/forward) after initial load
  useEffect(() => {
    if (chatsLoading) return; // Don't run during initial load

    let isCancelled = false;

    async function handleChatIdChange() {
      if (chatId) {
        const chat = chats.find(c => c.id === chatId);
        if (chat && chat.id !== currentChat?.id) {
          // Chat exists and is different from current
          setMessages([]);
          setCurrentChat(chat);
          try {
            const data = await getMessages(chat.id);
            if (!isCancelled) {
              setMessages(data.messages);
            }
          } catch {
            if (!isCancelled) {
              setError("Failed to load messages");
            }
          }
        } else if (!chat) {
          // Chat not found, redirect to home
          if (!isCancelled) navigate('/');
        }
      } else if (currentChat) {
        // No chatId in URL but we have a current chat, clear it
        if (!isCancelled) {
          setCurrentChat(null);
          setMessages([]);
        }
      }
    }

    handleChatIdChange();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]); // Run when chatId changes

  // Helper to delete empty chats silently
  async function deleteEmptyChat(chatToCheck) {
    if (!chatToCheck) return;
    
    try {
      // If the chat being checked is the current chat, use messages from state
      // Otherwise, we need to fetch messages to check if empty
      let chatMessages;
      if (currentChat?.id === chatToCheck.id) {
        chatMessages = messages;
      } else {
        // Only fetch if it's a different chat
        const res = await getMessages(chatToCheck.id);
        chatMessages = res.messages;
      }
      
      if (chatMessages.length === 0) {
        await deleteChat(chatToCheck.id);
        setChats((prev) => prev.filter(c => c.id !== chatToCheck.id));
      }
    } catch {
      // Silently fail - don't show error for auto-cleanup
    }
  }

  async function startNewChat() {
    try {
      setError(null);
      
      // Delete previous chat if it's empty
      if (currentChat) {
        await deleteEmptyChat(currentChat);
      }
      
      const chat = await createChat();
      setChats((prev) => [chat, ...prev]);
      setCurrentChat(chat);
      setMessages([]);
      setFailedMessages(new Map()); // Clear failed messages
      navigate(`/chat/${chat.id}`);
    } catch {
      setError("Failed to create chat");
    }
  }


  async function selectChat(chatId) {
    // Delete previous chat if it's empty
    if (currentChat && currentChat.id !== chatId) {
      await deleteEmptyChat(currentChat);
    }
    
    // Just navigate - let the useEffect handle loading messages
    navigate(`/chat/${chatId}`);
  }

  async function handleSendMessage(content, retryUserMessageId = null) {
    if (!currentChat) return;

    setError(null);
    let tempUserId = null;

    // If not retrying, add user message immediately to UI
    if (!retryUserMessageId) {
      tempUserId = `temp-user-${Date.now()}`;
      const tempUserMessage = {
        id: tempUserId,
        role: 'user',
        content: content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);
    }

    setLoading(true);

    try {
      const res = await sendMessage(currentChat.id, content);

      // If retrying, remove the old failed messages
      if (retryUserMessageId) {
        setMessages((prev) => {
          const retryIndex = prev.findIndex(msg => msg.id === retryUserMessageId);
          if (retryIndex === -1) return [...prev, res.userMessage, res.assistantMessage];
          // Remove old user message and everything after it
          return [...prev.slice(0, retryIndex), res.userMessage, res.assistantMessage];
        });
        // Clear failed status
        setFailedMessages((prev) => {
          const newMap = new Map(prev);
          newMap.delete(retryUserMessageId);
          return newMap;
        });
      } else {
        // Replace temp user message with real one and add assistant message
        setMessages((prev) => [
          ...prev.filter(msg => msg.id !== tempUserId),
          res.userMessage,
          res.assistantMessage,
        ]);
      }

      // Update chat title if it was changed
      if (res.updatedTitle && res.updatedTitle !== currentChat.title) {
        setCurrentChat((prev) => ({ ...prev, title: res.updatedTitle }));
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChat.id
              ? { ...chat, title: res.updatedTitle }
              : chat
          )
        );
      }
    } catch (err) {
      const errorMessage = err.error || "Something went wrong";
      const errorCode = err.code || 'UNKNOWN_ERROR';
      
      // If retrying, just update the error for existing message
      if (retryUserMessageId) {
        setFailedMessages((prev) => {
          const newMap = new Map(prev);
          newMap.set(retryUserMessageId, { error: errorMessage, code: errorCode });
          return newMap;
        });
      } else {
        // Mark the temp user message as failed
        setFailedMessages((prev) => {
          const newMap = new Map(prev);
          newMap.set(tempUserId, { error: errorMessage, code: errorCode });
          return newMap;
        });
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditMessage(messageId, newContent) {
    if (!currentChat) return;

    setLoading(true);
    setError(null);

    try {
      // Find the message index to delete everything after it
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return;

      // Remove the old user message and all subsequent messages
      const updatedMessages = messages.slice(0, messageIndex);
      setMessages(updatedMessages);

      // Send the edited message as a new message
      const res = await sendMessage(currentChat.id, newContent);

      setMessages((prev) => [
        ...prev,
        res.userMessage,
        res.assistantMessage,
      ]);

      // Clear editing state
      setEditingMessage(null);
    } catch (err) {
      setError(err.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function startEditingMessage(message) {
    setEditingMessage({ id: message.id, content: message.content });
  }

  function cancelEditingMessage() {
    setEditingMessage(null);
  }

  async function retryMessage(messageId) {
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.role !== 'user') return;
    
    await handleSendMessage(message.content, messageId);
  }

  async function handleDeleteChat(chatId) {
    try {
      setError(null);
      await deleteChat(chatId);
      
      // Remove from local state
      setChats((prev) => prev.filter(c => c.id !== chatId));
      
      // If deleted chat was currently open, clear it and redirect
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
        navigate('/');
      }
    } catch {
      setError("Failed to delete chat");
    }
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        messages,
        loading,
        chatsLoading,
        error,
        backendStatus,
        editingMessage,
        failedMessages,
        startNewChat,
        selectChat,
        handleSendMessage,
        handleEditMessage,
        startEditingMessage,
        cancelEditingMessage,
        handleDeleteChat,
        retryMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
