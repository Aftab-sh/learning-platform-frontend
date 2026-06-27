// src/pages/student/CodingPractice.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
  import config from '../../config/config';



export default function CodingPractice()
 {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams(); 
  
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState('');
  const [langId, setLangId] = useState(71);
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('input');
  const [difficulty, setDifficulty] = useState('all');
  const [solved, setSolved] = useState(new Set());
  const codeEditorRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const saveTimeoutRef = useRef(null);


const API_BASE = config.API_BASE;

  const templates = {
    71: '# Python\na, b = map(int, input().split())\nprint(a + b)',
    62: '// Java\nimport java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        while (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            System.out.println(a + b);\n        }\n        sc.close();\n    }\n}',
    50: '// C\n#include <stdio.h>\nint main() {\n    int a, b;\n    while (scanf("%d %d", &a, &b) != EOF) {\n        printf("%d\\n", a + b);\n    }\n    return 0;\n}',
    54: '// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    while (cin >> a >> b) {\n        cout << a + b << endl;\n    }\n    return 0;\n}'
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadProblems();
  }, [difficulty, moduleId]); 

  // ─── LOAD MODULE SPECIFIC PROBLEMS ───
  const loadProblems = async () => {
    setLoading(true);
    try {
      // ✅ FIX: Backend ke dynamic mapping path ko direct hit kiya module-specific tasks ke liye
      let url = `${API_BASE}/api/student/module/${moduleId}/coding-problems`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to load problems');
      let data = await res.json();
      
      // ✅ Frontend client-side difficulty filtering handle kar rha hai agar optional filter active ho
      if (difficulty !== 'all') {
        data = data.filter(p => p.difficulty && p.difficulty.toLowerCase() === difficulty.toLowerCase());
      }
      
      setProblems(data);
      
      // Load solved status
      const solvedRes = await fetch(`${API_BASE}/api/student/coding/solved/${moduleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      let solvedSet = new Set();
      if (solvedRes.ok) {
        const solvedData = await solvedRes.json();
        solvedSet = new Set(solvedData.map(id => String(id)));
        setSolved(solvedSet);
      }

      if (data.length > 0) {
        const firstProb = data[0];
        setCurrentProblem(firstProb);
        const saved = localStorage.getItem(`practice_code_${firstProb.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.langId == langId) setCode(parsed.code);
            else setCode(templates[langId] || '');
          } catch(e) { setCode(templates[langId] || ''); }
        } else {
          setCode(templates[langId] || '');
        }
      } else {
        setCurrentProblem(null);
        setCode('');
      }
    } catch (err) {
      setOutput('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveCode = () => {
    if (currentProblem) {
      localStorage.setItem(`practice_code_${currentProblem.id}`, JSON.stringify({ code, langId }));
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
    
    if (currentProblem) {
      const saved = localStorage.getItem(`practice_code_${currentProblem.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.langId == newLang) {
            setCode(parsed.code);
            setTimeout(updateLineNumbers, 50);
            return;
          }
        } catch(e) {}
      }
    }
    setCode(templates[newLang] || '');
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
    if (!currentProblem) { alert('Select a problem first'); return; }
    saveCode();
    setActiveTab('result');
    setResult('Judging...');
    try {
      const res = await fetch(`${API_BASE}/api/student/coding/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: currentProblem.id,
          sourceCode: code,
          languageId: langId
        })
      });
      const data = await res.json();
      if (data.passed) {
        setSolved(prev => new Set([...prev, String(currentProblem.id)]));
        setResult(`✅ Accepted! +${data.marks || currentProblem.marks} marks\n\nYour output:\n${data.actualOutput || ''}`);
      } else {
        setResult(`❌ ${data.status || 'Rejected'}\n${data.message || 'Wrong Answer'}\n\nYour output:\n${data.actualOutput || ''}\n\nExpected:\n${data.expectedOutput || ''}`);
      }
    } catch (err) {
      setResult('Error: ' + err.message);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  const handleProblemSelect = (problem) => {
    if (currentProblem) {
      localStorage.setItem(`practice_code_${currentProblem.id}`, JSON.stringify({ code, langId }));
    }

    setCurrentProblem(problem);
    const saved = localStorage.getItem(`practice_code_${problem.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.langId == langId) setCode(parsed.code);
        else setCode(templates[langId] || '');
      } catch(e) { setCode(templates[langId] || ''); }
    } else {
      setCode(templates[langId] || '');
    }
    setTimeout(updateLineNumbers, 50);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    updateLineNumbers();
  }, [code]);

  return (
    <div className="min-h-screen bg-[#0a0d12] text-gray-200 font-sans flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-[#0f1219] px-6 py-3 border-b border-[#1e2330] flex-shrink-0">
        <div className="text-lg font-bold text-[#00e0ff]">&lt;CodeLearn/&gt;</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student-dashboard')}
            className="border border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 px-4 py-1.5 rounded-lg text-sm transition cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-lg text-sm transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Problem List */}
        <div className="w-80 bg-[#0f1219] border-r border-[#1e2330] flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-3 flex gap-2 flex-wrap border-b border-[#1e2330]">
            {['all', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                className={`px-3 py-1 rounded-full text-xs border transition cursor-pointer ${
                  difficulty === diff
                    ? 'bg-cyan-400 text-black border-cyan-400'
                    : 'border-gray-700 text-gray-400 hover:border-cyan-400'
                }`}
                onClick={() => setDifficulty(diff)}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-400 p-4">Loading module problems...</div>
            ) : problems.length === 0 ? (
              <div className="text-center text-gray-400 p-4">No specific coding tasks for this module.</div>
            ) : (
              problems.map((p) => {
                const isSolved = solved.has(String(p.id));
                const isActive = currentProblem?.id === p.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-4 py-3 border-b border-[#1e2330] cursor-pointer transition ${
                      isActive ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : 'hover:bg-[#161b27]'
                    }`}
                    onClick={() => handleProblemSelect(p)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSolved ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {isSolved ? '✓' : '○'}
                      </span>
                      <span className="text-sm font-medium">{p.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      p.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {p.difficulty || 'Easy'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Problem Description Panel */}
          {currentProblem ? (
            <div className="p-4 bg-[#11161f] border-b border-[#1e2330] flex-shrink-0 max-h-56 overflow-y-auto">
              <h3 className="font-bold text-white text-base">{currentProblem.title}</h3>
              <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{currentProblem.description}</p>
              
              {currentProblem.constraintsText && (
                <div className="text-xs text-gray-500 mt-2">
                  <span className="font-semibold text-gray-400">Constraints:</span> {currentProblem.constraintsText}
                </div>
              )}

              {currentProblem.sampleInput && (
                <div className="mt-3 bg-[#0d1117] p-3 rounded-lg border border-[#1e2330] grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Sample Input:</div>
                    <pre className="text-xs text-cyan-400 font-mono bg-[#161b26] p-2 rounded border border-[#1e2330]">{currentProblem.sampleInput}</pre>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Sample Output:</div>
                    <pre className="text-xs text-green-400 font-mono bg-[#161b26] p-2 rounded border border-[#1e2330]">{currentProblem.sampleOutput}</pre>
                  </div>
                </div>
              )}
              <div className="flex gap-4 mt-3 text-xs font-semibold text-gray-500 border-t border-[#1e2330] pt-2">
                <span>Difficulty: <span className={currentProblem.difficulty === 'Easy' ? 'text-green-400' : currentProblem.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}>{currentProblem.difficulty}</span></span>
                <span>Marks: <span className="text-cyan-400">{currentProblem.marks}</span></span>
                {solved.has(String(currentProblem.id)) && <span className="text-green-400">🎉 Solved</span>}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">Please select a module exercise problem from the sidebar list.</div>
          )}

          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#11161f] border-b border-[#1e2330] flex-shrink-0">
            <select
              value={langId}
              onChange={handleLangChange}
              className="bg-[#1a202c] border border-[#1e2330] text-gray-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none cursor-pointer"
            >
              <option value="71">🐍 Python</option>
              <option value="62">☕ Java</option>
              <option value="50">🔵 C</option>
              <option value="54">🟣 C++</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={runCode}
                disabled={!currentProblem}
                className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50"
              >
                ▶ Run Code
              </button>
              <button
                onClick={submitCode}
                disabled={!currentProblem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-lg text-sm font-bold transition cursor-pointer shadow-md shadow-blue-900/20 disabled:opacity-50"
              >
                ✓ Submit Assignment
              </button>
            </div>
          </div>

          {/* Code Editor Body */}
          <div className="flex-1 flex overflow-hidden bg-[#0d1117]">
            <div
              ref={lineNumbersRef}
              className="w-12 text-right px-2 py-4 text-xs text-gray-600 font-mono bg-[#0d1117] border-r border-[#1e2330] select-none overflow-hidden flex-shrink-0 leading-6"
            >
              1
            </div>
            <textarea
              ref={codeEditorRef}
              value={code}
              onChange={handleCodeChange}
              disabled={!currentProblem}
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
              className="flex-1 bg-[#0d1117] text-gray-200 font-mono text-sm p-4 resize-none outline-none border-none leading-6 disabled:opacity-50"
              spellCheck="false"
              placeholder="// Select a problem to unlock the code layout space..."
            />
          </div>

          {/* Bottom Tabs Console Control */}
          <div className="h-48 flex flex-col flex-shrink-0 border-t border-[#1e2330] bg-[#0f1219]">
            <div className="flex border-b border-[#1e2330] flex-shrink-0 bg-[#11161f]">
              {['input', 'output', 'result'].map(tab => (
                <button
                  key={tab}
                  className={`px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                    activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#0f1219]' : 'text-gray-500 hover:text-gray-300'
                  }`}
                  onClick={() => switchTab(tab)}
                >
                  {tab === 'input' && '📥 Custom Input'}
                  {tab === 'output' && '📤 Console Output'}
                  {tab === 'result' && '🏆 Evaluation'}
                </button>
              ))}
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
              {activeTab === 'input' && (
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  disabled={!currentProblem}
                  className="w-full h-full bg-[#1a202c] border border-[#1e2330] rounded-lg text-gray-200 p-3 font-mono text-sm resize-none outline-none focus:border-cyan-500/50 disabled:opacity-50"
                  placeholder="Enter custom input buffer details here..."
                />
              )}
              {activeTab === 'output' && (
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap bg-[#1a202c] p-3 rounded-lg border border-[#1e2330] h-full overflow-y-auto">{output || 'Execute your source block to check raw standard outputs...'}</pre>
              )}
              {activeTab === 'result' && (
                <pre className="text-sm font-mono whitespace-pre-wrap bg-[#1a202c] p-3 rounded-lg border border-[#1e2330] h-full overflow-y-auto text-gray-300">{result || 'Submit problem statements to evaluate assertions...'}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}