import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import chatbotService from '../services/chatbotService';
import { X, Send, Sparkles } from 'lucide-react';

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

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: "Hello! 👋 I'm **Eatsbot**, your smart assistant.\n\nAsk me about menus, dietary options, wait times, combo deals, or canteen hours!",
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        const userMsg = text || input.trim();
        if (!userMsg) return;

        setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await chatbotService.sendMessage(userMsg);
            setMessages((prev) => [
                ...prev,
                { role: 'bot', text: response.reply, data: response.data },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'bot', text: "Oops! I'm having trouble reaching the kitchen. Please try again! 🍔" },
            ]);
        } finally {
            setIsTyping(false);
        }
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
            </button>

            {/* ── Chat Window ───────────────────────── */}
            {(isOpen || isClosing) && (
                <div
                    id="chatbot-window"
                    style={{
                        position: 'fixed',
                        bottom: '100px',
                        right: '24px',
                        width: '380px',
                        maxWidth: 'calc(100vw - 48px)',
                        height: '520px',
                        maxHeight: 'calc(100vh - 140px)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        zIndex: 9998,
                        display: 'flex',
                        flexDirection: 'column',
                        animation: isClosing
                            ? 'chatSlideDown 0.3s forwards cubic-bezier(0.4, 0, 1, 1)'
                            : 'chatSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        // Glass dark black
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '16px 20px',
                            background: 'rgba(0, 0, 0, 0.9)',
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
                            }}
                        >
                            <BlinkingBot size={22} color="#ffffff" />
                        </div>
                        <div>
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
                                    fontSize: '12.5px',
                                    color: '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    marginTop: '2px',
                                }}
                            >
                                <span
                                    style={{
                                        width: '7px',
                                        height: '7px',
                                        borderRadius: '50%',
                                        background: '#10b981',
                                        display: 'inline-block',
                                    }}
                                />{' '}
                                Online — Ask me anything!
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        className="chatbot-scrollbar"
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                            background: 'transparent', // Pure black glass message area
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '10px',
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
                                            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                                            flexShrink: 0,
                                            marginTop: '4px',
                                        }}
                                    >
                                        <BlinkingBot size={15} color="#ffffff" />
                                    </div>
                                )}
                                <div
                                    style={{
                                        maxWidth: '82%',
                                        padding: '12px 16px',
                                        borderRadius:
                                            msg.role === 'user'
                                                ? '18px 18px 4px 18px'
                                                : '18px 18px 18px 4px',
                                        background:
                                            msg.role === 'user'
                                                ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                                                : 'rgba(255, 255, 255, 0.06)',
                                        color: msg.role === 'user' ? '#ffffff' : '#f1f5f9',
                                        fontSize: '14px',
                                        lineHeight: 1.5,
                                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                        border:
                                            msg.role === 'bot'
                                                ? '1px solid rgba(255, 255, 255, 0.08)'
                                                : 'none',
                                        boxShadow:
                                            msg.role === 'user'
                                                ? '0 4px 12px rgba(220, 38, 38, 0.25)'
                                                : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {msg.role === 'bot' ? (
                                        <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div style={{ display: 'flex', gap: '10px', animation: 'fadeInMsg 0.3s ease' }}>
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
                                        padding: '14px 18px',
                                        borderRadius: '18px 18px 18px 4px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        display: 'flex',
                                        gap: '6px',
                                        alignItems: 'center',
                                    }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            style={{
                                                width: '6px',
                                                height: '6px',
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
                                padding: '0 16px 12px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                background: 'transparent',
                            }}
                        >
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    className="chatbot-suggestion"
                                    onClick={() => sendMessage(s.replace(/^[^\s]+ /, ''))}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(220, 38, 38, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#fca5a5',
                                        fontSize: '12.5px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
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
                            padding: '14px 16px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            background: 'rgba(0, 0, 0, 0.9)',
                        }}
                    >
                        <input
                            ref={inputRef}
                            className="chatbot-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about menus, deals, wait times..."
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '14px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#ffffff',
                                fontSize: '14px',
                                outline: 'none',
                                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                transition: 'all 0.2s ease',
                                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.2)',
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
                                        : '#f1f5f9',
                                color: input.trim() && !isTyping ? '#ffffff' : '#cbd5e1',
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
                </div>
            )}
        </>
    );
}

