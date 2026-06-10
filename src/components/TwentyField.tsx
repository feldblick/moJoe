import React from 'react';
import type { Task, CellState, DifficultyLevel } from '../types';
import { soundManager } from '../utils/SoundManager';

export const FRAME1_COLORS: Record<string, { hex: string; class: string }> = {
  Rot: { hex: '#ff4d4d', class: 'bg-gradient-to-br from-red-400 to-red-600 shadow-[0_4px_10px_rgba(239,68,68,0.4)] border border-red-500/20' },
  Orange: { hex: '#f97316', class: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_4px_10px_rgba(249,115,22,0.4)] border border-orange-500/20' },
  Gelb: { hex: '#facc15', class: 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[0_4px_10px_rgba(234,179,8,0.4)] border border-yellow-500/20' },
  Rosa: { hex: '#ec4899', class: 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-[0_4px_10px_rgba(236,72,153,0.4)] border border-pink-500/20' },
};

export const FRAME2_COLORS: Record<string, { hex: string; class: string }> = {
  Blau: { hex: '#1e92ff', class: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_4px_10px_rgba(30,146,255,0.4)] border border-blue-500/20' },
  Lila: { hex: '#a855f7', class: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-[0_4px_10px_rgba(168,85,247,0.4)] border border-purple-500/20' },
  Grün: { hex: '#22c55e', class: 'bg-gradient-to-br from-green-400 to-green-600 shadow-[0_4px_10px_rgba(34,197,94,0.4)] border border-green-500/20' },
  Türkis: { hex: '#06b6d4', class: 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_4px_10px_rgba(6,182,212,0.4)] border border-cyan-500/20' },
};

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
      // In Level 2 Addition, only cells starting from operand1 are interactive (locked gray dots are static)
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

    // Use responsive sizes: w-12 on mobile, w-14 on tablet, w-16 on desktop
    let containerClass = "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-2xl border transition-all duration-200 select-none";

    if (active) {
      if (interactive) {
        // Clickable slots (raised card, cursor, hover effect)
        containerClass += " bg-white/75 border-white shadow-sm hover:bg-white/95 hover:scale-[1.04] hover:shadow-md cursor-pointer";
      } else {
        // Locked/Read-only slots (flat, no hover, no cursor)
        containerClass += " bg-white/40 border-white/40";
      }
    } else {
      // Inactive slots (behind minuend in subtraction)
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
              <div className={`w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full animate-pop ${COLOR1_CLASS}`} />
            )}
            {state === 'color2' && (
              <div className={`w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full animate-pop ${
                FRAME1_COLORS[colorFrame1]?.class || FRAME1_COLORS.Rot.class
              }`} />
            )}
            {state === 'color3' && (
              <div className={`w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full animate-pop ${
                FRAME2_COLORS[colorFrame2]?.class || FRAME2_COLORS.Blau.class
              }`} />
            )}
            {state === 'empty' && (
              <>
                {task.type === 'subtraction' ? (
                  // Subtraction: Solid, decent gray circle for the minuend placeholders
                  <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full border-2 border-solid border-slate-300 transition-all duration-200" />
                ) : (
                  // Addition: Dashed outline for empty spaces
                  <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full border-2 border-dashed border-slate-300/60 flex items-center justify-center transition-all duration-200 hover:border-slate-400/80" />
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl p-6 sm:p-8 bg-white/45 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl select-none my-8 shrink-0">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center">
        {/* First Ten-Frame (indices 0-9) */}
        <div className="grid grid-cols-5 gap-3 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => renderCell(i))}
          {Array.from({ length: 5 }).map((_, i) => renderCell(i + 5))}
        </div>

        {/* Optical Separator divider line */}
        <div className="hidden md:block w-px h-28 bg-slate-300/40 shrink-0" />
        <div className="md:hidden w-28 h-px bg-slate-300/40 shrink-0" />

        {/* Second Ten-Frame (indices 10-19) */}
        <div className="grid grid-cols-5 gap-3 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => renderCell(i + 10))}
          {Array.from({ length: 5 }).map((_, i) => renderCell(i + 15))}
        </div>
      </div>
    </div>
  );
};
