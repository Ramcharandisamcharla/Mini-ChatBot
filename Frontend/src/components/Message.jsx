import { useChat } from "../context/ChatContext";

export default function Message({ message }) {
  const { startEditingMessage, loading, failedMessages, retryMessage } = useChat();
  const isUser = message.role === "user";
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const failedInfo = failedMessages?.get(message.id);
  const hasFailed = !!failedInfo;

  return (
    <div className={`flex gap-2 md:gap-3 group ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar - Left side for assistant */}
      {!isUser && (
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-600 dark:bg-green-500">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </div>
      )}

      {/* Message Content */}
      <div className="max-w-[85%] sm:max-w-md md:max-w-lg lg:max-w-xl space-y-1">
        <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {!isUser && (
            <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">
              Assistant
            </span>
          )}
          {isUser && !hasFailed && (
            <button
              onClick={() => startEditingMessage(message)}
              disabled={loading}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit message"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">{time}</span>
          {isUser && (
            <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">
              You
            </span>
          )}
        </div>
        
        {/* Message text */}
        <div className={`text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words ${isUser ? 'text-right' : 'text-left'}`}>
          {message.content}
        </div>
        
        {/* Error state for failed messages */}
        {hasFailed && (
          <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs md:text-sm text-red-600 dark:text-red-400">
                  {failedInfo.code === 'NETWORK_ERROR' && 'Network error'}
                  {failedInfo.code === 'TIMEOUT' && 'Request timed out'}
                  {failedInfo.code === 'OFFLINE' && 'No internet connection'}
                  {!['NETWORK_ERROR', 'TIMEOUT', 'OFFLINE'].includes(failedInfo.code) && failedInfo.error}
                </p>
              </div>
              <button
                onClick={() => retryMessage(message.id)}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Retry"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar - Right side for user */}
      {isUser && (
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600 dark:bg-blue-500">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}