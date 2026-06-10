export type TaskType = 'addition' | 'subtraction';

export type DifficultyLevel = 1 | 2 | 3;

export interface Task {
  id: number;
  type: TaskType;
  operand1: number;
  operand2: number;
  result: number;
  maxCapacity: number; // Always 20 for Zwanzigerfeld
}

export type CellState = 'empty' | 'color1' | 'color2' | 'color3';

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

