import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function Select({ options, value, onChange, placeholder = "请选择...", icon }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative group cursor-pointer w-full pl-14 pr-6 py-4.5 bg-gray-50 rounded-2xl border border-transparent transition-all font-medium flex items-center justify-between",
          isOpen ? "ring-2 ring-black/5 bg-white border-gray-300 shadow-sm" : "hover:bg-gray-100"
        )}
      >
        <div className="flex items-center">
          {icon && (
            <div className={cn(
              "absolute left-5 transition-colors",
              isOpen ? "text-black" : "text-gray-300 group-hover:text-black"
            )}>
              {icon}
            </div>
          )}
          <span className={selectedOption ? "text-[#1D1D1F]" : "text-gray-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          className={cn(
            "text-gray-400 transition-transform duration-300",
            isOpen && "rotate-180 text-black"
          )} 
          size={18} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 z-[60] mt-2 bg-white rounded-[32px] shadow-bento border border-gray-100 p-3 w-full origin-top overflow-hidden"
          >
            <div className="flex flex-col gap-1">
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange?.(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group/opt",
                      isSelected 
                        ? "bg-black text-white" 
                        : "hover:bg-gray-50 text-[#1D1D1F]"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold tracking-tight">{option.label}</span>
                      {option.description && (
                        <span className={cn(
                          "text-[10px] mt-0.5",
                          isSelected ? "text-white/60" : "text-gray-400 group-hover/opt:text-gray-500"
                        )}>
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check size={16} className="text-white" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
