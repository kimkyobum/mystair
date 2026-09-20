import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  X
} from 'lucide-react';
import { useLanguage } from '../friend_site/LanguageContext';

interface MiniDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  isLightMode?: boolean;
  align?: 'left' | 'right';
  dropUp?: boolean;
  className?: string;
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MiniDatePicker({
  value,
  onChange,
  placeholder = '연도-월-일',
  isLightMode = true,
  align = 'left',
  dropUp,
  className = ''
}: MiniDatePickerProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number } | null>(null);

  // Parse initial year and month
  const today = new Date();
  const parsedDate = value ? new Date(value) : null;
  const initialYear = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : today.getFullYear();
  const initialMonth = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getMonth() + 1 : today.getMonth() + 1;

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Sync view when opening
  useEffect(() => {
    if (isOpen) {
      if (value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(y) && !isNaN(m)) {
            setViewYear(y);
            setViewMonth(m);
          }
        }
      } else {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth() + 1);
      }
    }
  }, [isOpen, value]);

  // Dynamic position calculation for floating portal (never clipped by modal overflow)
  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = 270;
    const popoverHeight = 315;
    const margin = 6;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Automatic dropUp detection if not enough space below
    let shouldDropUp = dropUp;
    if (shouldDropUp === undefined) {
      shouldDropUp = spaceBelow < popoverHeight + margin && spaceAbove > spaceBelow;
    } else if (!shouldDropUp && spaceBelow < popoverHeight + margin && spaceAbove > popoverHeight + margin) {
      shouldDropUp = true;
    }

    let top = shouldDropUp ? rect.top - popoverHeight - margin : rect.bottom + margin;
    let left = align === 'right' ? rect.right - popoverWidth : rect.left;

    // Clamp horizontally to viewport
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    // Clamp vertically to viewport
    if (top + popoverHeight > window.innerHeight - 8) {
      top = window.innerHeight - popoverHeight - 8;
    }
    if (top < 8) {
      top = 8;
    }

    setPopoverCoords({ top, left });
  };

  // Re-calculate position on open, scroll, or resize
  useEffect(() => {
    if (!isOpen) return;
    calculatePosition();

    const handleUpdate = () => {
      calculatePosition();
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isOpen, dropUp, align]);

  // Click outside to close (checking both button and portal popover)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(prev => prev - 1);
      setViewMonth(12);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(prev => prev + 1);
      setViewMonth(1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const prevYear = () => setViewYear(prev => prev - 1);
  const nextYear = () => setViewYear(prev => prev + 1);

  // Days in month
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 = Sun

  const todayString = getTodayString();

  const handleSelectDate = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    onChange(todayString);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className={`relative flex-1 ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!isOpen) calculatePosition();
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between gap-1.5 border rounded-xl px-2.5 py-2 text-xs font-medium transition-all text-left cursor-pointer outline-none ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
            : isLightMode
              ? "bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-slate-50/80"
              : "bg-slate-900/90 border-slate-700 text-white hover:border-emerald-500/80 hover:bg-slate-800/80"
        }`}
      >
        <span className={`truncate font-semibold ${value ? (isLightMode ? "text-slate-900" : "text-white") : (isLightMode ? "text-slate-400 font-normal" : "text-slate-500 font-normal")}`}>
          {value || t(placeholder)}
        </span>
        
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              title={t('날짜 삭제')}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={12} />
            </span>
          )}
          <CalendarIcon 
            size={14} 
            className={`transition-colors ${value ? "text-emerald-500" : isLightMode ? "text-slate-400" : "text-slate-500"}`} 
          />
        </div>
      </button>

      {/* Floating Popover via React Portal - Escapes any overflow:hidden or modal bounds */}
      {isOpen && popoverCoords && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${popoverCoords.top}px`,
            left: `${popoverCoords.left}px`,
            zIndex: 99999
          }}
          className={`w-[270px] rounded-2xl p-3 border shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none ${
            isLightMode 
              ? "bg-white border-slate-200/90 text-slate-900 shadow-2xl shadow-slate-900/20 ring-1 ring-black/5" 
              : "bg-slate-900 border-slate-700 text-white shadow-2xl shadow-black/80 ring-1 ring-white/10"
          }`}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={prevYear}
                title={t('1년 전')}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <ChevronsLeft size={15} />
              </button>
              <button
                type="button"
                onClick={prevMonth}
                title={t('1개월 전')}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
            </div>

            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 tracking-tight">
              <span>{viewYear}년</span>
              <span>{viewMonth}월</span>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={nextMonth}
                title={t('1개월 후')}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
              <button
                type="button"
                onClick={nextYear}
                title={t('1년 후')}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {dayNames.map((name, idx) => (
              <span
                key={name}
                className={`text-[11px] font-bold py-1 ${
                  idx === 0 
                    ? "text-rose-500" 
                    : idx === 6 
                      ? "text-sky-500" 
                      : isLightMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {name}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`blank-${idx}`} className="w-8 h-8" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const formatted = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = formatted === value;
              const isToday = formatted === todayString;
              const dayOfWeek = (firstDayOfWeek + idx) % 7;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white font-bold shadow-xs scale-105"
                      : isToday
                        ? isLightMode
                          ? "border border-emerald-500 text-emerald-700 bg-emerald-50/50 font-bold hover:bg-emerald-100"
                          : "border border-emerald-500 text-emerald-300 bg-emerald-950/40 font-bold hover:bg-emerald-900/60"
                        : isLightMode
                          ? dayOfWeek === 0
                            ? "text-rose-600 hover:bg-slate-100"
                            : dayOfWeek === 6
                              ? "text-sky-600 hover:bg-slate-100"
                              : "text-slate-700 hover:bg-slate-100"
                          : dayOfWeek === 0
                            ? "text-rose-400 hover:bg-slate-800"
                            : dayOfWeek === 6
                              ? "text-sky-400 hover:bg-slate-800"
                              : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action Buttons */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectToday}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  isLightMode 
                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200" 
                    : "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80"
                }`}
              >
                {t('오늘')}
              </button>
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    isLightMode 
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-600" 
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {t('비우기')}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                isLightMode 
                  ? "hover:bg-slate-100 text-slate-500" 
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              {t('닫기')}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
