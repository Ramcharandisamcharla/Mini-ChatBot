import { useChat } from "../context/ChatContext";

export default function ChatList({ onClose }) {
  const { chats, currentChat, chatsLoading, startNewChat, selectChat, handleDeleteChat } = useChat();

  return (
    <div className="w-64 h-full md:h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-[#212121] pt-14 md:pt-0">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Chats</h2>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => {
            startNewChat();
            onClose?.();
          }}
          className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chatsLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No conversations yet
            </p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recent Chats
              </h3>
            </div>
            <div className="p-2 space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 rounded-lg transition-colors ${
                    currentChat?.id === chat.id
                      ? "bg-gray-200 dark:bg-gray-800"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <button
                    onClick={() => {
                      selectChat(chat.id);
                      onClose?.();
                    }}
                    className="flex-1 text-left px-3 py-2.5 text-sm truncate text-gray-900 dark:text-gray-100"
                    title={chat.title}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span className="truncate">{chat.title || "Untitled Chat"}</span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${chat.title}"?`)) {
                        handleDeleteChat(chat.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
