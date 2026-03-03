import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Maximize2, Minimize2, Send, RotateCcw, Copy, ThumbsUp, ThumbsDown,
  MessageSquare, Clock, Settings, Download, Sparkles, Zap, BookOpen,
  Search, Star, Trash2, WifiOff
} from 'lucide-react';
import { sendAgenticMessage, isBackendAvailable, generateFallbackResponse } from '../../services/agenticChatService';
import { useAgenticChatWebSocket } from '../../src/hooks/useAgenticChatWebSocket';
import { useLLMConfig } from '../../contexts/LLMConfigContext';
import type { AgenticMessage, AgenticConversation, ReasoningStep } from '../../types/chatbot';
import ReasoningPanel from './ReasoningPanel';
import './ChatbotModern.css';

type ChatMode = 'normal' | 'expert' | 'concise';
type TabView = 'chat' | 'history' | 'settings';

interface ChatbotAgenticProps {
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { icon: <Sparkles size={16} />, text: "Explique-moi les risques d'injection de prompt", category: "Sécurité" },
  { icon: <Zap size={16} />, text: "Comment tester mes guardrails?", category: "Test" },
  { icon: <BookOpen size={16} />, text: "Quelles sont les meilleures pratiques OWASP LLM?", category: "Bonnes pratiques" },
];

const ChatbotAgentic: React.FC<ChatbotAgenticProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabView>('chat');
  const [conversations, setConversations] = useState<AgenticConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AgenticConversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('normal');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // LLM config from global context
  const { config: llmConfig, isConfigured: llmConfigured } = useLLMConfig();

  // WebSocket hook for agentic streaming
  const {
    reasoningSteps,
    isProcessing,
    answer,
    toolsUsed,
    iterations,
    error: wsError,
    reset: resetWs,
  } = useAgenticChatWebSocket(sessionId);

  // Check backend availability once on mount (no polling — centralized in backendStatus)
  useEffect(() => {
    isBackendAvailable().then(setBackendAvailable);
  }, []);

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatbot_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          lastUpdated: new Date(c.lastUpdated),
          messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        })));
      } catch {
        // Corrupted data, ignore
      }
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, isProcessing]);

  // Handle WebSocket completion: when answer arrives, save the assistant message
  useEffect(() => {
    if (answer && sessionId) {
      const assistantMessage: AgenticMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
        reasoningSteps: [...reasoningSteps],
        toolsUsed: [...toolsUsed],
        iterations,
      };

      setCurrentConversation(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          lastUpdated: new Date(),
        };
        // Save to localStorage
        setConversations(allConvs => {
          const newConvs = allConvs.map(c => c.id === updated.id ? updated : c);
          if (!newConvs.find(c => c.id === updated.id)) {
            newConvs.unshift(updated);
          }
          localStorage.setItem('chatbot_conversations', JSON.stringify(newConvs));
          return newConvs;
        });
        return updated;
      });

      setSessionId(null);
      setIsTyping(false);
      setPendingUserMessage(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  // Handle WebSocket error: create error message
  useEffect(() => {
    if (wsError && sessionId) {
      const errorMessage: AgenticMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Erreur: ${wsError}`,
        timestamp: new Date(),
        reasoningSteps: [...reasoningSteps],
      };

      setCurrentConversation(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          messages: [...prev.messages, errorMessage],
          lastUpdated: new Date(),
        };
        setConversations(allConvs => {
          const newConvs = allConvs.map(c => c.id === updated.id ? updated : c);
          localStorage.setItem('chatbot_conversations', JSON.stringify(newConvs));
          return newConvs;
        });
        return updated;
      });

      setSessionId(null);
      setIsTyping(false);
      setPendingUserMessage(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsError]);

  const saveConversations = useCallback((convs: AgenticConversation[]) => {
    localStorage.setItem('chatbot_conversations', JSON.stringify(convs));
    setConversations(convs);
  }, []);

  const createNewConversation = useCallback((): AgenticConversation => {
    const newConv: AgenticConversation = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    const updated = [newConv, ...conversations];
    saveConversations(updated);
    setCurrentConversation(newConv);
    setActiveTab('chat');
    return newConv;
  }, [conversations, saveConversations]);

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isTyping) return;

    let conv = currentConversation;
    if (!conv || conv.messages.length === 0) {
      if (!conv) {
        conv = createNewConversation();
      }
    }

    const userMessage: AgenticMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    const updatedMessages = [...(conv?.messages || []), userMessage];
    const updatedConv: AgenticConversation = {
      ...conv!,
      messages: updatedMessages,
      title: conv!.messages.length === 0 ? messageText.substring(0, 50) + '...' : conv!.title,
      lastUpdated: new Date(),
    };

    setCurrentConversation(updatedConv);
    setInputValue('');
    setIsTyping(true);

    // Save user message immediately
    const allConvs = conversations.map(c => c.id === updatedConv.id ? updatedConv : c);
    if (!allConvs.find(c => c.id === updatedConv.id)) {
      allConvs.unshift(updatedConv);
    }
    saveConversations(allConvs);

    // Build enhanced message based on mode
    let enhancedMessage = messageText;
    if (chatMode === 'expert') {
      enhancedMessage = `[MODE EXPERT] ${messageText}\n\nFournis une réponse technique détaillée avec références précises aux données.`;
    } else if (chatMode === 'concise') {
      enhancedMessage = `[MODE CONCIS] ${messageText}\n\nRéponds de manière brève et directe.`;
    }

    if (backendAvailable && llmConfigured && llmConfig) {
      // Backend mode: send via API, get sessionId, WS hook handles streaming
      try {
        resetWs();
        setPendingUserMessage(messageText);

        // mem0-inspired memory: short-term (current conv) + long-term (past conv summaries)
        const shortTermHistory = updatedMessages
          .slice(-10)
          .map(m => ({ role: m.role, content: m.content }));

        // Extract long-term memory from past conversations (last 5 convs, first user msg as summary)
        const pastConvSummaries = conversations
          .filter(c => c.id !== conv!.id && c.messages.length > 1)
          .slice(0, 5)
          .map(c => {
            const firstUserMsg = c.messages.find(m => m.role === 'user')?.content || '';
            const lastAssistantMsg = [...c.messages].reverse().find(m => m.role === 'assistant')?.content || '';
            return `Q: ${firstUserMsg.substring(0, 100)} → R: ${lastAssistantMsg.substring(0, 150)}`;
          })
          .filter(s => s.length > 10);

        const memoryContext = pastConvSummaries.length > 0
          ? `\n\n[MÉMOIRE - Conversations précédentes]\n${pastConvSummaries.join('\n')}`
          : '';

        const conversationHistory = shortTermHistory;

        const response = await sendAgenticMessage({
          message: enhancedMessage + memoryContext,
          conversationHistory,
          llmConfig: {
            provider: llmConfig.provider,
            model: llmConfig.model,
            apiKey: llmConfig.apiKey,
            baseUrl: llmConfig.baseUrl,
            temperature: llmConfig.temperature,
            maxTokens: llmConfig.maxTokens,
          },
        });

        setSessionId(response.sessionId);
      } catch (error) {
        // API call failed, fall back to offline response
        const fallback = generateFallbackResponse(messageText);
        const assistantMessage: AgenticMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallback,
          timestamp: new Date(),
        };
        const finalConv = { ...updatedConv, messages: [...updatedMessages, assistantMessage] };
        setCurrentConversation(finalConv);
        const finalConvs = allConvs.map(c => c.id === finalConv.id ? finalConv : c);
        saveConversations(finalConvs);
        setIsTyping(false);
        setPendingUserMessage(null);
      }
    } else {
      // Offline / fallback mode
      const fallback = generateFallbackResponse(messageText);
      const assistantMessage: AgenticMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallback,
        timestamp: new Date(),
      };
      const finalConv = { ...updatedConv, messages: [...updatedMessages, assistantMessage] };
      setCurrentConversation(finalConv);
      const finalConvs = allConvs.map(c => c.id === finalConv.id ? finalConv : c);
      saveConversations(finalConvs);
      setIsTyping(false);
    }
  }, [inputValue, isTyping, currentConversation, conversations, chatMode, backendAvailable, llmConfigured, llmConfig, createNewConversation, saveConversations, resetWs]);

  const handleRegenerate = useCallback(async (messageId: string) => {
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
  }, [currentConversation, handleSendMessage]);

  const toggleFavorite = useCallback((messageId: string) => {
    if (!currentConversation) return;

    const updated = {
      ...currentConversation,
      messages: currentConversation.messages.map(m =>
        m.id === messageId ? { ...m, favorite: !m.favorite } : m
      ),
    };
    setCurrentConversation(updated);
    const allConvs = conversations.map(c => c.id === updated.id ? updated : c);
    saveConversations(allConvs);
  }, [currentConversation, conversations, saveConversations]);

  const setReaction = useCallback((messageId: string, reaction: 'like' | 'dislike') => {
    if (!currentConversation) return;

    const updated = {
      ...currentConversation,
      messages: currentConversation.messages.map(m =>
        m.id === messageId ? { ...m, reaction: m.reaction === reaction ? undefined : reaction } : m
      ),
    };
    setCurrentConversation(updated);
    const allConvs = conversations.map(c => c.id === updated.id ? updated : c);
    saveConversations(allConvs);
  }, [currentConversation, conversations, saveConversations]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const exportConversation = useCallback((format: 'json' | 'markdown' | 'txt') => {
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
    URL.revokeObjectURL(url);
  }, [currentConversation]);

  const deleteConversation = useCallback((convId: string) => {
    const updated = conversations.filter(c => c.id !== convId);
    saveConversations(updated);
    if (currentConversation?.id === convId) {
      setCurrentConversation(null);
    }
  }, [conversations, currentConversation, saveConversations]);

  const renderMessage = (message: AgenticMessage) => (
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
      {/* Reasoning panel for assistant messages */}
      {message.role === 'assistant' && message.reasoningSteps && message.reasoningSteps.length > 0 && (
        <ReasoningPanel steps={message.reasoningSteps} />
      )}
      <div className="message-time-modern">
        {message.timestamp instanceof Date
          ? message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
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

      {/* Offline Banner */}
      {backendAvailable === false && (
        <div className="offline-banner">
          <WifiOff size={14} />
          <span>Mode hors-ligne - Réponses limitées. Lancez le backend pour le raisonnement agentique.</span>
        </div>
      )}

      {/* LLM not configured banner */}
      {backendAvailable && !llmConfigured && (
        <div className="offline-banner">
          <Settings size={14} />
          <span>LLM non configuré - Allez dans Paramètres &gt; Configuration LLM.</span>
        </div>
      )}

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
                <h3>Bonjour! Comment puis-je vous aider?</h3>
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
                {/* Live reasoning during processing */}
                {isProcessing && reasoningSteps.length > 0 && (
                  <div className="message-modern assistant">
                    <div className="processing-indicator">
                      <div className="reasoning-spinner" />
                      <span>Raisonnement en cours...</span>
                    </div>
                    <ReasoningPanel steps={reasoningSteps} isProcessing />
                  </div>
                )}
                {isTyping && !isProcessing && (
                  <div className="message-modern assistant typing">
                    <div className="message-content-modern">
                      <div className="typing-indicator-modern">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
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
              <button className="btn-new-chat" onClick={() => createNewConversation()}>
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
                        {conv.messages.length} messages &bull; {new Date(conv.lastUpdated).toLocaleDateString('fr-FR')}
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

            <h3>Configuration LLM</h3>
            <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(55, 65, 81, 0.5)', borderRadius: '0.5rem', border: '1px solid rgba(75, 85, 99, 0.3)' }}>
              {llmConfigured && llmConfig ? (
                <div style={{ fontSize: '0.85rem', color: '#d1d5db' }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span style={{ color: '#9ca3af' }}>Fournisseur:</span>{' '}
                    <span style={{ color: '#22d3ee' }}>{llmConfig.provider}</span>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af' }}>Modèle:</span>{' '}
                    <span style={{ color: '#22d3ee' }}>{llmConfig.model}</span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#fbbf24' }}>
                  Non configuré. Allez dans Paramètres &gt; Configuration LLM.
                </div>
              )}
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

export default ChatbotAgentic;
