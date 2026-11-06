import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Copy, Check, Volume2, VolumeX, Maximize2, Minimize2, Trash2, ArrowUpRight, Zap, Shield, Play } from 'lucide-react';
import { ChatMessage, SandboxState } from '../types';
import { sendAssistantMessage } from '../services/api';

interface AssistantWidgetProps {
  sandboxState: SandboxState;
  activeTab: string;
  onNavigate: (tab: string) => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export const AssistantWidget: React.FC<AssistantWidgetProps> = ({
  sandboxState,
  activeTab,
  onNavigate,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I'm your contextual **PayPal Developer Assistant**. I can guide you through JavaScript & React SDK button integration, verify real-time incoming payments in your sandbox ledger, or troubleshoot webhook and subscription events.

How can I assist your integration today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle external prompt passed from parent (e.g. from clicking "Ask AI" on a table row)
  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  // Text to speech helper
  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting for voice
    const cleanText = text.replace(/[*#`_\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendAssistantMessage({
        message: query,
        history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        activeContext: {
          currentTab: activeTab,
          balance: sandboxState.balance,
          latestTxId: sandboxState.transactions[0]?.id,
        },
      });

      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(response.reply);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: `I'm currently unable to connect to the backend assistant service. However, your sandbox balance is **$${sandboxState.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD**, and your merchant account is active.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 1800);
  };

  // Quick prompt suggestions
  const quickPrompts = [
    { label: 'Check sandbox balance & funds', query: 'What is my current sandbox balance and latest incoming payment?' },
    { label: 'Integrate JS SDK buttons', query: 'How do I integrate PayPal JavaScript SDK buttons in my HTML page?' },
    { label: 'React @paypal/react-paypal-js', query: 'Show me an example using @paypal/react-paypal-js in React' },
    { label: 'Webhook signature verification', query: 'How do I verify PayPal webhook signatures on my backend?' },
    { label: 'Handle subscription billing', query: 'How do subscriptions and recurring billing plans work in PayPal?' },
  ];

  // Helper to render markdown-like text with code blocks
  const renderMessageContent = (text: string, msgId: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        const hasLang = /^[a-z0-9_-]+$/i.test(firstLine);
        const lang = hasLang ? firstLine : '';
        const codeContent = hasLang ? lines.slice(1).join('\n') : lines.join('\n');
        const blockId = `${msgId}-${index}`;

        return (
          <div key={index} className="my-2.5 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-200 text-xs font-mono">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => copyCode(codeContent, blockId)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedCodeId === blockId ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedCodeId === blockId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto leading-relaxed max-h-56">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Format basic markdown like bold and backticks
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed">
          {part.split('\n\n').map((para, pIdx) => (
            <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
              {para.split(/(\*\*.*?\*\*|`.*?`)/g).map((chunk, cIdx) => {
                if (chunk.startsWith('**') && chunk.endsWith('**')) {
                  return (
                    <strong key={cIdx} className="font-semibold text-slate-900 dark:text-white">
                      {chunk.slice(2, -2)}
                    </strong>
                  );
                }
                if (chunk.startsWith('`') && chunk.endsWith('`')) {
                  return (
                    <code
                      key={cIdx}
                      className="px-1 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-[#0070BA] dark:text-blue-400"
                    >
                      {chunk.slice(1, -1)}
                    </code>
                  );
                }
                return chunk;
              })}
            </p>
          ))}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="relative">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fill="#ffffff"
                  d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.477A.641.641 0 0 1 5.577 2h7.39c2.44 0 4.316.574 5.426 1.66 1.054 1.03 1.48 2.532 1.233 4.343-.538 3.963-3.238 6.177-7.234 6.177H9.28a.8.8 0 0 0-.79.692l-1.414 6.465z"
                />
                <path
                  fill="#93c5fd"
                  d="M9.825 8.16h3.117c2.47 0 4.28.536 5.234 1.55.955 1.012 1.247 2.478.847 4.24-.652 2.87-2.775 4.57-6.14 4.57H9.77a.64.64 0 0 1-.632-.553l-1.07-5.99a.8.8 0 0 1 .789-.817h.968z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0070BA]" />
            </div>
            <span className="text-xs font-semibold tracking-wide">
              PayPal Assistant
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Box Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 ${
            isExpanded
              ? 'bottom-4 right-4 top-4 left-4 sm:left-auto sm:w-[680px] rounded-2xl'
              : 'bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[460px] h-[640px] max-h-[calc(100vh-2rem)] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#003087] to-[#0070BA] text-white rounded-t-2xl flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fill="#ffffff"
                    d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.477A.641.641 0 0 1 5.577 2h7.39c2.44 0 4.316.574 5.426 1.66 1.054 1.03 1.48 2.532 1.233 4.343-.538 3.963-3.238 6.177-7.234 6.177H9.28a.8.8 0 0 0-.79.692l-1.414 6.465z"
                  />
                  <path
                    fill="#93c5fd"
                    d="M9.825 8.16h3.117c2.47 0 4.28.536 5.234 1.55.955 1.012 1.247 2.478.847 4.24-.652 2.87-2.775 4.57-6.14 4.57H9.77a.64.64 0 0 1-.632-.553l-1.07-5.99a.8.8 0 0 1 .789-.817h.968z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold truncate">
                    PayPal Developer Assistant
                  </h3>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-mono px-1.5 py-0.2 rounded font-medium">
                    Sandbox Connected
                  </span>
                </div>
                <div className="text-[11px] text-blue-200 truncate font-mono">
                  ${sandboxState.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD available
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 shrink-0 text-white/80">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors ${
                  speechEnabled ? 'text-amber-300' : ''
                }`}
                title={speechEnabled ? 'Disable Voice' : 'Enable Voice TTS'}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors hidden sm:block"
                title={isExpanded ? 'Restore Size' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-reset',
                      sender: 'assistant',
                      text: `Conversation cleared. I am ready to help with PayPal SDK buttons, ledger payments, or webhooks.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="truncate">
              Merchant: <strong className="font-mono text-slate-700 dark:text-slate-300">{sandboxState.merchant.accountEmail}</strong>
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {sandboxState.transactions.length} Ledger Events
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl shadow-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0070BA] text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {renderMessageContent(msg.text, msg.id)}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-xs border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#0070BA] animate-spin" />
                  <span>Checking sandbox records & preparing response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(qp.query)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#0070BA] dark:hover:text-blue-400 rounded-md transition-colors shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about JS SDK buttons, sandbox balance, recent payments..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#0070BA] text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-xl disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
