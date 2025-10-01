'use client';

export default function LoadingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-3xl px-4 py-3 rounded-2xl bg-white text-gray-800 shadow-sm border border-gray-200 mr-12">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-2">
            <span className="text-white text-xs">🤖</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">MobileGenius</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-gray-500">Thinking...</span>
        </div>
      </div>
    </div>
  );
}