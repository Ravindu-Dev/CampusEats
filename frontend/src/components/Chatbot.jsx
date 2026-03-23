import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import chatbotService from '../services/chatbotService';

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
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: "Hey there! 🍔 I'm **Burger Buddy**, your CampusEats assistant!\n\nAsk me about menus, dietary options, wait times, combo deals, or canteen hours!",
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

    // Markdown components styled for the dark chatbot theme
    const markdownComponents = {
        strong: ({ children }) => <strong style={{ color: '#ff8c00' }}>{children}</strong>,
        p: ({ children }) => <p style={{ margin: '4px 0' }}>{children}</p>,
        ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: '16px' }}>{children}</ol>,
        li: ({ children }) => <li style={{ marginBottom: '2px' }}>{children}</li>,
        h1: ({ children }) => <div style={{ fontWeight: 700, fontSize: '15px', color: '#ff8c00', margin: '6px 0 4px' }}>{children}</div>,
        h2: ({ children }) => <div style={{ fontWeight: 700, fontSize: '14px', color: '#ff8c00', margin: '6px 0 4px' }}>{children}</div>,
        h3: ({ children }) => <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#ff8c00', margin: '4px 0 2px' }}>{children}</div>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>{children}</a>,
        code: ({ children }) => <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '4px', fontSize: '12px' }}>{children}</code>,
    };

    return (
        <>
            {/* ── Styles ─────────────────────────────── */}
            <style>{`
                @keyframes burgerBounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-8px) scale(1.05); }
                }
                @keyframes burgerPulse {
                    0%, 100% { box-shadow: 0 4px 20px rgba(255, 140, 0, 0.3); }
                    50% { box-shadow: 0 4px 30px rgba(255, 140, 0, 0.6), 0 0 40px rgba(255, 140, 0, 0.15); }
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
                    background: rgba(255, 140, 0, 0.25) !important;
                    border-color: rgba(255, 140, 0, 0.5) !important;
                    transform: translateY(-1px);
                }
                .chatbot-send:hover:not(:disabled) {
                    background: linear-gradient(135deg, #ff8c00, #ff6b00) !important;
                    transform: scale(1.05);
                }
                .chatbot-input:focus {
                    border-color: rgba(255, 140, 0, 0.5) !important;
                    box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1) !important;
                }
                .chatbot-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .chatbot-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chatbot-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 140, 0, 0.3);
                    border-radius: 10px;
                }
            `}</style>

            {/* ── Toggle Button ─────────────────────── */}
            <button
                id="chatbot-toggle"
                className="chatbot-toggle"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 140, 0, 0.4)',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    animation: isOpen ? 'none' : 'burgerBounce 2s ease-in-out infinite, burgerPulse 2s ease-in-out infinite',
                    transition: 'transform 0.2s ease',
                    overflow: 'hidden',
                }}
                title="Chat with Burger Buddy"
            >
                {isOpen ? (
                    <span style={{ fontSize: '28px', color: '#ff8c00', lineHeight: 1 }}>✕</span>
                ) : (
                    <img
                        src="/burger-buddy.png"
                        alt="Burger Buddy"
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%' }}
                    />
                )}
            </button>

            {/* ── Chat Window ───────────────────────── */}
            {isOpen && (
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
                        animation: 'chatSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
                        border: '1px solid rgba(255, 140, 0, 0.2)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 140, 0, 0.08)',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.15), rgba(255, 107, 0, 0.08))',
                            borderBottom: '1px solid rgba(255, 140, 0, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid rgba(255, 140, 0, 0.4)',
                                flexShrink: 0,
                            }}
                        >
                            <img
                                src="/burger-buddy.png"
                                alt="Burger Buddy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    color: '#fff',
                                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                }}
                            >
                                Burger Buddy
                            </div>
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#4ade80',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <span
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#4ade80',
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
                            gap: '12px',
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
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            marginTop: '2px',
                                        }}
                                    >
                                        <img
                                            src="/burger-buddy.png"
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                <div
                                    style={{
                                        maxWidth: '80%',
                                        padding: '10px 14px',
                                        borderRadius:
                                            msg.role === 'user'
                                                ? '16px 16px 4px 16px'
                                                : '16px 16px 16px 4px',
                                        background:
                                            msg.role === 'user'
                                                ? 'linear-gradient(135deg, #ff8c00, #ff6b00)'
                                                : 'rgba(255, 255, 255, 0.07)',
                                        color: '#fff',
                                        fontSize: '13.5px',
                                        lineHeight: 1.5,
                                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                        border:
                                            msg.role === 'bot'
                                                ? '1px solid rgba(255, 255, 255, 0.08)'
                                                : 'none',
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
                            <div style={{ display: 'flex', gap: '8px', animation: 'fadeInMsg 0.3s ease' }}>
                                <div
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                    }}
                                >
                                    <img
                                        src="/burger-buddy.png"
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div
                                    style={{
                                        padding: '12px 18px',
                                        borderRadius: '16px 16px 16px 4px',
                                        background: 'rgba(255, 255, 255, 0.07)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        display: 'flex',
                                        gap: '4px',
                                        alignItems: 'center',
                                    }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            style={{
                                                width: '7px',
                                                height: '7px',
                                                borderRadius: '50%',
                                                background: '#ff8c00',
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
                                padding: '0 16px 8px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px',
                            }}
                        >
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    className="chatbot-suggestion"
                                    onClick={() => sendMessage(s.replace(/^[^\s]+ /, ''))}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255, 140, 0, 0.25)',
                                        background: 'rgba(255, 140, 0, 0.1)',
                                        color: '#ff8c00',
                                        fontSize: '12px',
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
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            background: 'rgba(0, 0, 0, 0.2)',
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
                                padding: '10px 14px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.06)',
                                color: '#fff',
                                fontSize: '13.5px',
                                outline: 'none',
                                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                            }}
                        />
                        <button
                            className="chatbot-send"
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isTyping}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                border: 'none',
                                background:
                                    input.trim() && !isTyping
                                        ? 'linear-gradient(135deg, #ff8c00, #e67a00)'
                                        : 'rgba(255, 255, 255, 0.06)',
                                color: input.trim() && !isTyping ? '#fff' : 'rgba(255,255,255,0.3)',
                                fontSize: '18px',
                                cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
