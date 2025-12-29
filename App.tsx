import React, { useState, useEffect, useRef } from 'react';
import { KeyboardMode, TypingSession } from './types';
import { transliterateText, refineHindiText } from './services/geminiService';
import Keyboard from './components/Keyboard';

const App: React.FC = () => {
  const [files, setFiles] = useState<TypingSession[]>(() => {
    const saved = localStorage.getItem('desh_hindi_files');
    if (saved) return JSON.parse(saved);
    return [{ id: 'welcome', text: '<div>स्वागत है! यहाँ टाइप करना शुरू करें...</div>', timestamp: Date.now() }];
  });
  
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || '');
  const [mode, setMode] = useState<KeyboardMode>(KeyboardMode.HINDI);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [suggestionCoords, setSuggestionCoords] = useState({ top: 0, left: 0 });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [activeStyles, setActiveStyles] = useState<{ [key: string]: boolean }>({});
  
  // Responsive States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackBody, setFeedbackBody] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('desh_hindi_files', JSON.stringify(files));
  }, [files]);

  // Sync editor content when active file changes
  useEffect(() => {
    const active = files.find(f => f.id === activeFileId);
    if (editorRef.current && active && editorRef.current.innerHTML !== active.text) {
      editorRef.current.innerHTML = active.text;
    }
    updateActiveStyles();
  }, [activeFileId]);

  const updateActiveStyles = () => {
    if (typeof document === 'undefined') return;
    const styles = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    };
    setActiveStyles(styles);
  };

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const updateActiveText = (newHtml: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, text: newHtml, timestamp: Date.now() } : f));
  };

  const execCommand = (command: string, value: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    updateActiveStyles();
    updateActiveText(editorRef.current?.innerHTML || '');
  };

  const applySuggestion = (suggested: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    const offset = range.startOffset;

    let wordToReplace = "";
    if (textNode.nodeType === Node.TEXT_NODE) {
      const content = textNode.textContent || "";
      const textBefore = content.substring(0, offset);
      const words = textBefore.split(/[\s\u00A0]/);
      wordToReplace = words[words.length - 1];
    }

    if (wordToReplace) {
      range.setStart(textNode, offset - wordToReplace.length);
      range.setEnd(textNode, offset);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    document.execCommand('insertText', false, suggested + ' ');

    setSuggestions([]);
    setSelectedSuggestionIndex(0);
    updateActiveText(editorRef.current?.innerHTML || '');
    editorRef.current?.focus();
  };

  const updateSuggestionPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0).cloneRange();
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const rect = rects[0];
        
        // Ensure suggestion box stays within viewport
        let top = rect.bottom + window.scrollY + 8;
        let left = rect.left + window.scrollX;
        
        if (left + 192 > window.innerWidth) { // 192px is w-48
          left = window.innerWidth - 208;
        }
        
        setSuggestionCoords({ top, left });
      }
    }
  };

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    updateActiveText(html);

    if (mode === KeyboardMode.HINDI) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        if (textNode.nodeType === Node.TEXT_NODE) {
          const textBeforeCursor = textNode.textContent?.substring(0, range.startOffset) || '';
          const words = textBeforeCursor.split(/[\s\u00A0]/);
          const lastWord = words[words.length - 1];

          if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
            transliterateText(lastWord).then(translit => {
              setSuggestions([...translit, lastWord]);
              setSelectedSuggestionIndex(0);
              updateSuggestionPosition();
            });
          } else {
            setSuggestions([]);
            setSelectedSuggestionIndex(0);
          }
        }
      }
    }
    updateActiveStyles();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (suggestions.length > 0 && mode === KeyboardMode.HINDI) {
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const index = parseInt(e.key) - 1;
        if (suggestions[index]) {
          e.preventDefault();
          applySuggestion(suggestions[index]);
          return;
        }
      }
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIndex]);
        return;
      }

      if (e.key === ' ' ) {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIndex]);
        return;
      }

      if (e.key === 'Escape') {
        setSuggestions([]);
        setSelectedSuggestionIndex(0);
      }
    }
  };

  const startVoiceTyping = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice typing is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = mode === KeyboardMode.HINDI ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      execCommand('insertText', transcript + ' ');
      handleInput();
    };

    recognition.start();
  };

  const handleRefine = async () => {
    if (!editorRef.current || isRefining) return;
    const plainText = editorRef.current.innerText;
    if (!plainText.trim()) return;

    setIsRefining(true);
    const refined = await refineHindiText(plainText);
    editorRef.current.innerText = refined;
    updateActiveText(editorRef.current.innerHTML);
    setIsRefining(false);
  };

  const createNewFile = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newFile = { id: newId, text: '<div><br></div>', timestamp: Date.now() };
    setFiles([newFile, ...files]);
    setActiveFileId(newId);
    setSuggestions([]);
    setSelectedSuggestionIndex(0);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (files.length <= 1) {
      if (editorRef.current) editorRef.current.innerHTML = '<div><br></div>';
      updateActiveText('<div><br></div>');
      return;
    }
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) {
      setActiveFileId(newFiles[0].id);
    }
  };

  const copyText = () => {
    const content = editorRef.current?.innerText || '';
    navigator.clipboard.writeText(content);
    alert('क्लिपबोर्ड पर कॉपी किया गया!');
  };

  const triggerImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const base64 = readerEvent.target?.result as string;
          execCommand('insertImage', base64);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const groupedFiles = (Object.entries(files.reduce((groups, file) => {
    const date = formatDate(file.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(file);
    return groups;
  }, {} as Record<string, TypingSession[]>)) as [string, TypingSession[]][]);

  const toolbarBtnClass = (active: boolean) => 
    `p-2 rounded-lg transition-colors flex items-center justify-center w-9 h-9 shrink-0 ${
      active 
        ? 'bg-emerald-100 text-emerald-700 font-bold' 
        : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
    }`;

  const handlePrint = () => {
    window.print();
  };

  const handleFontSizeChange = (val: number) => {
    setFontSize(val);
  };

  const handleSendFeedback = () => {
    const email = 'ibadurrehman@yahoo.com';
    const subject = encodeURIComponent('Desh Hindi App Feedback');
    const body = encodeURIComponent(feedbackBody);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setIsFeedbackModalOpen(false);
    setFeedbackBody('');
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden text-slate-800 font-sans print:bg-white print:h-auto print:block print:overflow-visible">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-xl md:shadow-sm z-50 transform transition-transform duration-300 ease-in-out print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0f3d3d] text-white rounded-xl flex items-center justify-center font-bold text-lg devanagari shadow-inner">
              अ
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">Desh Hindi</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="px-4 mb-4">
          <button 
            onClick={createNewFile}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-[#009688] hover:bg-[#00796B] rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            New Document
          </button>
        </div>

        <nav className="flex-grow overflow-y-auto px-3 space-y-6 pb-4">
          {groupedFiles.map(([date, items]) => (
            <div key={date}>
              <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{date}</p>
              <div className="space-y-1">
                {items.map(file => (
                  <div
                    key={file.id}
                    onClick={() => {
                      setActiveFileId(file.id);
                      setSuggestions([]);
                      setSelectedSuggestionIndex(0);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`group relative flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-xl cursor-pointer transition-all ${
                      activeFileId === file.id 
                        ? 'bg-[#eef5ee] text-[#0f3d3d] font-semibold' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate flex-grow pr-4 devanagari">
                      {file.text.replace(/<[^>]*>?/gm, '').trim() || 'Empty Document'}
                    </span>
                    <button 
                      onClick={(e) => deleteFile(e, file.id)}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 hover:text-rose-500 transition-opacity"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setIsFeedbackModalOpen(true)}
            className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-all mb-2 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-comment-dots"></i>
            Feedback
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden relative print:static print:h-auto print:overflow-visible print:block">
        
        {/* Editor Toolbar - Optimized for Mobile */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0 z-40 print:hidden overflow-x-auto no-scrollbar">
          
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden p-2 -ml-1 mr-1 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
          >
            <i className="fa-solid fa-bars-staggered"></i>
          </button>

          <div className="flex items-center border-r border-slate-200 pr-2 mr-1 shrink-0">
            <button onClick={() => execCommand('undo')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Undo"><i className="fa-solid fa-rotate-left text-sm"></i></button>
            <button onClick={() => execCommand('redo')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Redo"><i className="fa-solid fa-rotate-right text-sm"></i></button>
          </div>

          <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1 shrink-0">
            <button onClick={() => execCommand('bold')} className={toolbarBtnClass(!!activeStyles.bold)} title="Bold">B</button>
            <button onClick={() => execCommand('italic')} className={toolbarBtnClass(!!activeStyles.italic)} title="Italic">/</button>
            <button onClick={() => execCommand('underline')} className={toolbarBtnClass(!!activeStyles.underline)} title="Underline">U</button>
          </div>

          <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1 shrink-0">
            <button onClick={() => execCommand('justifyLeft')} className={toolbarBtnClass(!!activeStyles.justifyLeft)} title="Align Left"><i className="fa-solid fa-align-left text-sm"></i></button>
            <button onClick={() => execCommand('justifyCenter')} className={toolbarBtnClass(!!activeStyles.justifyCenter)} title="Align Center"><i className="fa-solid fa-align-center text-sm"></i></button>
            <button onClick={() => execCommand('insertUnorderedList')} className={toolbarBtnClass(!!activeStyles.insertUnorderedList)} title="Unordered List"><i className="fa-solid fa-list-ul text-sm"></i></button>
            <button onClick={() => execCommand('insertOrderedList')} className={toolbarBtnClass(!!activeStyles.insertOrderedList)} title="Ordered List"><i className="fa-solid fa-list-ol text-sm"></i></button>
          </div>

          <div className="flex items-center gap-2 border-r border-slate-200 pr-3 mr-1 shrink-0">
            <i className="fa-solid fa-font text-slate-400 text-xs hidden sm:block"></i>
            <input 
              type="range" 
              min="8" 
              max="72" 
              step="1"
              value={fontSize} 
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
              className="w-16 sm:w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              title="Font Size Slider"
            />
            <span className="w-6 text-[11px] font-bold text-slate-500 tabular-nums select-none">{fontSize}</span>
          </div>

          <div className="flex items-center gap-2 flex-grow shrink-0">
            <button 
              onClick={handleRefine}
              disabled={isRefining || !activeFile.text.trim()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all border border-indigo-100 shrink-0 ${
                isRefining 
                  ? 'bg-indigo-50 text-indigo-400' 
                  : 'text-indigo-600 hover:bg-indigo-50 active:scale-95'
              }`}
            >
              <i className={`fa-solid ${isRefining ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
              <span className="hidden xs:inline">AI REFINE</span>
              <span className="xs:hidden">AI</span>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={triggerImageUpload} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400" title="Insert Image"><i className="fa-solid fa-image text-sm"></i></button>
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-all font-bold text-xs shrink-0" 
              title="Print"
            >
              <i className="fa-solid fa-print text-sm"></i>
              <span className="hidden sm:inline">PRINT</span>
            </button>
          </div>
        </header>

        {/* Editor Container */}
        <div className="flex-grow overflow-y-auto bg-[#f8f9fa] flex flex-col items-center py-4 md:py-8 px-2 md:px-4 scroll-smooth print:p-0 print:bg-white print:overflow-visible print:block print:h-auto">
          <div className="w-full max-w-[850px] bg-white min-h-screen md:min-h-[1100px] rounded-sm md:shadow-[0_1px_3px_rgba(0,0,0,0.1)] md:border border-slate-200 flex flex-col relative transition-shadow hover:shadow-md mb-20 md:mb-32 print:shadow-none print:border-none print:m-0 print:max-w-none print:min-h-0 print:block">
            
            <div className="flex-grow p-6 sm:p-16 md:p-24 relative print:p-0">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onMouseUp={updateActiveStyles}
                onKeyUp={updateActiveStyles}
                placeholder="यहाँ टाइप करना शुरू करें..."
                className="w-full h-full min-h-[500px] md:min-h-[800px] outline-none devanagari leading-[1.8] text-slate-800 border-none bg-transparent print:min-h-0 print:h-auto"
                style={{ fontSize: `${fontSize}px` }}
              />

              {/* Dynamic Positioning Suggestions Popup */}
              {suggestions.length > 0 && mode === KeyboardMode.HINDI && (
                <div 
                  className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl w-48 z-[9999] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:hidden"
                  style={{ 
                    top: suggestionCoords.top, 
                    left: suggestionCoords.left 
                  }}
                >
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => applySuggestion(s)}
                      onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                      className={`text-left px-4 py-3 flex items-center gap-3 text-sm transition-all border-b border-slate-50 last:border-0 ${
                        selectedSuggestionIndex === idx 
                          ? 'bg-emerald-50 text-emerald-900 font-bold' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-slate-300 w-3 shrink-0">{idx + 1}</span>
                      <span className="devanagari text-lg flex-grow truncate">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Floating Editor Controls - Fully Responsive */}
            <div className="fixed md:sticky bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-[92%] sm:w-fit px-3 sm:px-6 py-2 sm:py-3 bg-white/95 backdrop-blur shadow-2xl border border-slate-200/50 rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-6 z-30 ring-1 ring-black/5 print:hidden">
              <div className="flex p-1 bg-slate-100/50 rounded-xl w-full sm:w-auto">
                <button 
                  onClick={() => setMode(KeyboardMode.HINDI)}
                  className={`flex-grow sm:px-6 py-2 rounded-lg text-[10px] font-black transition-all ${mode === KeyboardMode.HINDI ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  हिन्दी
                </button>
                <button 
                  onClick={() => setMode(KeyboardMode.ENGLISH)}
                  className={`flex-grow sm:px-6 py-2 rounded-lg text-[10px] font-black transition-all ${mode === KeyboardMode.ENGLISH ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  ENGLISH
                </button>
              </div>

              <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
                <button 
                  onClick={startVoiceTyping}
                  className={`flex-grow sm:flex-none group flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-slate-200 rounded-xl transition-all text-[10px] font-bold ${isListening ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  title="Voice Typing"
                >
                  <i className={`fa-solid ${isListening ? 'fa-microphone' : 'fa-microphone-lines'} transition-colors`}></i>
                  <span className="hidden xs:inline">{isListening ? 'LISTENING' : 'VOICE'}</span>
                </button>
                <button 
                  onClick={copyText}
                  className="flex-grow sm:flex-none group flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-[10px] font-bold text-slate-600"
                >
                  <i className="fa-solid fa-copy text-slate-400 group-hover:text-emerald-500 transition-colors"></i>
                  COPY
                </button>
                <button 
                  onClick={() => setIsKeyboardVisible(!isKeyboardVisible)}
                  className={`shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all ${isKeyboardVisible ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'text-slate-400'}`}
                >
                  <i className={`fa-solid fa-keyboard transition-transform ${isKeyboardVisible ? 'scale-110' : ''}`}></i>
                </button>
              </div>
            </div>

            {/* In-Editor Keyboard Overlay - Optimized for Touch */}
            {isKeyboardVisible && (
              <div className="fixed md:static inset-x-0 bottom-0 bg-white/95 md:bg-slate-50/80 backdrop-blur-md md:backdrop-blur-sm p-4 md:p-8 border-t border-slate-200 animate-in slide-in-from-bottom duration-300 rounded-b-sm z-[60] md:z-auto print:hidden">
                <div className="flex justify-between items-center mb-4 md:mb-6 px-2 md:px-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Devanagari Layout</h4>
                  <button onClick={() => setIsKeyboardVisible(false)} className="p-2 text-slate-300 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className="max-h-[50vh] overflow-y-auto overflow-x-hidden pb-4 md:pb-0">
                  <Keyboard onKeyPress={(key) => {
                    if (key === 'BACKSPACE') execCommand('delete');
                    else if (key === 'ENTER') execCommand('insertLineBreak');
                    else execCommand('insertText', key);
                    handleInput();
                  }} darkMode={false} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-paper-plane text-emerald-600"></i>
                Send Feedback
              </h3>
              <button 
                onClick={() => setIsFeedbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                We'd love to hear your thoughts! Your feedback helps us improve Desh Hindi.
              </p>
              <textarea
                value={feedbackBody}
                onChange={(e) => setFeedbackBody(e.target.value)}
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm resize-none"
                placeholder="What's on your mind?"
              />
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setIsFeedbackModalOpen(false)}
                className="flex-grow py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendFeedback}
                disabled={!feedbackBody.trim()}
                className="flex-grow py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scroll to Top Hide Custom UI for Toolbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;