// src/pages/student/PracticeSolve.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PracticeSolve() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get('problemId');
  const topicId = searchParams.get('topicId');
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [langId, setLangId] = useState(71);
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [solved, setSolved] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const codeEditorRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const API_BASE = 'http://localhost:8080';

  const templates = {
    71: '# Python\nimport sys\n\ndef solve():\n    data = sys.stdin.read().strip().split()\n    # your code here\n    pass\n\nif __name__ == "__main__":\n    solve()',
    62: '// Java\nimport java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // your code\n    }\n}',
    50: '// C\n#include <stdio.h>\nint main() {\n    // your code\n    return 0;\n}',
    54: '// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    // your code\n    return 0;\n}'
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (!problemId) {
      alert('No problem specified');
      navigate('/practice');
      return;
    }
    loadProblem();
  }, [problemId]);

  const loadProblem = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/student/practice/problem/${problemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Problem not found');
      const data = await res.json();
      setProblem(data);
      // Load solved status
      const solvedRes = await fetch(`${API_BASE}/api/student/practice/solved`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (solvedRes.ok) {
        const solvedData = await solvedRes.json();
        if (solvedData.includes(parseInt(problemId))) setSolved(true);
      }
      // Load saved code
      const saved = localStorage.getItem(`practice_code_${problemId}`);
      if (saved) {
        setCode(saved);
      } else {
        setCode(templates[String(langId)] || '');
      }
    } catch (err) {
      setOutput('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveCode = () => {
    if (problem) {
      localStorage.setItem(`practice_code_${problemId}`, code);
    }
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveCode, 500);
    updateLineNumbers();
  };

  const updateLineNumbers = () => {
    if (lineNumbersRef.current && codeEditorRef.current) {
      const lines = codeEditorRef.current.value.split('\n').length;
      lineNumbersRef.current.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    }
  };

  const handleLangChange = (e) => {
    const newLang = parseInt(e.target.value);
    setLangId(newLang);
    // Only set template if editor is empty or no saved code
    const currentCode = code.trim();
    if (!currentCode || currentCode === templates[String(langId)] || !localStorage.getItem(`practice_code_${problemId}`)) {
      setCode(templates[String(newLang)] || '');
    }
    setTimeout(updateLineNumbers, 50);
  };

  const runCode = async () => {
    if (!code.trim()) { alert('Write code first'); return; }
    setActiveTab('output');
    setOutput('Running...');
    try {
      const res = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: code,
          language_id: langId,
          stdin: customInput || ''
        })
      });
      const data = await res.json();
      const out = data.stdout || data.stderr || data.compile_output || 'No output';
      setOutput(out);
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  const submitCode = async () => {
    if (!code.trim()) { alert('Write code first'); return; }
    saveCode();
    setActiveTab('result');
    setResult('Judging...');
    try {
      const res = await fetch(`${API_BASE}/api/student/practice/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: parseInt(problemId),
          sourceCode: code,
          languageId: langId
        })
      });
      const data = await res.json();
      if (data.passed) {
        setSolved(true);
        setResult(`✅ Accepted! +${data.marks || problem.marks} marks\nYour output:\n${data.actualOutput || ''}`);
      } else {
        setResult(`❌ ${data.status}\n${data.message}\nYour output: ${data.actualOutput || ''}\nExpected: ${data.expectedOutput || ''}`);
      }
    } catch (err) {
      setResult('Error: ' + err.message);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    updateLineNumbers();
  }, [code]);

  if (loading) return <div className="min-h-screen bg-[#0a0f1a] text-gray-200 flex items-center justify-center">Loading problem...</div>;
  if (!problem) return <div className="min-h-screen bg-[#0a0f1a] text-red-400 flex items-center justify-center">Problem not found.</div>;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200 font-sans">
      <nav className="flex justify-between items-center bg-[#11161f] px-6 py-4 border-b border-[#1e2330]">
        <div className="text-xl font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/practice`)}
            className="border border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            ← Back
          </button>
          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Problem Description */}
        <div className="bg-[#11161f] border border-[#1e2330] rounded-xl p-4 mb-6">
          <div className="font-bold text-xl text-white">{problem.title}</div>
          <div className="text-gray-300 mt-1">{problem.description || 'No description'}</div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <div className="text-sm text-gray-400">Sample Input:</div>
              <pre className="bg-[#1a202c] p-2 rounded text-sm">{problem.sampleInput || ''}</pre>
            </div>
            <div>
              <div className="text-sm text-gray-400">Sample Output:</div>
              <pre className="bg-[#1a202c] p-2 rounded text-sm">{problem.sampleOutput || ''}</pre>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <span>Difficulty: {problem.difficulty}</span>
            <span>Marks: {problem.marks}</span>
            {solved && <span className="text-green-400 font-bold">✅ Solved</span>}
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <select
            value={langId}
            onChange={handleLangChange}
            className="bg-[#1a202c] border border-gray-700 rounded-lg px-3 py-1.5 text-white"
          >
            <option value="71">Python</option>
            <option value="62">Java</option>
            <option value="50">C</option>
            <option value="54">C++</option>
          </select>
          <button
            onClick={runCode}
            className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-4 py-1.5 rounded-lg transition"
          >
            ▶ Run
          </button>
          <button
            onClick={submitCode}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition"
          >
            ✓ Submit
          </button>
        </div>

        {/* Code Editor */}
        <div className="flex bg-[#0d1117] border border-[#1e2330] rounded-xl overflow-hidden mb-4">
          <div
            ref={lineNumbersRef}
            className="w-12 text-right px-2 py-4 text-xs text-gray-600 font-mono bg-[#0d1117] border-r border-[#1e2330] select-none overflow-hidden flex-shrink-0"
          >
            1
          </div>
          <textarea
            ref={codeEditorRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                e.target.value = e.target.value.substring(0, start) + '    ' + e.target.value.substring(end);
                e.target.selectionStart = e.target.selectionEnd = start + 4;
                handleCodeChange(e);
              }
            }}
            className="flex-1 bg-[#0d1117] text-gray-200 font-mono text-sm p-4 resize-none outline-none border-none"
            spellCheck="false"
          />
        </div>

        {/* Bottom Tabs */}
        <div className="border border-[#1e2330] rounded-xl overflow-hidden">
          <div className="flex bg-[#11161f] border-b border-[#1e2330]">
            {['input', 'output', 'result'].map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm transition ${
                  activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'
                }`}
                onClick={() => switchTab(tab)}
              >
                {tab === 'input' && '📥 Test Input'}
                {tab === 'output' && '📤 Output'}
                {tab === 'result' && '🏆 Submission'}
              </button>
            ))}
          </div>
          <div className="p-3 bg-[#0f1219]">
            {activeTab === 'input' && (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full bg-[#1a202c] border border-[#1e2330] rounded-lg text-gray-200 p-2 font-mono text-sm resize-none outline-none"
                rows="3"
                placeholder="Enter custom input..."
              />
            )}
            {activeTab === 'output' && (
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{output || 'Run your code to see output...'}</pre>
            )}
            {activeTab === 'result' && (
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{result || 'Submit to see result...'}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}