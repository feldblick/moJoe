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
