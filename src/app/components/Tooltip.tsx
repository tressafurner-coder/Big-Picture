import { useState, useRef, useEffect, ReactNode } from "react";
import { motion } from "motion/react";
import { createPortal } from "react-dom";
import { cn } from "./ui/utils";

interface TooltipProps {
  content: string;
  children: ReactNode;
  delay?: number;
  /** Merged onto the trigger wrapper (e.g. `flex w-full cursor-not-allowed`). */
  className?: string;
}

export function Tooltip({ content, children, delay = 0, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const timeoutRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    // Pozycja: prawa krawędź tooltipa = prawa krawędź przycisku
    const top = triggerRect.bottom + 8;
    const right = window.innerWidth - triggerRect.right;
    
    // Sprawdź czy tooltip wychodzi poza lewą krawędź
    const tooltipLeft = triggerRect.right - tooltipRect.width;
    
    if (tooltipLeft < 8) {
      // Za blisko lewej krawędzi - użyj left zamiast right
      setStyle({
        top: `${top}px`,
        left: `8px`,
        right: 'auto',
      });
    } else {
      // Normalnie - wyrównanie do prawej
      setStyle({
        top: `${top}px`,
        right: `${right}px`,
        left: 'auto',
      });
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      // Poczekaj na render przed pomiarem
      const timer = setTimeout(() => {
        updatePosition();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn("inline-flex min-w-0 cursor-pointer", className)}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed max-w-[14rem] pointer-events-none rounded px-2 py-1 text-left text-xs leading-snug text-white"
          style={{
            ...style,
            backgroundColor: "#172B4D",
            boxShadow: "0 4px 8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)",
            zIndex: 999999,
          }}
        >
          {content}
        </motion.div>,
        document.body
      )}
    </>
  );
}