import React from 'react';
import { Bot } from 'lucide-react';
import Button from '../ui/Button';

interface ChatbotFabProps {
    onClick: () => void;
}

const ChatbotFab: React.FC<ChatbotFabProps> = ({ onClick }) => {
    return (
        <div className="chatbot-fab">
            <Button
                onClick={onClick}
                className="rounded-full w-16 h-16 shadow-lg"
                aria-label="Ouvrir l'assistant IA"
            >
                <Bot size={28} />
            </Button>
        </div>
    );
};

export default ChatbotFab;