// src/components/ModuleContentViewer.jsx
import React from 'react';

export default function ModuleContentViewer({ content }) {
  if (!content) {
    return <p className="text-gray-500 italic">No content added yet.</p>;
  }

  return (
    <div className="module-content-viewer">
      <div dangerouslySetInnerHTML={{ __html: content }} />

      <style>{`
        .module-content-viewer {
          color: #d1d5db;
          font-size: 1.05rem;
          line-height: 1.85;
        }
        .module-content-viewer h1 {
          font-size: 1.9rem;
          font-weight: 700;
          color: #ffffff;
          margin: 1.5rem 0 1rem;
        }
        .module-content-viewer h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 1.4rem 0 0.9rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid #1e2330;
        }
        .module-content-viewer h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #00e0ff;
          margin: 1.2rem 0 0.7rem;
        }
        .module-content-viewer p {
          margin-bottom: 1.1rem;
        }
        .module-content-viewer strong {
          color: #ffffff;
          font-weight: 600;
        }
        .module-content-viewer em {
          color: #fbbf24;
          font-style: italic;
        }
        .module-content-viewer ul,
        .module-content-viewer ol {
          margin: 0 0 1.2rem 1.5rem;
        }
        .module-content-viewer ul li {
          list-style-type: disc;
          margin-bottom: 0.5rem;
          padding-left: 0.25rem;
        }
        .module-content-viewer ol li {
          list-style-type: decimal;
          margin-bottom: 0.5rem;
          padding-left: 0.25rem;
        }
        .module-content-viewer blockquote {
          border-left: 4px solid #00e0ff;
          background: #11161f;
          padding: 0.8rem 1.2rem;
          margin: 1.2rem 0;
          color: #9ca3af;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .module-content-viewer pre {
          background: #0a0f1a;
          border: 1px solid #1e2330;
          color: #22d3ee;
          padding: 1rem 1.2rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1.2rem 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .module-content-viewer code {
          background: #1a202c;
          color: #fbbf24;
          padding: 0.15rem 0.4rem;
          border-radius: 0.3rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
        }
        .module-content-viewer pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }
        .module-content-viewer a {
          color: #00e0ff;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .module-content-viewer a:hover {
          color: #67e8f9;
        }
      `}</style>
    </div>
  );
}