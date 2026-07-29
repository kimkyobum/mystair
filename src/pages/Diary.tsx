import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Calendar, 
  Smile, 
  Sparkles, 
  LogIn, 
  Database, 
  Check, 
  Tag,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth, DiaryEntry } from '../context/AuthContext';

const MOOD_OPTIONS = [
  { emoji: '🔥', label: '열정적' },
  { emoji: '😊', label: '성취감' },
  { emoji: '💡', label: '깨달음' },
  { emoji: '🌱', label: '성장중' },
  { emoji: '😌', label: '평온함' },
];

export default function Diary() {
  const { user, fetchDiaries, saveDiary, deleteDiary, loginWithGoogle } = useAuth();

  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState('🔥');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['성장기록', '자격증']);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadDiaryList = async () => {
    setLoading(true);
    try {
      if (user) {
        const fetched = await fetchDiaries();
        setDiaries(fetched);
      } else {
        // Fallback local storage
        const saved = localStorage.getItem('mystair_local_diaries');
        if (saved) {
          setDiaries(JSON.parse(saved));
        } else {
          // Default sample entry
          setDiaries([{
            id: 'sample-1',
            userId: 'local',
            title: '정보처리기능사 실기 공부 3일차',
            content: '오늘 알고리즘 문제 5개를 풀었다. 정렬 알고리즘 개념이 이제서야 완전히 이해되었다! 내일은 데이터베이스 SQL 기출문제를 집중 정리해야겠다.',
            date: new Date().toISOString().split('T')[0],
            mood: '🔥',
            tags: ['정보처리기능사', '알고리즘', '목표달성']
          }]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiaryList();
  }, [user]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      if (user) {
        await saveDiary({
          title: title.trim(),
          content: content.trim(),
          date,
          mood,
          tags
        });
        showToast('Firestore 데이터베이스에 성공적으로 저장되었습니다!');
      } else {
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          userId: 'local',
          title: title.trim(),
          content: content.trim(),
          date,
          mood,
          tags
        };
        const updated = [newEntry, ...diaries];
        setDiaries(updated);
        localStorage.setItem('mystair_local_diaries', JSON.stringify(updated));
        showToast('성장 다이어리가 로컬에 저장되었습니다! (로그인시 DB동기화)');
      }

      // Reset form
      setTitle('');
      setContent('');
      setShowAddForm(false);
      loadDiaryList();
    } catch (err) {
      console.error(err);
      showToast('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('이 다이어리 기록을 삭제하시겠습니까?')) return;

    try {
      if (user) {
        await deleteDiary(id);
      } else {
        const updated = diaries.filter(d => d.id !== id);
        setDiaries(updated);
        localStorage.setItem('mystair_local_diaries', JSON.stringify(updated));
      }
      showToast('다이어리 기록이 삭제되었습니다.');
      loadDiaryList();
    } catch (err) {
      console.error(err);
      showToast('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="h-full flex-1 overflow-y-auto bg-[#0B0F17] text-white font-sans flex flex-col relative pb-28">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-indigo-400 animate-bounce">
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md h-[72px] w-full flex items-center justify-between px-6 sm:px-10 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <BookOpen size={24} className="text-indigo-400" />
          <h1 className="text-xl font-black tracking-tight text-white">성장 다이어리</h1>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/30">
            Firestore DB 연동
          </span>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs text-emerald-300 font-bold">
              <Database size={14} className="text-emerald-400" />
              <span>{user.email || user.displayName || '구글 연동중'}</span>
            </div>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn size={14} />
              <span>구글 로그인 (DB 저장)</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
              <Sparkles className="text-amber-400" size={24} />
              <span>나만의 성장의 계단 기록장</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              오늘 배운 직무 기술, 자격증 공부 일지, 느낀 점을 기록하고 회원별 데이터베이스에 안전하게 보관해보세요!
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-3 rounded-2xl text-xs font-extrabold transition shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>{showAddForm ? '작성 취소' : '새 다이어리 작성'}</span>
          </button>
        </div>

        {/* Form Modal / Inline Box */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <BookOpen size={18} className="text-indigo-400" />
              <span>새 성장 일지 작성하기</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">제목</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: PLC 제어 실습 성공 기록"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">날짜 및 기분</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  />
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    {MOOD_OPTIONS.map(m => (
                      <button
                        key={m.emoji}
                        type="button"
                        onClick={() => setMood(m.emoji)}
                        className={`p-1.5 rounded-lg text-sm transition cursor-pointer ${
                          mood === m.emoji ? 'bg-indigo-600 scale-110 shadow' : 'hover:bg-slate-700'
                        }`}
                        title={m.label}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">일지 내용</label>
              <textarea 
                rows={4}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="오늘 배운 핵심 내용, 해결한 과제, 자격증 준비 상황 등을 솔직하게 자유롭게 적어보세요..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm font-medium text-white outline-none focus:border-indigo-500 leading-relaxed"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">태그 추가</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="태그 입력 후 Enter"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  추가
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="bg-indigo-900/60 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-500/30 flex items-center gap-1">
                    <span>#{t}</span>
                    <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-red-400 cursor-pointer">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check size={16} />
                <span>데이터베이스에 저장</span>
              </button>
            </div>
          </form>
        )}

        {/* Diary List */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>나의 성장 일지 목록 ({diaries.length}개)</span>
            {user && <span className="text-emerald-400 text-xs font-bold">✓ Firestore DB 동기화 완료</span>}
          </h3>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm font-medium">
              데이터베이스에서 기록을 불러오는 중...
            </div>
          ) : diaries.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <BookOpen size={36} className="mx-auto text-slate-600" />
              <p className="text-slate-400 text-sm font-bold">아직 작성된 성장 다이어리가 없습니다.</p>
              <p className="text-slate-500 text-xs">상단의 [새 다이어리 작성] 버튼을 눌러 첫 기록을 남겨보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {diaries.map(diary => (
                <div 
                  key={diary.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all shadow-md space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{diary.mood || '🔥'}</span>
                        <h4 className="text-lg font-extrabold text-white">{diary.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-indigo-400" />
                          <span>{diary.date}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="opacity-60 group-hover:opacity-100 hover:text-red-400 text-slate-500 p-2 transition cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-sm font-normal text-slate-300 leading-relaxed whitespace-pre-wrap pt-1">
                    {diary.content}
                  </p>

                  {diary.tags && diary.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {diary.tags.map(t => (
                        <span key={t} className="bg-slate-800 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-slate-700">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
