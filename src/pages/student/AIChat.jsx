
// src/components/AIChat.jsx

import React, { useState } from 'react';
import config from '../../config/config';

export default function AIChat({ courseId }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = config.API_BASE;

  


const handleAsk = async (e) => {
  e.preventDefault();

  const trimmedQuestion = question.trim();

  if (!trimmedQuestion || loading) return;

  const userMessage = {
    role: 'user',
    content: trimmedQuestion
  };

  setMessages(prev => [...prev, userMessage]);
  setQuestion('');
  setLoading(true);

  const assistantId = Date.now();

  try {
    const token = localStorage.getItem('token');

    const url = `${API_BASE}/api/rag-test/courses/${courseId}/ask/stream?question=${encodeURIComponent(trimmedQuestion)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed (${response.status})`);
    }

    if (!response.body) {
      throw new Error('Streaming response is not available.');
    }

    // Empty assistant message
    setMessages(prev => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: ''
      }
    ]);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      buffer += decoder.decode(value || new Uint8Array(), {
        stream: !done
      });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';

      for (const event of events) {
        const data = event
          .split(/\r?\n/)
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).replace(/^ /, ''))
          .join('\n');

        if (data && data !== '[DONE]') {
          setMessages(prev =>
            prev.map(message =>
              message.id === assistantId
                ? {
                    ...message,
                    content: message.content + data
                  }
                : message
            )
          );
        }
      }

      if (done) break;
    }

  } catch (error) {
    console.error('AI Chat Error:', error);

    setMessages(prev => [
      ...prev,
      {
        role: 'error',
        content: error.message || 'Unable to connect to AI. Please try again.'
      }
    ]);

  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-[#11161f] border border-[#1e2330] rounded-xl overflow-hidden shadow-xl mt-8">

      {/* Header */}
      <div className="p-5 border-b border-[#1e2330] bg-gradient-to-r from-blue-900/30 to-indigo-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">
            ✨
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              LearnBridge AI Assistant
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Ask questions based on this course's learning material
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-5 space-y-4 min-h-[180px] max-h-[420px] overflow-y-auto">

        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-white font-semibold">
              How can I help you learn?
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Ask anything related to this course.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {[
                'Explain this topic',
                'Give me a simple example',
                'What are the key concepts?'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setQuestion(suggestion)}
                  className="text-xs border border-[#2b3545] text-cyan-400 hover:bg-cyan-500/10 px-3 py-2 rounded-lg transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.role === 'error'
                  ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                  : 'bg-[#1a2230] border border-[#293548] text-gray-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a2230] border border-[#293548] rounded-xl px-4 py-3 text-sm text-cyan-400">
              AI is thinking
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleAsk}
        className="p-4 border-t border-[#1e2330] bg-[#0d1420]"
      >
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about this course..."
            disabled={loading}
            className="flex-1 min-w-0 bg-[#161e2b] border border-[#293548] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-5 py-3 rounded-xl font-semibold text-sm transition"
          >
            {loading ? '...' : 'Send ↑'}
          </button>
        </div>

        <p className="text-gray-600 text-xs mt-3">
          AI responses are generated using the course learning material.
        </p>
      </form>
    </div>
  );
}
