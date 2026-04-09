import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import chatbotService from '../services/chatbotService';
import { X, Send, Sparkles, Trash2, RotateCcw, Clock } from 'lucide-react';

const BlinkingBot = ({ size = 24, color = "currentColor", strokeWidth = 2 }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" className="bot-eye" />
        <path d="M9 13v2" className="bot-eye" />
    </svg>
);

const SUGGESTIONS = [
    "🍽️ Menu today",
    "🥗 Vegan options",
    "⏱️ Least busy canteen",
    "🎁 Combo deals",
    "💰 Items under 200",
    "🕐 Canteen hours",
];

const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: "Hello! 👋 I'm **Eatsbot**, your smart campus food assistant.\n\nI can help you with:\n- 🍽️ Today's menu & prices\n- 🥗 Dietary options (veg, vegan, halal)\n- ⏱️ Live canteen wait times\n- 🎁 Combo deals & offers\n- 💰 Budget-friendly picks\n\nJust ask me anything!",
            time: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
            setHasUnread(false);
        }
    }, [isOpen]);

    // Build conversation history for API (exclude initial welcome message)
    const buildHistory = useCallback(() => {
        return messages
            .slice(1) // skip initial welcome
            .map((msg) => ({
                role: msg.role === 'bot' ? 'assistant' : 'user',
                content: msg.text,
            }));
    }, [messages]);

    const sendMessage = async (text) => {
        const userMsg = text || input.trim();
        if (!userMsg || isTyping) return;

        const userMessage = { role: 'user', text: userMsg, time: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const history = buildHistory();
            const response = await chatbotService.sendMessage(userMsg, history);
            const botMessage = { role: 'bot', text: response.reply, data: response.data, time: new Date() };
            setMessages((prev) => [...prev, botMessage]);

            // Mark unread if chat is closed
            if (!isOpen) setHasUnread(true);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'bot',
                    text: "Oops! I'm having trouble reaching the kitchen. Please try again! 🍔",
                    time: new Date(),
                    isError: true,
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const retryLastMessage = () => {
        // Find the last user message and retry
        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
        if (lastUserMsg) {
            // Remove the error message first
            setMessages((prev) => prev.filter((m) => !m.isError));
            sendMessage(lastUserMsg.text);
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'bot',
                text: "Chat cleared! 🔄 I'm ready for new questions.\n\nWhat would you like to know about campus food? 🍔",
                time: new Date(),
            },
        ]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Dark theme markdown styles
    const markdownComponents = {
        strong: ({ children }) => <strong style={{ color: '#ef4444' }}>{children}</strong>,
        p: ({ children }) => <p style={{ margin: '4px 0' }}>{children}</p>,
        ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: '16px' }}>{children}</ol>,
        li: ({ children }) => <li style={{ marginBottom: '2px' }}>{children}</li>,
        h1: ({ children }) => <div style={{ fontWeight: 700, fontSize: '15px', color: '#ef4444', margin: '6px 0 4px' }}>{children}</div>,
        h2: ({ children }) => <div style={{ fontWeight: 700, fontSize: '14px', color: '#ef4444', margin: '6px 0 4px' }}>{children}</div>,
        h3: ({ children }) => <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#ef4444', margin: '4px 0 2px' }}>{children}</div>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444', textDecoration: 'underline' }}>{children}</a>,
        code: ({ children }) => <code style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '1px 4px', borderRadius: '4px', fontSize: '12px', color: '#ef4444' }}>{children}</code>,
        hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />,
        img: ({ src, alt }) => (
            <div style={{
                margin: '8px 0',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}>
                <img
                    src={src}
                    alt={alt || 'Food item'}
                    style={{
                        width: '100%',
                        maxHeight: '180px',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                {alt && (
                    <div style={{
                        padding: '6px 10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        fontSize: '11px',
                        color: '#94a3b8',
                        fontStyle: 'italic',
                    }}>
                        📸 {alt}
                    </div>
                )}
            </div>
        ),
    };

    return (
        <>
            {/* ── Styles ─────────────────────────────── */}
            <style>{`
                @keyframes botBlink {
                    0%, 45%, 49%, 100% { transform: scaleY(1); }
                    47% { transform: scaleY(0.1); }
                }
                .bot-eye {
                    transform-origin: center 14px;
                    animation: botBlink 4s infinite;
                }
                @keyframes botPulse {
                    0%, 100% { box-shadow: 0 4px 15px rgba(220, 38, 38, 0.2); }
                    50% { box-shadow: 0 4px 25px rgba(220, 38, 38, 0.4); }
                }
                @keyframes chatSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes chatSlideDown {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to { opacity: 0; transform: translateY(20px) scale(0.95); }
                }
                @keyframes dotBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes fadeInMsg {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: 200px 0; }
                }
                @keyframes badgePop {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                @keyframes pulseRing {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
                .chatbot-toggle:hover {
                    transform: scale(1.1) !important;
                }
                .chatbot-suggestion:hover {
                    background: rgba(220, 38, 38, 0.15) !important;
                    border-color: rgba(220, 38, 38, 0.4) !important;
                    transform: translateY(-1px);
                }
                .chatbot-send:hover:not(:disabled) {
                    background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
                    transform: scale(1.05);
                }
                .chatbot-input:focus {
                    border-color: rgba(220, 38, 38, 0.5) !important;
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15) !important;
                }
                .chatbot-clear:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .chatbot-retry:hover {
                    background: rgba(220, 38, 38, 0.25) !important;
                    border-color: rgba(220, 38, 38, 0.5) !important;
                }
                .chatbot-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .chatbot-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chatbot-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(220, 38, 38, 0.4);
                    border-radius: 10px;
                }
                .chatbot-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(220, 38, 38, 0.6);
                }
                .chatbot-msg-bubble {
                    transition: all 0.2s ease;
                }
                .chatbot-msg-bubble:hover {
                    filter: brightness(1.05);
                }
            `}</style>

            {/* ── Toggle Button ─────────────────────── */}
            <button
                id="chatbot-toggle"
                className="chatbot-toggle"
                onClick={() => {
                    if (isOpen && !isClosing) {
                        setIsClosing(true);
                        setTimeout(() => {
                            setIsOpen(false);
                            setIsClosing(false);
                        }, 280);
                    } else if (!isOpen) {
                        setIsOpen(true);
                    }
                }}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    animation: isOpen ? 'none' : 'botPulse 4s ease-in-out infinite',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.2)',
                }}
                title="Chat with Eatsbot"
            >
                <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                    <div style={{ 
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isOpen ? 'rotate(90deg) scale(0)' : 'rotate(0deg) scale(1)',
                        opacity: isOpen ? 0 : 1
                    }}>
                        <BlinkingBot size={32} color="#ffffff" strokeWidth={1.5} />
                    </div>
                    <div style={{ 
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isOpen ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
                        opacity: isOpen ? 1 : 0
                    }}>
                        <X size={28} color="#ffffff" />
                    </div>
                </div>

                {/* Unread notification badge */}
                {hasUnread && !isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2px solid #000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'badgePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#fff',
                    }}>
                        !
                    </div>
                )}
            </button>

            {/* ── Chat Window ───────────────────────── */}
            {(isOpen || isClosing) && (
                <div
                    id="chatbot-window"
                    style={{
                        position: 'fixed',
                        bottom: '100px',
                        right: '24px',
                        width: '400px',
                        maxWidth: 'calc(100vw - 32px)',
                        height: '560px',
                        maxHeight: 'calc(100vh - 140px)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        zIndex: 9998,
                        display: 'flex',
                        flexDirection: 'column',
                        animation: isClosing
                            ? 'chatSlideDown 0.3s forwards cubic-bezier(0.4, 0, 1, 1)'
                            : 'chatSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        background: 'rgba(0, 0, 0, 0.88)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(220, 38, 38, 0.1)',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '14px 16px 14px 20px',
                            background: 'linear-gradient(180deg, rgba(220, 38, 38, 0.08) 0%, rgba(0, 0, 0, 0.95) 100%)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                                flexShrink: 0,
                                position: 'relative',
                            }}
                        >
                            <BlinkingBot size={22} color="#ffffff" />
                            {/* Online indicator on avatar */}
                            <span style={{
                                position: 'absolute', bottom: '0px', right: '0px',
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: '#10b981', border: '2px solid rgba(0,0,0,0.9)',
                            }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    fontWeight: 700,
                                    fontSize: '15.5px',
                                    color: '#ffffff',
                                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                Eatsbot
                                <Sparkles size={14} color="#ef4444" />
                            </div>
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    marginTop: '1px',
                                }}
                            >
                                {isTyping ? (
                                    <span style={{ color: '#10b981' }}>Typing...</span>
                                ) : (
                                    'Powered by DeepSeek AI'
                                )}
                            </div>
                        </div>

                        {/* Clear chat button */}
                        <button
                            className="chatbot-clear"
                            onClick={clearChat}
                            title="Clear chat"
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                background: 'transparent',
                                color: '#64748b',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                            }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={messagesContainerRef}
                        className="chatbot-scrollbar"
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            background: 'transparent',
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '8px',
                                    animation: 'fadeInMsg 0.3s ease',
                                }}
                            >
                                {msg.role === 'bot' && (
                                    <div
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: msg.isError
                                                ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                                : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                                            flexShrink: 0,
                                            marginTop: '4px',
                                        }}
                                    >
                                        <BlinkingBot size={15} color="#ffffff" />
                                    </div>
                                )}
                                <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column' }}>
                                    <div
                                        className="chatbot-msg-bubble"
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius:
                                                msg.role === 'user'
                                                    ? '18px 18px 4px 18px'
                                                    : '18px 18px 18px 4px',
                                            background:
                                                msg.isError
                                                    ? 'rgba(249, 115, 22, 0.12)'
                                                    : msg.role === 'user'
                                                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                                                        : 'rgba(255, 255, 255, 0.06)',
                                            color: msg.role === 'user' ? '#ffffff' : '#f1f5f9',
                                            fontSize: '13.5px',
                                            lineHeight: 1.55,
                                            fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                            border: msg.isError
                                                ? '1px solid rgba(249, 115, 22, 0.25)'
                                                : msg.role === 'bot'
                                                    ? '1px solid rgba(255, 255, 255, 0.08)'
                                                    : 'none',
                                            boxShadow:
                                                msg.role === 'user'
                                                    ? '0 4px 12px rgba(220, 38, 38, 0.25)'
                                                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {msg.role === 'bot' ? (
                                            <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginTop: '4px',
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        paddingLeft: msg.role === 'bot' ? '4px' : 0,
                                        paddingRight: msg.role === 'user' ? '4px' : 0,
                                    }}>
                                        <Clock size={10} color="#475569" />
                                        <span style={{
                                            fontSize: '10.5px',
                                            color: '#475569',
                                            fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                        }}>
                                            {msg.time ? formatTime(msg.time) : ''}
                                        </span>
                                    </div>

                                    {/* Retry button on error */}
                                    {msg.isError && (
                                        <button
                                            className="chatbot-retry"
                                            onClick={retryLastMessage}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginTop: '6px',
                                                padding: '6px 14px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                                background: 'rgba(249, 115, 22, 0.1)',
                                                color: '#f97316',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                                width: 'fit-content',
                                            }}
                                        >
                                            <RotateCcw size={12} />
                                            Retry
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div style={{ display: 'flex', gap: '8px', animation: 'fadeInMsg 0.3s ease' }}>
                                <div
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                                        flexShrink: 0,
                                        marginTop: '4px',
                                    }}
                                >
                                    <BlinkingBot size={15} color="#ffffff" />
                                </div>
                                <div
                                    style={{
                                        padding: '12px 18px',
                                        borderRadius: '18px 18px 18px 4px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                        display: 'flex',
                                        gap: '8px',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#94a3b8',
                                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                        fontStyle: 'italic',
                                    }}>
                                        Thinking
                                    </span>
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            style={{
                                                width: '5px',
                                                height: '5px',
                                                borderRadius: '50%',
                                                background: '#ef4444',
                                                display: 'inline-block',
                                                animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions (only show when few messages) */}
                    {messages.length <= 2 && (
                        <div
                            style={{
                                padding: '0 16px 10px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px',
                                background: 'transparent',
                            }}
                        >
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    className="chatbot-suggestion"
                                    onClick={() => sendMessage(s.replace(/^[^\s]+ /, ''))}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(220, 38, 38, 0.25)',
                                        background: 'rgba(220, 38, 38, 0.06)',
                                        color: '#fca5a5',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div
                        style={{
                            padding: '12px 16px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            background: 'rgba(0, 0, 0, 0.95)',
                        }}
                    >
                        <input
                            ref={inputRef}
                            className="chatbot-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isTyping ? "Eatsbot is thinking..." : "Ask about menus, deals, wait times..."}
                            disabled={isTyping}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '14px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#ffffff',
                                fontSize: '13.5px',
                                outline: 'none',
                                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                transition: 'all 0.2s ease',
                                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.2)',
                                opacity: isTyping ? 0.6 : 1,
                            }}
                        />
                        <button
                            className="chatbot-send"
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isTyping}
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '14px',
                                border: 'none',
                                background:
                                    input.trim() && !isTyping
                                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                                        : 'rgba(255, 255, 255, 0.06)',
                                color: input.trim() && !isTyping ? '#ffffff' : '#475569',
                                fontSize: '18px',
                                cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.2s ease',
                                boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(220, 38, 38, 0.25)' : 'none',
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    {/* Footer branding */}
                    <div style={{
                        padding: '6px 16px 8px',
                        textAlign: 'center',
                        background: 'rgba(0, 0, 0, 0.95)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                    }}>
                        <span style={{
                            fontSize: '10px',
                            color: '#334155',
                            fontFamily: "'Inter', 'Segoe UI', sans-serif",
                            letterSpacing: '0.5px',
                        }}>
                            CampusEats · Made with ❤️
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}
