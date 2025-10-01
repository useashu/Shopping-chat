'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, AIResponse } from '@/types';
import ChatInput from './ChatInput';
import Message from './Message';
import PhoneCard from './PhoneCard';
import LoadingIndicator from './LoadingIndicator';

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Best camera phone under ₹30k',
    'Compare iPhone 15 vs Galaxy S24',
    'Gaming phones with 120Hz display',
    'Long battery life phones under ₹25k'
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Welcome to MobileGenius! I'm your AI-powered phone shopping assistant. I can help you find the perfect phone based on your needs, compare different models, and explain technical features. What kind of phone are you looking for?",
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, []);
  
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const aiResponse: AIResponse = await response.json();
      
      // Add AI response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        type: aiResponse.phones && aiResponse.phones.length > 0 ? 'phone-recommendation' : 'text',
        phones: aiResponse.phones
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update suggestions if provided
      if (aiResponse.suggestions) {
        setSuggestions(aiResponse.suggestions);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again, or ask me about phone recommendations.",
        timestamp: new Date(),
        type: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <h2 className="text-xl font-semibold">Chat with MobileGenius</h2>
        <p className="text-blue-100 text-sm">Ask me anything about mobile phones!</p>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 chat-scrollbar">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {isLoading && <LoadingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions */}
      {suggestions.length > 0 && !isLoading && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <p className="text-sm text-gray-600 mb-3">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-full border border-blue-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          placeholder="Ask about phones, compare models, or get recommendations..."
        />
      </div>
    </div>
  );
}