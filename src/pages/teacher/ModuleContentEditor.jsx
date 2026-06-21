// src/components/ModuleContentEditor.jsx
import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link',
  'color', 'background',
];

export default function ModuleContentEditor({ value, onChange, placeholder }) {
  return (
    <div className="module-content-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write your module content here...'}
      />

      <style>{`
        .module-content-editor .ql-toolbar {
          background: #1a202c;
          border-color: #374151;
          border-radius: 0.5rem 0.5rem 0 0;
        }
        .module-content-editor .ql-container {
          background: #1a202c;
          border-color: #374151;
          border-radius: 0 0 0.5rem 0.5rem;
          min-height: 200px;
          font-size: 1rem;
        }
        .module-content-editor .ql-editor {
          color: #e5e7eb;
          min-height: 200px;
        }
        .module-content-editor .ql-editor.ql-blank::before {
          color: #6b7280;
          font-style: normal;
        }
        .module-content-editor .ql-snow .ql-stroke {
          stroke: #9ca3af;
        }
        .module-content-editor .ql-snow .ql-fill {
          fill: #9ca3af;
        }
        .module-content-editor .ql-snow .ql-picker {
          color: #9ca3af;
        }
        .module-content-editor .ql-snow.ql-toolbar button:hover .ql-stroke,
        .module-content-editor .ql-snow .ql-toolbar button:hover .ql-stroke {
          stroke: #00e0ff;
        }
        .module-content-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .module-content-editor .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #00e0ff;
        }
        .module-content-editor .ql-snow.ql-toolbar button.ql-active .ql-fill {
          fill: #00e0ff;
        }
        .module-content-editor .ql-picker-options {
          background: #1a202c;
          border-color: #374151;
        }
        .module-content-editor .ql-editor pre.ql-syntax {
          background: #0a0f1a;
          color: #00e0ff;
          border-radius: 0.5rem;
          padding: 1rem;
        }
        .module-content-editor .ql-editor blockquote {
          border-left: 3px solid #00e0ff;
          color: #9ca3af;
          padding-left: 1rem;
        }
        .module-content-editor .ql-editor a {
          color: #00e0ff;
        }
      `}</style>
    </div>
  );
}