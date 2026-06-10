import React from 'react';
import type { Task, CellState, DifficultyLevel } from '../types';
import { FRAME1_COLORS, FRAME2_COLORS } from '../types';
import { soundManager } from '../utils/SoundManager';


const COLOR1_CLASS = 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-[0_4px_10px_rgba(148,163,184,0.25)] border border-slate-400/20';

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
      return index < task.operand1;
    }
  };

  // Determine if a cell is interactive/clickable for the child
  const isCellInteractive = (index: number): boolean => {
    if (level === 1) return false;
    if (!isCellActive(index)) return false;

    if (level === 2 && task.type === 'addition') {
      // In Level 2 Addition, only cells starting from operand1 are interactive
      return index >= task.operand1;
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
    let containerClass = "w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 flex items-center justify-center rounded-xl md:rounded-2xl border transition-all duration-200 select-none";

    if (active) {
      if (interactive) {
        containerClass += " bg-white/75 border-white shadow-sm hover:bg-white/95 hover:scale-[1.04] hover:shadow-md cursor-pointer";
      } else {
        containerClass += " bg-white/40 border-white/40";
      }
    } else {
      containerClass += " bg-slate-100/10 border-dashed border-slate-200/30 opacity-20";
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
              <>
                {task.type === 'subtraction' ? (
                  // Subtraction: Solid, decent gray circle for the minuend placeholders
                  <div className="w-8 h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full border-2 border-solid border-slate-300 transition-all duration-200" />
                ) : (
                  // Addition: Dashed outline for empty spaces
                  <div className="w-8 h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-full border-2 border-dashed border-slate-300/60 flex items-center justify-center transition-all duration-200 hover:border-slate-400/80" />
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl p-4 sm:p-6 md:p-8 bg-white/45 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl select-none my-8 shrink-0">
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
