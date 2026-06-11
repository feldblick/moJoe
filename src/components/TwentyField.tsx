import React from 'react';
import type { Task, CellState, DifficultyLevel } from '../types';
import { FRAME1_COLORS, FRAME2_COLORS } from '../types';
import { soundManager } from '../utils/SoundManager';


const COLOR1_CLASS = 'bg-gradient-to-br from-[#d1d5db] to-[#9ca3af] shadow-[0_4px_8px_rgba(156,163,175,0.2),inset_0_2px_3px_rgba(255,255,255,0.4)] border border-slate-300/10';

interface TwentyFieldProps {
  task: Task;
  level: DifficultyLevel;
  cellStates: CellState[];
  onCellClick: (index: number) => void;
  colorFrame1: string;
  colorFrame2: string;
}

export const TwentyField: React.FC<TwentyFieldProps> = ({
  task,
  level,
  cellStates,
  onCellClick,
  colorFrame1,
  colorFrame2,
}) => {
  // Determine if a cell index is active
  const isCellActive = (index: number): boolean => {
    if (task.type === 'addition') {
      return true;
    } else {
      // In level 2 and 3 subtraction, show all 20 cells
      if (level > 1) {
        return true;
      }
      return index < task.operand1;
    }
  };

  // Determine if a cell is interactive/clickable for the child
  const isCellInteractive = (index: number): boolean => {
    if (level === 1) return false;
    if (!isCellActive(index)) return false;

    if (level === 2) {
      if (task.type === 'addition') {
        // In Level 2 Addition, only cells starting from operand1 are interactive
        return index >= task.operand1;
      } else {
        // In Level 2 Subtraction, only cells representing the subtracted amount are interactive (from C to A-1)
        return index >= task.result && index < task.operand1;
      }
    }

    return true;
  };

  const handleCellClick = (index: number) => {
    if (!isCellActive(index)) return;
    if (!isCellInteractive(index)) return;

    soundManager.playClick();
    onCellClick(index);
  };

  const renderCell = (index: number) => {
    const active = isCellActive(index);
    const interactive = isCellInteractive(index);
    const state = cellStates[index];

    // Responsive outer grid cell container sizes
    let containerClass = "w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 flex items-center justify-center rounded-2xl border transition-all duration-200 select-none";

    if (active) {
      if (interactive) {
        containerClass += " bg-[#ffffff] border-[#e0e7ff]/60 shadow-[0_4px_8px_rgba(148,163,184,0.08),inset_0_2px_4px_rgba(255,255,255,0.8)] hover:bg-[#fafbff] hover:scale-[1.05] hover:shadow-[0_6px_12px_rgba(148,163,184,0.12)] cursor-pointer";
      } else {
        containerClass += " bg-[#ffffff]/50 border-white/40 shadow-[inset_0_2px_4px_rgba(148,163,184,0.03)]";
      }
    } else {
      containerClass += " bg-slate-200/10 border-dashed border-slate-300/20 opacity-25";
    }

    return (
      <div
        key={index}
        className={containerClass}
        onClick={() => handleCellClick(index)}
        role={active && interactive ? "button" : undefined}
        aria-label={`Feld ${index + 1}`}
      >
        {active && (
          <>
            {state === 'color1' && (
              <div className={`w-8 h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full animate-pop ${COLOR1_CLASS}`} />
            )}
            {state === 'color2' && (
              <div className={`w-8 h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full animate-pop ${
                FRAME1_COLORS[colorFrame1]?.class || FRAME1_COLORS.Rot.class
              }`} />
            )}
            {state === 'color3' && (
              <div className={`w-8 h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full animate-pop ${
                FRAME2_COLORS[colorFrame2]?.class || FRAME2_COLORS.Blau.class
              }`} />
            )}
            {state === 'empty' && (
              // Empty cell representation (leere Umrisspunkte)
              <div className="w-8 h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full border-2 border-dashed border-slate-300/50 bg-slate-50/20 flex items-center justify-center transition-all duration-200 hover:border-slate-400/50" />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl p-5 sm:p-6 md:p-8 clay-card select-none mt-2 mb-4 shrink-0">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 justify-center items-center">
        {/* First Ten-Frame (indices 0-9) */}
        <div className="grid grid-cols-5 gap-2 md:gap-2.5 lg:gap-3 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => renderCell(i))}
          {Array.from({ length: 5 }).map((_, i) => renderCell(i + 5))}
        </div>

        {/* Optical Separator divider line */}
        <div className="hidden md:block w-px h-24 lg:h-28 bg-slate-300/40 shrink-0" />
        <div className="md:hidden w-28 h-px bg-slate-300/40 shrink-0" />

        {/* Second Ten-Frame (indices 10-19) */}
        <div className="grid grid-cols-5 gap-2 md:gap-2.5 lg:gap-3 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => renderCell(i + 10))}
          {Array.from({ length: 5 }).map((_, i) => renderCell(i + 15))}
        </div>
      </div>
    </div>
  );
};
