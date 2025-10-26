import React, { useState, useRef, useEffect } from 'react';
import { Message } from './Chatbot';
import MessageBubble from './MessageBubble';
import { X, Send } from 'lucide-react';

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onSendMessage: (input: string) => void;
    isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className={`chat-window bg-gray-800 border border-gray-700 ${isOpen ? 'open' : 'closed'}`}>
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
                <h3 className="text-lg font-bold text-white">Assistant de Gouvernance IA</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
            </header>

            {/* Message List */}
            <div className="message-list">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <div className="message-bubble bot">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <footer className="p-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question..."
                        className="w-full bg-gray-700 border-gray-600 rounded-full py-2 px-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="p-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 disabled:bg-gray-600"
                        disabled={isLoading || !input.trim()}
                        aria-label="Envoyer"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatWindow;
