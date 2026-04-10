import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  storyContext?: {
    title: string;
    concept: string;
    currentPage?: number;
    currentText?: string;
  };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ storyContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: input.trim(),
        context: storyContext,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.data.response || response.data.message || 'I apologize, but I couldn\'t generate a response.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI chat error:', error);
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: error?.response?.data?.message || error?.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clean up any markdown formatting that might slip through
  const formatMessage = (text: string): string => {
    return text
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold markdown
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // Remove italic markdown
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove bullet points and replace with clean format
      .replace(/^[-*]\s+/gm, '• ')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, (match) => {
        return match.replace(/```\w*\n?/g, '').trim();
      })
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  return (
    <>
      {/* AI Assistant Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-50"
        aria-label="AI Assistant"
      >
        <FaRobot className="text-xl" />
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div
          className={`fixed bg-white shadow-2xl flex flex-col z-50 border border-gray-200 transition-all duration-300 ${isFullscreen
            ? 'inset-4 sm:inset-6 md:inset-10 rounded-xl'
            : 'bottom-24 right-6 w-96 h-[500px] rounded-lg'
            }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaRobot className="text-base sm:text-lg" />
              <h3 className="font-semibold text-sm sm:text-base">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              {/* Fullscreen Toggle Button */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:text-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-lg font-bold"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? '⊟' : '⛶'}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsFullscreen(false);
                }}
                className="text-white hover:text-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <FaRobot className="text-4xl mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Hi! Ask me anything.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200 bg-white sm:rounded-b-lg">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] min-h-[44px]"
              >
                <FaPaperPlane className="text-sm sm:text-base" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
