/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Tag as TagIcon, 
  Trash2, 
  X, 
  StickyNote, 
  Check, 
  Filter,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- 데이터 모델 ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = "mymemo.notes";

// --- 초기 시드 데이터 ---
const SEED_DATA: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "디자인 시스템의 컬러 팔레트와 타이포그래피 원칙을 준수하여 작업을 진행해야 합니다. 특히 접근성을 고려한 대비비를 확인하세요.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 리팩터링\n3. 디자인 패턴의 아름다움\n4. 실용주의 프로그래머",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "메모 앱에 AI 요약 기능을 추가하거나, 칸반 보드 뷰를 도입해보는 것은 어떨까요? 사용자의 경험을 극대화할 수 있는 방향으로 고민이 필요합니다.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString()
  }
];

export default function App() {
  // --- 상태 관리 ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 새 메모 폼 상태
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTags, setFormTags] = useState("");

  // --- 초기 로딩 및 저장 ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setNotes(JSON.parse(saved));
    } else {
      setNotes(SEED_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, mounted]);

  // --- 비즈니스 로직 ---
  const tagsSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
      const term = searchQuery.toLowerCase();
      const matchesSearch = 
        note.title.toLowerCase().includes(term) || 
        note.body.toLowerCase().includes(term) ||
        note.tags.some(t => t.toLowerCase().includes(term));
      return matchesTag && matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, selectedTag, searchQuery]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() && !formBody.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      title: formTitle,
      body: formBody,
      tags: formTags.split(',').map(t => t.trim()).filter(t => t !== ""),
      updatedAt: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    resetForm();
    setIsModalOpen(false);
  };

  const handleDeleteNote = (id: number) => {
    if (window.confirm("이 메모를 삭제하시겠습니까?")) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormBody("");
    setFormTags("");
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <StickyNote size={24} strokeWidth={2.5} />
            <h1 className="text-xl font-bold tracking-tight">MyMemo</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium px-0.5">Simplify your thoughts</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <button
            onClick={() => setSelectedTag(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTag === null ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span>전체 메모</span>
            </div>
            <span className="text-xs opacity-60 font-mono">{notes.length}</span>
          </button>
          
          <div className="pt-4 pb-2 px-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</span>
          </div>

          {tagsSummary.map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTag === tag ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Hash size={14} className={selectedTag === tag ? "text-indigo-400" : "text-slate-300"} />
                <span className="truncate">{tag}</span>
              </div>
              <span className="text-xs opacity-60 font-mono">{count}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="제목, 내용, 태그 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
            />
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>새 메모</span>
          </button>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {selectedTag && (
              <div className="mb-6 flex items-center gap-2 text-slate-500">
                <Filter size={16} />
                <span className="text-sm">태그 필터: </span>
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">#{selectedTag}</span>
                <button onClick={() => setSelectedTag(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
            )}

            {filteredNotes.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4 }}
                      className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden"
                    >
                      {/* Delete Action Overlay */}
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex flex-col h-full">
                        <h3 className="font-bold text-lg mb-2 text-slate-800 pr-8 line-clamp-1">{note.title || "제목 없음"}</h3>
                        <p className="text-slate-600 text-sm flex-1 line-clamp-4 whitespace-pre-wrap leading-relaxed mb-4">
                          {note.body}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {note.tags.map(tag => (
                            <span 
                              key={tag} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag);
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md hover:bg-indigo-100 hover:text-indigo-600 cursor-pointer transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">검색 결과가 없습니다.</p>
                <p className="text-sm opacity-60">다른 키워드로 검색해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 h-[100dvh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm px-10"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
                  <StickyNote size={22} />
                  새 메모 작성
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">제목</label>
                  <input
                    autoFocus
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="아이디어를 적어보세요"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">내용</label>
                  <textarea
                    rows={6}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    placeholder="구체적인 내용을 입력하세요..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">태그 (쉼표로 구분)</label>
                  <div className="relative">
                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="업무, 디자인, 프로젝트..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                  >
                    <Check size={18} />
                    저장하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
