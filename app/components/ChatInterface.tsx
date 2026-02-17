'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  verseReferences?: VerseReference[];
  suggestedQuestions?: string[];
  timestamp: Date;
}

interface VerseReference {
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
}

interface Props {
  agentColor: string;
}

const LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced'] as const;
type Level = typeof LEVEL_OPTIONS[number];

export default function ChatInterface({ agentColor }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userLevel, setUserLevel] = useState<Level>('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agents/gita-guide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: inputText,
          user_level: userLevel,
          context,
        }),
      });

      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

      const data = await response.json();
      const answer = data.answer;

      const verseReferences: VerseReference[] = (answer.verse_references ?? []).map((ref: {
        chapter: number;
        verse: number;
        sanskrit_text: string;
        transliteration: string;
        translation: string;
      }) => ({
        chapter: ref.chapter,
        verse: ref.verse,
        sanskrit: ref.sanskrit_text,
        transliteration: ref.transliteration,
        translation: ref.translation,
      }));

      const assistantMessage: Message = {
        role: 'assistant',
        content: answer.teaching,
        verseReferences,
        suggestedQuestions: answer.suggested_questions ?? [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setContext(answer.teaching);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize — something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const textMeta = 'var(--text-meta)';
  const textBody = 'var(--text-body)';
  const textHead = 'var(--text-heading)';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 700,
          color: textHead,
          letterSpacing: '-0.02em',
        }}>
          Ask the Sage
        </h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: textMeta }}>
          Live AI — answers drawn from the Bhagavad Gita
        </p>
      </div>

      {/* Level selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {LEVEL_OPTIONS.map((level) => (
          <button
            key={level}
            onClick={() => setUserLevel(level)}
            style={{
              padding: '0.3rem 0.85rem',
              borderRadius: '100px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1.5px solid',
              borderColor: userLevel === level ? agentColor : 'rgba(0,0,0,0.12)',
              background: userLevel === level ? agentColor + '18' : 'rgba(255,255,255,0.50)',
              color: userLevel === level ? agentColor : textMeta,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
              textTransform: 'capitalize',
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '2rem 0',
              textAlign: 'center',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: agentColor + '15',
                border: `2px solid ${agentColor}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 800, color: agentColor,
                fontFamily: 'Georgia, serif',
              }}>
                ॐ
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: textMeta, maxWidth: '320px', lineHeight: 1.55 }}>
                Ask me anything about the Bhagavad Gita — dharma, karma, meditation, or how to apply these teachings in your life.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="animate-fade-in">
              {msg.role === 'user' ? (
                /* User bubble — right-aligned */
                <div
                  className="chat-bubble-user"
                  style={{ background: agentColor }}
                >
                  {msg.content}
                </div>
              ) : (
                /* Agent bubble — left-aligned, may have extras */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '82%' }}>
                  <div className="chat-bubble-agent">
                    {msg.content}
                  </div>

                  {/* Verse references */}
                  {msg.verseReferences && msg.verseReferences.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {msg.verseReferences.map((v, vi) => (
                        <div key={vi} style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: '12px',
                          background: agentColor + '10',
                          border: `1px solid ${agentColor}28`,
                          fontSize: '0.8rem',
                          color: textBody,
                        }}>
                          <div style={{ fontWeight: 700, color: agentColor, marginBottom: '0.2rem' }}>
                            Chapter {v.chapter}, Verse {v.verse}
                          </div>
                          <div style={{ fontStyle: 'italic', marginBottom: '0.2rem', fontSize: '0.85rem' }}>
                            {v.sanskrit}
                          </div>
                          <div style={{ color: textMeta, marginBottom: '0.2rem', fontSize: '0.75rem' }}>
                            {v.transliteration}
                          </div>
                          <div style={{ lineHeight: 1.4 }}>{v.translation}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested questions */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMeta }}>
                        Continue your journey
                      </span>
                      {msg.suggestedQuestions.slice(0, 3).map((q, qi) => (
                        <button
                          key={qi}
                          onClick={() => setInputText(q)}
                          style={{
                            textAlign: 'left',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '100px',
                            fontSize: '0.78rem',
                            color: agentColor,
                            background: agentColor + '10',
                            border: `1px solid ${agentColor}25`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          → {q}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: '0.68rem', color: textMeta, paddingLeft: '0.25rem' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="chat-bubble-agent animate-fade-in" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingTop: '0.85rem',
              paddingBottom: '0.85rem',
            }}>
              {[0, 1, 2].map((dot) => (
                <span key={dot} style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: agentColor,
                  opacity: 0.6,
                  animation: `blink 1.2s ease-in-out ${dot * 0.2}s infinite`,
                  display: 'inline-block',
                }} />
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="chat-input-bar">
          <textarea
            className="chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question… (Enter to send)"
            rows={1}
            disabled={isLoading}
            style={{ width: '100%' }}
          />
          <button
            className="chat-submit"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={{ background: agentColor }}
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>

      <p style={{ marginTop: '0.65rem', fontSize: '0.75rem', color: textMeta, textAlign: 'center' }}>
        Answers are grounded in the Bhagavad Gita · Typically 3–5 seconds
      </p>
    </div>
  );
}
