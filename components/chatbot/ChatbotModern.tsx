import React, { useState, useRef, useEffect } from 'react';
import {
  X, Maximize2, Minimize2, Send, RotateCcw, Copy, ThumbsUp, ThumbsDown,
  MessageSquare, Clock, Settings, Download, Sparkles, Zap, BookOpen,
  Search, Filter, Star, Trash2, MoreVertical
} from 'lucide-react';
import { runAgenticQuery } from '../../services/agenticService';
import { useAllContexts } from '../../hooks/useAllContexts';
import './ChatbotModern.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  favorite?: boolean;
  reaction?: 'like' | 'dislike';
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

type ChatMode = 'normal' | 'expert' | 'concise';
type TabView = 'chat' | 'history' | 'settings';

interface ChatbotModernProps {
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { icon: <Sparkles size={16} />, text: "Explique-moi les risques d'injection de prompt", category: "Sécurité" },
  { icon: <Zap size={16} />, text: "Comment tester mes guardrails?", category: "Test" },
  { icon: <BookOpen size={16} />, text: "Quelles sont les meilleures pratiques OWASP LLM?", category: "Bonnes pratiques" },
];

const ChatbotModern: React.FC<ChatbotModernProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabView>('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('normal');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 🔥 NEW: Get all application context for intelligent responses
  const getAllContexts = useAllContexts();

  useEffect(() => {
    // Charger les conversations depuis localStorage
    const saved = localStorage.getItem('chatbot_conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        lastUpdated: new Date(c.lastUpdated),
        messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      })));
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveConversations = (convs: Conversation[]) => {
    localStorage.setItem('chatbot_conversations', JSON.stringify(convs));
    setConversations(convs);
  };

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    const updated = [newConv, ...conversations];
    saveConversations(updated);
    setCurrentConversation(newConv);
    setActiveTab('chat');
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    let conv = currentConversation;
    if (!conv) {
      createNewConversation();
      conv = conversations[0];
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    const updatedMessages = [...(conv?.messages || []), userMessage];
    const updatedConv = {
      ...conv!,
      messages: updatedMessages,
      title: conv!.messages.length === 0 ? messageText.substring(0, 50) + '...' : conv!.title,
      lastUpdated: new Date()
    };

    setCurrentConversation(updatedConv);
    setInputValue('');
    setIsTyping(true);

    try {
      // 🔥 NEW: Use agentic service with full application context
      console.log('💡 Récupération du contexte complet de l\'application...');
      const appContext = getAllContexts();

      // Build context-aware prompt based on mode
      let enhancedMessage = messageText;
      if (chatMode === 'expert') {
        enhancedMessage = `[MODE EXPERT] ${messageText}\n\nFournis une réponse technique détaillée avec références précises aux données.`;
      } else if (chatMode === 'concise') {
        enhancedMessage = `[MODE CONCIS] ${messageText}\n\nRéponds de manière brève et directe.`;
      }

      // Call agentic service with full context
      const response = await runAgenticQuery(enhancedMessage, appContext);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConv = { ...updatedConv, messages: finalMessages };

      setCurrentConversation(finalConv);

      const allConvs = conversations.map(c => c.id === finalConv.id ? finalConv : c);
      if (!allConvs.find(c => c.id === finalConv.id)) {
        allConvs.unshift(finalConv);
      }
      saveConversations(allConvs);
    } catch (error) {
      console.error('Erreur chat:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegenerate = async (messageId: string) => {
    if (!currentConversation) return;

    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const previousUserMessage = currentConversation.messages
      .slice(0, messageIndex)
      .reverse()
      .find(m => m.role === 'user');

    if (previousUserMessage) {
      const newMessages = currentConversation.messages.slice(0, messageIndex);
      setCurrentConversation({ ...currentConversation, messages: newMessages });
      await handleSendMessage(previousUserMessage.content);
    }
  };

  const toggleFavorite = (messageId: string) => {
    if (!currentConversation) return;

    const updated = {
      ...currentConversation,
      messages: currentConversation.messages.map(m =>
        m.id === messageId ? { ...m, favorite: !m.favorite } : m
      )
    };
    setCurrentConversation(updated);

    const allConvs = conversations.map(c => c.id === updated.id ? updated : c);
    saveConversations(allConvs);
  };

  const setReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    if (!currentConversation) return;

    const updated = {
      ...currentConversation,
      messages: currentConversation.messages.map(m =>
        m.id === messageId ? { ...m, reaction: m.reaction === reaction ? undefined : reaction } : m
      )
    };
    setCurrentConversation(updated);

    const allConvs = conversations.map(c => c.id === updated.id ? updated : c);
    saveConversations(allConvs);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportConversation = (format: 'json' | 'markdown' | 'txt') => {
    if (!currentConversation) return;

    let content = '';
    if (format === 'json') {
      content = JSON.stringify(currentConversation, null, 2);
    } else if (format === 'markdown') {
      content = `# ${currentConversation.title}\n\n`;
      currentConversation.messages.forEach(m => {
        content += `## ${m.role === 'user' ? 'Vous' : 'Assistant'}\n${m.content}\n\n`;
      });
    } else {
      currentConversation.messages.forEach(m => {
        content += `${m.role === 'user' ? 'Vous' : 'Assistant'}: ${m.content}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${currentConversation.id}.${format}`;
    a.click();
  };

  const deleteConversation = (convId: string) => {
    const updated = conversations.filter(c => c.id !== convId);
    saveConversations(updated);
    if (currentConversation?.id === convId) {
      setCurrentConversation(null);
    }
  };

  const renderMessage = (message: Message) => (
    <div key={message.id} className={`message-modern ${message.role}`}>
      <div className="message-content-modern">
        <div className="message-text-modern">{message.content}</div>
        <div className="message-actions-modern">
          <button onClick={() => copyToClipboard(message.content)} title="Copier">
            <Copy size={14} />
          </button>
          {message.role === 'assistant' && (
            <>
              <button onClick={() => handleRegenerate(message.id)} title="Régénérer">
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setReaction(message.id, 'like')}
                className={message.reaction === 'like' ? 'active' : ''}
                title="J'aime"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                onClick={() => setReaction(message.id, 'dislike')}
                className={message.reaction === 'dislike' ? 'active' : ''}
                title="Je n'aime pas"
              >
                <ThumbsDown size={14} />
              </button>
            </>
          )}
          <button
            onClick={() => toggleFavorite(message.id)}
            className={message.favorite ? 'active favorite' : ''}
            title="Favori"
          >
            <Star size={14} />
          </button>
        </div>
      </div>
      <div className="message-time-modern">
        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );

  return (
    <div className={`chatbot-modern ${isExpanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="chatbot-modern-header">
        <div className="chatbot-modern-title">
          <MessageSquare size={20} className="text-cyan-400" />
          <span>Assistant IA Guardrails</span>
        </div>
        <div className="chatbot-modern-actions">
          <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Réduire" : "Agrandir"}>
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={onClose} title="Fermer">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="chatbot-modern-tabs">
        <button
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} />
          Chat
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={16} />
          Historique
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          Paramètres
        </button>
      </div>

      {/* Content */}
      <div className="chatbot-modern-content">
        {activeTab === 'chat' && (
          <>
            {!currentConversation || currentConversation.messages.length === 0 ? (
              <div className="chatbot-welcome">
                <h3>👋 Bonjour! Comment puis-je vous aider?</h3>
                <p>Choisissez une suggestion ou posez votre question:</p>
                <div className="quick-prompts">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="quick-prompt-btn"
                      onClick={() => handleSendMessage(prompt.text)}
                    >
                      {prompt.icon}
                      <span>{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="messages-container-modern">
                {currentConversation.messages.map(renderMessage)}
                {isTyping && (
                  <div className="message-modern assistant typing">
                    <div className="typing-indicator-modern">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="history-view">
            <div className="history-header">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn-new-chat" onClick={createNewConversation}>
                Nouvelle conversation
              </button>
            </div>
            <div className="conversation-list">
              {conversations
                .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(conv => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
                  >
                    <div onClick={() => { setCurrentConversation(conv); setActiveTab('chat'); }}>
                      <div className="conv-title">{conv.title}</div>
                      <div className="conv-meta">
                        {conv.messages.length} messages • {new Date(conv.lastUpdated).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <button onClick={() => deleteConversation(conv.id)} className="btn-delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-view">
            <h3>Mode de conversation</h3>
            <div className="mode-selector">
              <button
                className={chatMode === 'normal' ? 'active' : ''}
                onClick={() => setChatMode('normal')}
              >
                Normal
              </button>
              <button
                className={chatMode === 'expert' ? 'active' : ''}
                onClick={() => setChatMode('expert')}
              >
                Expert
              </button>
              <button
                className={chatMode === 'concise' ? 'active' : ''}
                onClick={() => setChatMode('concise')}
              >
                Concis
              </button>
            </div>

            <h3>Exporter la conversation</h3>
            <div className="export-buttons">
              <button onClick={() => exportConversation('json')}>
                <Download size={16} />
                JSON
              </button>
              <button onClick={() => exportConversation('markdown')}>
                <Download size={16} />
                Markdown
              </button>
              <button onClick={() => exportConversation('txt')}>
                <Download size={16} />
                Texte
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {activeTab === 'chat' && (
        <div className="chatbot-modern-input">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Tapez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            rows={1}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="btn-send-modern"
          >
            <Send size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatbotModern;
