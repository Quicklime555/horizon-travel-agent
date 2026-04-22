import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "选择日期" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  
  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onChange?.(formattedDate);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = startDayOfMonth(year, month);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const isSelected = value === new Date(year, month, d).toISOString().split('T')[0];
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      days.push(
        <button
          key={d}
          onClick={() => handleDateClick(d)}
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-full text-[13px] font-medium transition-all",
            isSelected ? "bg-black text-white" : "hover:bg-gray-100 text-[#1D1D1F]",
            isToday && !isSelected && "text-indigo-600 border border-indigo-100"
          )}
        >
          {d}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative group cursor-pointer w-full pl-14 pr-6 py-4.5 bg-gray-50 rounded-2xl border border-transparent transition-all font-medium flex items-center",
          isOpen ? "ring-2 ring-black/5 bg-white border-gray-300" : "hover:bg-gray-100"
        )}
      >
        <CalendarIcon className={cn("absolute left-5 text-gray-300 transition-colors", isOpen ? "text-black" : "group-hover:text-black")} size={20} />
        <span className={value ? "text-[#1D1D1F]" : "text-gray-400"}>
          {value || placeholder}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 z-[60] mt-2 bg-white rounded-[32px] shadow-bento border border-gray-100 p-6 w-[320px] origin-top"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-sm tracking-tight">
                {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
              </h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
