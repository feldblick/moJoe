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
  Rot: { hex: '#ff5c5c', class: 'bg-gradient-to-br from-[#ff8585] to-[#ef4444] shadow-[0_4px_8px_rgba(239,68,68,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-red-400/20' },
  Orange: { hex: '#f97316', class: 'bg-gradient-to-br from-[#ff9a52] to-[#ea580c] shadow-[0_4px_8px_rgba(234,88,12,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-orange-400/20' },
  Gelb: { hex: '#facc15', class: 'bg-gradient-to-br from-[#fde047] to-[#eab308] shadow-[0_4px_8px_rgba(234,179,8,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-yellow-400/20' },
  Rosa: { hex: '#ff70b0', class: 'bg-gradient-to-br from-[#ff9cc7] to-[#ec4899] shadow-[0_4px_8px_rgba(236,72,153,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-pink-400/20' },
};

export const FRAME2_COLORS: Record<string, { hex: string; class: string }> = {
  Blau: { hex: '#3b82f6', class: 'bg-gradient-to-br from-[#60a5fa] to-[#2563eb] shadow-[0_4px_8px_rgba(37,99,235,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-blue-400/20' },
  Lila: { hex: '#a855f7', class: 'bg-gradient-to-br from-[#c084fc] to-[#9333ea] shadow-[0_4px_8px_rgba(147,51,234,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-purple-400/20' },
  Grün: { hex: '#22c55e', class: 'bg-gradient-to-br from-[#4ade80] to-[#16a34a] shadow-[0_4px_8px_rgba(22,163,74,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-green-400/20' },
  Türkis: { hex: '#06b6d4', class: 'bg-gradient-to-br from-[#22d3ee] to-[#0891b2] shadow-[0_4px_8px_rgba(8,145,178,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-cyan-400/20' },
};

