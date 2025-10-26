import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import { useAllContexts } from '../../hooks/useAllContexts';
import { runAgenticQuery } from '../../services/agenticService';
import { X, Send, Bot } from 'lucide-react';

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

interface ChatbotProps {
    onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'initial-message',
            text: "Bonjour ! Je suis votre assistant de gouvernance IA. Posez-moi une question sur les données de l'application.",
            sender: 'bot',
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const getAllContexts = useAllContexts();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Draggable and Resizable state
    const [size, setSize] = useState({ w: 450, h: 600 });
    const [position, setPosition] = useState({ x: window.innerWidth - 470, y: 60 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSendMessage = async (userInput: string) => {
        if (!userInput.trim()) return;

        const userMessage: Message = { id: `user-${Date.now()}`, text: userInput, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const appContext = getAllContexts();
            const botResponseText = await runAgenticQuery(userInput, appContext);
            const botMessage: Message = { id: `bot-${Date.now()}`, text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Agentic query failed:", error);
            const errorMessage: Message = { id: `bot-error-${Date.now()}`, text: "Désolé, une erreur est survenue.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
        setInput('');
    };

    // Drag and Resize handlers
    const handleDragStart = (e: React.MouseEvent<HTMLElement>) => {
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleResizeStart = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation(); // Prevent drag from starting
        setIsResizing(true);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            let newX = e.clientX - dragOffset.current.x;
            let newY = e.clientY - dragOffset.current.y;

            // Constrain position within viewport
            newX = Math.max(0, Math.min(newX, window.innerWidth - size.w));
            newY = Math.max(0, Math.min(newY, window.innerHeight - size.h));

            setPosition({ x: newX, y: newY });
        }
        if (isResizing) {
            let newW = e.clientX - position.x;
            let newH = e.clientY - position.y;
            
            // Constrain size
            newW = Math.max(350, Math.min(newW, window.innerWidth - position.x));
            newH = Math.max(400, Math.min(newH, window.innerHeight - position.y));

            setSize({ w: newW, h: newH });
        }
    }, [isDragging, isResizing, position.x, position.y, size.w, size.h]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);


    return (
        <div
            className="chatbot-popup"
            style={{
                width: `${size.w}px`,
                height: `${size.h}px`,
                transform: `translate(${position.x}px, ${position.y}px)`
            }}
        >
            <header
                className="chatbot-popup-header flex items-center justify-between p-3 border-b border-gray-700 flex-shrink-0"
                onMouseDown={handleDragStart}
            >
                <h3 className="text-md font-bold text-white flex items-center select-none">
                    <Bot className="mr-2 text-cyan-400" size={20} />
                    Assistant IA
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white z-10">
                    <X size={20} />
                </button>
            </header>

            <div className="message-list">
                {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                {isLoading && (
                    <div className="message-bubble bot">
                        <div className="typing-indicator"><span></span><span></span><span></span></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-3 border-t border-gray-700 bg-gray-800 flex-shrink-0">
                <form onSubmit={handleSubmit} className="chatbot-input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question..."
                        className="chatbot-input"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="chatbot-send-btn"
                        disabled={isLoading || !input.trim()}
                        aria-label="Envoyer"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </footer>
            
            <div className="chatbot-resize-handle" onMouseDown={handleResizeStart}></div>
        </div>
    );
};

export default Chatbot;