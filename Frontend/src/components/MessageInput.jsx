import { useState, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";

export default function MessageInput() {
  const { handleSendMessage, handleEditMessage, editingMessage, cancelEditingMessage, loading } = useChat();
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Populate input when entering edit mode
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      // Focus the textarea after setting text
      textareaRef.current?.focus();
    }
    // Only run when editingMessage.id changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMessage?.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || loading) return;

    const messageText = text;
    setText(""); // Clear input immediately

    if (editingMessage) {
      await handleEditMessage(editingMessage.id, messageText);
    } else {
      await handleSendMessage(messageText);
    }
  }

  function handleCancel() {
    cancelEditingMessage();
    setText("");
  }

  return (
    <div className="fixed md:relative bottom-0 left-0 right-0 md:left-auto md:right-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10">
      {editingMessage && (
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Editing message</span>
          </div>
          <button
            onClick={handleCancel}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            type="button"
          >
            Cancel
          </button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4"
      >
        <div className="flex gap-2 md:gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder="Send a message..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 max-h-32"
            style={{
              minHeight: '44px',
              height: 'auto'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="p-2 md:p-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            style={{ minHeight: '44px', minWidth: '44px' }}
            title={editingMessage ? "Update message" : "Send message"}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 text-center mt-1.5 md:mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </form>
    </div>
  );
}
