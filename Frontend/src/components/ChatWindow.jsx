import { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import Message from "./Message";
import MessageInput from "./MessageInput";

export default function ChatWindow() {
  const { currentChat, messages, loading, error } = useChat();
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  // Track if user has scrolled up
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    shouldAutoScrollRef.current = isAtBottom;
  };

  // Auto-scroll to bottom when messages change (only if user hasn't scrolled up)
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 p-8">
        <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Start a conversation</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Select a chat or create a new one to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#212121] overflow-hidden md:min-h-0">
      {/* Messages - Responsive container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="absolute md:relative top-14 md:top-0 left-0 right-0 bottom-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 pb-32 md:pb-0 md:flex-1 md:min-h-0 overscroll-none"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
          {messages.length === 0 && !loading && (
            <div className="text-center py-8 md:py-12">
              <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Start the conversation
              </p>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="flex gap-2 md:gap-3 justify-start">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <div className="flex items-center">
                  <div className="flex gap-1 items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 md:p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
}
