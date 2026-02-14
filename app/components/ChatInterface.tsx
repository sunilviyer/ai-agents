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

export default function ChatInterface({ agentColor }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agents/gita-guide/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputText,
          user_level: userLevel,
          context: context
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.statusText}`);
      }

      const data = await response.json();
      const answer = data.answer;

      // Extract verse references from the answer
      const verseReferences: VerseReference[] = answer.verse_references?.map((ref: {
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
        translation: ref.translation
      })) || [];

      const assistantMessage: Message = {
        role: 'assistant',
        content: answer.teaching,
        verseReferences: verseReferences,
        suggestedQuestions: answer.suggested_questions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update context for follow-up questions
      setContext(answer.teaching);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-panel p-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: agentColor }}>
        Ask the Sage
      </h2>

      {/* User Level Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3" style={{ color: '#FDF0D5' }}>
          Your Level of Understanding
        </label>
        <div className="flex gap-3">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setUserLevel(level)}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 capitalize"
              style={{
                background: userLevel === level
                  ? `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`
                  : 'rgba(0, 48, 73, 0.5)',
                color: '#FDF0D5',
                border: userLevel === level ? `2px solid ${agentColor}` : '1px solid rgba(102, 155, 188, 0.3)',
                boxShadow: userLevel === level ? `0 8px 24px ${agentColor}50` : 'none'
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Chat History */}
      <div className="mb-6 space-y-4 max-h-[600px] overflow-y-auto pr-4 chat-scroll">
        {messages.length === 0 && (
          <div className="text-center py-12" style={{ color: '#669BBC' }}>
            <div className="text-6xl mb-4">🕉️</div>
            <p className="text-lg">
              Ask me any question about the Bhagavad Gita, dharma, karma, or how to apply these teachings in your life.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`glass-card p-6 animate-fade-in ${
              message.role === 'user' ? 'ml-12' : 'mr-12'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                style={{
                  background: message.role === 'user' ? '#669BBC' : agentColor,
                  color: '#FDF0D5'
                }}
              >
                {message.role === 'user' ? 'You' : '🕉️'}
              </div>
              <div className="flex-1">
                <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#FDF0D5' }}>
                  {message.content}
                </p>

                {/* Verse References */}
                {message.verseReferences && message.verseReferences.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold" style={{ color: agentColor }}>
                      Referenced Verses:
                    </h4>
                    {message.verseReferences.map((verse, vIndex) => (
                      <div
                        key={vIndex}
                        className="pl-4 border-l-4 py-3"
                        style={{ borderColor: agentColor }}
                      >
                        <div className="text-sm font-bold mb-2" style={{ color: agentColor }}>
                          Chapter {verse.chapter}, Verse {verse.verse}
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-serif italic" style={{ color: '#FDF0D5' }}>
                            {verse.sanskrit}
                          </p>
                          <p className="text-sm" style={{ color: '#669BBC' }}>
                            {verse.transliteration}
                          </p>
                          <p className="text-base" style={{ color: '#FDF0D5' }}>
                            {verse.translation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Questions */}
                {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3" style={{ color: agentColor }}>
                      Related Questions:
                    </h4>
                    <div className="space-y-2">
                      {message.suggestedQuestions.map((question, qIndex) => (
                        <button
                          key={qIndex}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-102"
                          style={{
                            background: 'rgba(0, 48, 73, 0.5)',
                            color: '#669BBC',
                            border: '1px solid rgba(102, 155, 188, 0.3)'
                          }}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs" style={{ color: '#669BBC' }}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="glass-card p-6 mr-12 animate-fade-in">
            <div className="flex items-center gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ background: agentColor, color: '#FDF0D5' }}
              >
                🕉️
              </div>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                     style={{ borderColor: `${agentColor} transparent ${agentColor} ${agentColor}` }} />
                <span style={{ color: '#669BBC' }}>Contemplating your question...</span>
              </div>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex gap-3">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask your question here... (Press Enter to send, Shift+Enter for new line)"
          className="flex-1 px-6 py-4 rounded-lg resize-none focus:outline-none focus:ring-2 transition-all"
          style={{
            background: 'rgba(0, 48, 73, 0.5)',
            color: '#FDF0D5',
            border: '1px solid rgba(102, 155, 188, 0.3)',
            minHeight: '80px'
          }}
          disabled={isLoading}
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isLoading}
          className="px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`,
            color: '#FDF0D5',
            border: `2px solid ${agentColor}`,
            boxShadow: `0 8px 24px ${agentColor}50`
          }}
        >
          Send
        </button>
      </div>

      {/* Helper Text */}
      <p className="mt-3 text-sm text-center" style={{ color: '#669BBC' }}>
        All answers are based on the Bhagavad Gita. Responses typically take 3-5 seconds.
      </p>
    </div>
  );
}
