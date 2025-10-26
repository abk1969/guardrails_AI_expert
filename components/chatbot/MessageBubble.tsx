import React from 'react';
import { Message } from './Chatbot';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    return (
        <div className={`message-bubble ${message.sender}`}>
            {message.text}
        </div>
    );
};

export default MessageBubble;