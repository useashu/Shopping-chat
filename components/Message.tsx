'use client';

import { ChatMessage } from '@/types';

interface MessageProps {
  message: ChatMessage;
  isLatest?: boolean;
}

export default function Message({ message, isLatest = false }: MessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl px-4 py-3 rounded-2xl ${
        isUser 
          ? 'bg-blue-600 text-white ml-12'
          : 'bg-white text-gray-800 shadow-sm border border-gray-200 mr-12'
      }`}>
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs">🤖</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">MobileGenius</span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {message.phones && message.phones.length > 0 && (
          <div className="mt-4 space-y-3">
            {message.phones.slice(0, 3).map((phone) => (
              <div key={phone.id} className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{phone.name}</h4>
                  <span className="text-lg font-bold text-green-600">₹{phone.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Display:</span> {phone.specs.display.size} {phone.specs.display.type}</p>
                  <p><span className="font-medium">Camera:</span> {phone.specs.camera.rear.primary} main</p>
                  <p><span className="font-medium">Battery:</span> {phone.specs.battery.capacity}</p>
                  <p><span className="font-medium">Processor:</span> {phone.specs.processor.chipset}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {phone.features.slice(0, 4).map((feature, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-gray-400 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}