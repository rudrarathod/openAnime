import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

export interface CustomSelectOption<T extends string | number = string> {
  label: string;
  value: T;
  icon?: React.ReactNode;
}

interface CustomSelectProps<T extends string | number = string> {
  options: CustomSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "glass" | "badge";
}

export default function CustomSelect<T extends string | number = string>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  icon,
  className,
  buttonClassName,
  menuClassName,
  size = "md",
  variant = "glass",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs rounded-lg gap-1.5",
    md: "h-10 px-3 text-xs sm:text-sm rounded-xl gap-2",
    lg: "h-12 px-4 text-sm font-medium rounded-xl gap-2.5",
  };

  const variantClasses = {
    default: "bg-secondary/60 hover:bg-secondary border border-border/60 text-foreground",
    glass: "glass hover:bg-secondary/40 border border-border/50 text-foreground shadow-sm",
    badge: "bg-primary/15 text-primary border border-primary/30 font-bold hover:bg-primary/20",
  };

  return (
    <div className={cn("relative inline-block text-left select-none", className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center justify-between font-medium transition-all active:scale-[0.98] cursor-pointer touch-manipulation outline-none focus:ring-2 focus:ring-primary/20",
          sizeClasses[size],
          variantClasses[variant],
          isOpen && "ring-2 ring-primary/40 border-primary/50",
          buttonClassName
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate pr-1">
          {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 mt-1.5 min-w-[160px] max-h-60 w-full overflow-y-auto rounded-xl glass-panel border border-white/10 shadow-2xl p-1.5 outline-none no-scrollbar backdrop-blur-xl",
              menuClassName
            )}
            role="listbox"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm transition-all text-left font-medium cursor-pointer mb-0.5 last:mb-0",
                    isSelected
                      ? "bg-primary/20 text-primary font-bold shadow-sm"
                      : "text-foreground hover:bg-secondary/70 hover:text-white"
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
