import { useState, useMemo } from 'react';
import { TwentyField } from './components/TwentyField';
import { Confetti } from './components/Confetti';
import { FRAME1_COLORS, FRAME2_COLORS } from './types';
import type { Task, CellState, DifficultyLevel, TaskType } from './types';
import { soundManager } from './utils/SoundManager';
import { Star, RefreshCw, Volume2, VolumeX, CheckCircle, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';

const TASKS_PER_ROUND = 5;

// Generate a random task based on type
const generateTask = (type: TaskType, id: number): Task => {
  let operand1: number;
  let operand2: number;
  let result: number;

  if (type === 'addition') {
    // Must cross 10: operand1 + operand2 > 10
    // Sum must be <= 20
    // Larger operand must always be operand1
    while (true) {
      const op1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      const op2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      const sum = op1 + op2;
      if (sum > 10 && sum <= 20) {
        operand1 = Math.max(op1, op2);
        operand2 = Math.min(op1, op2);
        result = operand1 + operand2;
        break;
      }
    }
  } else {
    // Subtraction: minuend - subtrahend = result
    // Minuend between 11 and 20 (crossing 10 downwards)
    // Subtrahend between 1 and 9
    // Result must be < 10 (so we cross the 10 boundary downwards)
    while (true) {
      operand1 = Math.floor(Math.random() * 10) + 11; // 11 to 20
      operand2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      result = operand1 - operand2;
      if (result < 10 && result > 0) {
        break;
      }
    }
  }

  return {
    id,
    type,
    operand1,
    operand2,
    result,
    maxCapacity: 20
  };
};

// Helper to initialize cell states based on task, type, level, and selected colors
const getInitialCellStates = (task: Task, lvl: DifficultyLevel): CellState[] => {
  const states = Array(20).fill('empty') as CellState[];

  if (task.type === 'addition') {
    const A = task.operand1;
    const B = task.operand2;

    if (lvl === 1) {
      // Level 1: Fully visual. 
      // A cells (first operand) = color1 (gray)
      for (let i = 0; i < A; i++) {
        states[i] = 'color1';
      }
      // B cells (second operand) split at index 10:
      // - cells up to index 9 = color2 (color of frame 1 package)
      // - cells index 10 onwards = color3 (color of frame 2)
      for (let i = 0; i < B; i++) {
        const idx = A + i;
        states[idx] = idx >= 10 ? 'color3' : 'color2';
      }
    } else if (lvl === 2) {
      // Level 2: Operand 1 pre-colored (gray), child colors operand 2
      for (let i = 0; i < A; i++) {
        states[i] = 'color1';
      }
    }
    // Level 3: Start completely empty
  } else {
    // Subtraction (operand1 - operand2 = result)
    if (lvl === 1) {
      // Level 1: Fully visual
      // C cells (result) = empty (solid gray circles)
      // Subtracted B cells = colored:
      // - cells in first frame (up to 9) = color2
      // - cells in second frame (10+) = color3
      const C = task.result;
      for (let i = C; i < task.operand1; i++) {
        states[i] = i >= 10 ? 'color3' : 'color2';
      }
    }
    // Level 2 & 3: Start completely empty (only active cells shown, all empty circles)
  }

  return states;
};

const firstTask = generateTask('addition', 1);

function App() {
  // Game Settings
  const [taskType, setTaskType] = useState<TaskType>('addition');
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [isMuted, setIsMuted] = useState(false);

  // User-selected frame colors
  const [colorFrame1, setColorFrame1] = useState<string>('Rot');
  const [colorFrame2, setColorFrame2] = useState<string>('Blau');

  // Task & Representation State
  const [currentTask, setCurrentTask] = useState<Task | null>(firstTask);
  const [cellStates, setCellStates] = useState<CellState[]>(() => getInitialCellStates(firstTask, 1));
  const [inputValue, setInputValue] = useState('');
  
  // Level 3 Toolbar Selection
  const [activeTool, setActiveTool] = useState<'color1' | 'color2' | 'color3' | 'eraser'>('color1');

  // Validation & Animation States
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showShake, setShowShake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Round Progress State
  const [score, setScore] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0); // 0 to TASKS_PER_ROUND - 1
  const [roundFinished, setRoundFinished] = useState(false);

  const startNewRound = () => {
    const newTask = generateTask(taskType, 1);
    setCurrentTask(newTask);
    setCellStates(getInitialCellStates(newTask, level));
    setInputValue('');
    setIsCorrect(null);
    setScore(0);
    setTaskIndex(0);
    setRoundFinished(false);
    setShowConfetti(false);
    setActiveTool(taskType === 'addition' ? 'color1' : 'color3');
  };

  const handleLevelChange = (lvl: DifficultyLevel) => {
    setLevel(lvl);
    const newTask = generateTask(taskType, 1);
    setCurrentTask(newTask);
    setCellStates(getInitialCellStates(newTask, lvl));
    setInputValue('');
    setIsCorrect(null);
    setScore(0);
    setTaskIndex(0);
    setRoundFinished(false);
    setShowConfetti(false);
    setActiveTool(taskType === 'addition' ? 'color1' : 'color3');
  };

  const handleTaskTypeChange = (type: TaskType) => {
    setTaskType(type);
    const newTask = generateTask(type, 1);
    setCurrentTask(newTask);
    setCellStates(getInitialCellStates(newTask, level));
    setInputValue('');
    setIsCorrect(null);
    setScore(0);
    setTaskIndex(0);
    setRoundFinished(false);
    setShowConfetti(false);
    setActiveTool(type === 'addition' ? 'color1' : 'color3');
  };



  const nextTask = () => {
    setShowConfetti(false);
    setIsCorrect(null);
    setInputValue('');
    
    if (taskIndex < TASKS_PER_ROUND - 1) {
      const nextIdx = taskIndex + 1;
      setTaskIndex(nextIdx);
      if (currentTask) {
        const newTask = generateTask(taskType, currentTask.id + 1);
        setCurrentTask(newTask);
        setCellStates(getInitialCellStates(newTask, level));
      }
    } else {
      setRoundFinished(true);
    }
  };

  const playSound = (sound: 'correct' | 'incorrect' | 'click') => {
    if (isMuted) return;
    if (sound === 'correct') soundManager.playCorrect();
    else if (sound === 'incorrect') soundManager.playIncorrect();
    else if (sound === 'click') soundManager.playClick();
  };

  const handleCellClick = (index: number) => {
    if (!currentTask || isCorrect) return;

    const newCellStates = [...cellStates];

    if (level === 2) {
      if (currentTask.type === 'addition') {
        // Can only click cells starting from operand1 (indices operand1 to 19)
        if (index >= currentTask.operand1) {
          if (newCellStates[index] === 'empty') {
            newCellStates[index] = index >= 10 ? 'color3' : 'color2';
          } else {
            newCellStates[index] = 'empty';
          }
        }
      } else {
        // Subtraction: can click any active cell (indices 0 to operand1 - 1)
        if (index < currentTask.operand1) {
          if (newCellStates[index] === 'empty') {
            newCellStates[index] = index >= 10 ? 'color3' : 'color2';
          } else {
            newCellStates[index] = 'empty';
          }
        }
      }
    } else if (level === 3) {
      // Free drawing: set cell state to active tool
      if (activeTool === 'eraser') {
        newCellStates[index] = 'empty';
      } else {
        newCellStates[index] = activeTool;
      }
    }

    setCellStates(newCellStates);
  };

  const handleCheck = () => {
    if (!currentTask) return;

    const userNum = parseInt(inputValue.trim(), 10);
    const expectedResult = currentTask.result;

    // 1. Validate the text input
    if (isNaN(userNum) || userNum !== expectedResult) {
      triggerIncorrect();
      return;
    }

    // 2. Validate visual representation if level > 1
    if (level > 1) {
      if (currentTask.type === 'addition') {
        const A = currentTask.operand1;
        const B = currentTask.operand2;

        // Check representation:
        // - First A cells must be color1 (gray)
        // - Next cells up to 9 must be color2
        // - Next cells from 10 onwards must be color3
        // - Remaining cells empty
        for (let i = 0; i < 20; i++) {
          if (i < A) {
            if (cellStates[i] !== 'color1') {
              triggerIncorrect();
              return;
            }
          } else if (i < A + B) {
            const expectedState = i >= 10 ? 'color3' : 'color2';
            if (cellStates[i] !== expectedState) {
              triggerIncorrect();
              return;
            }
          } else {
            if (cellStates[i] !== 'empty') {
              triggerIncorrect();
              return;
            }
          }
        }
      } else {
        // Subtraction (A - B = C)
        const A = currentTask.operand1;
        const C = currentTask.result;

        // Check representation:
        // - Cells from 0 to C-1 must be empty
        // - Cells from C to 9 (if any) must be color2
        // - Cells from 10 to A-1 (if any) must be color3
        // - Cells from A onwards must be empty
        for (let i = 0; i < 20; i++) {
          if (i < C) {
            if (cellStates[i] !== 'empty') {
              triggerIncorrect();
              return;
            }
          } else if (i < 10) {
            if (i < A) {
              if (cellStates[i] !== 'color2') {
                triggerIncorrect();
                return;
              }
            } else {
              if (cellStates[i] !== 'empty') {
                triggerIncorrect();
                return;
              }
            }
          } else if (i < A) {
            if (cellStates[i] !== 'color3') {
              triggerIncorrect();
              return;
            }
          } else {
            if (cellStates[i] !== 'empty') {
              triggerIncorrect();
              return;
            }
          }
        }
      }
    }

    // If both text and representation are correct
    setIsCorrect(true);
    setScore((prev) => prev + 1);
    setShowConfetti(true);
    playSound('correct');
  };

  const triggerIncorrect = () => {
    setIsCorrect(false);
    setShowShake(true);
    playSound('incorrect');
    setTimeout(() => setShowShake(false), 400);
  };

  // Speech bubbles instructional text
  const instructionMessage = useMemo(() => {
    if (!currentTask) return '';
    const A = currentTask.operand1;
    const B = currentTask.operand2;

    if (currentTask.type === 'addition') {
      if (level === 1) {
        return `Zähle die Punkte! Erst die grauen (${A}), dann die roten/blauen (${B}). Wie viele sind es zusammen?`;
      } else if (level === 2) {
        const toTen = 10 - A;
        const overTen = B - toTen;
        return `Fülle das Zwanzigerfeld auf! Klicke genau ${B} weitere Punkte an (${toTen} in Feld 1 mit ${colorFrame1}, dann ${overTen} in Feld 2 mit ${colorFrame2}).`;
      } else {
        return `Lege die Aufgabe selbst! Male ${A} graue Punkte (Zahl 1). Wähle dann ${colorFrame1} und male ${10 - A} Punkte in Feld 1. Wähle ${colorFrame2} und male den Rest in Feld 2.`;
      }
    } else {
      // Subtraction (A - B)
      const secondFieldPoints = A - 10;
      const firstFieldPoints = B - secondFieldPoints;

      if (level === 1) {
        return `Rechne ${A} minus ${B}! Zähle die leeren Kreise mit dem soliden Umriss, um das Ergebnis zu finden.`;
      } else if (level === 2) {
        return `Ziehe ${B} Punkte ab! Klicke die Punkte von hinten her an (${secondFieldPoints} in Feld 2 mit ${colorFrame2}, dann ${firstFieldPoints} in Feld 1 mit ${colorFrame1}).`;
      } else {
        return `Lege den Abzug selbst! Male zuerst ${secondFieldPoints} Kreise in Feld 2 mit ${colorFrame2} an, und dann ${firstFieldPoints} Kreise in Feld 1 mit ${colorFrame1} an.`;
      }
    }
  }, [currentTask, level, colorFrame1, colorFrame2]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col justify-between">
      {/* Top Banner / Progress & Settings */}
      <header className="w-full flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl md:text-4xl animate-float" role="img" aria-label="Abacus">🧮</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                moJoe
              </h1>
              <p className="text-xs md:text-sm font-medium text-purple-600/80">Das interaktive Zwanzigerfeld</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-xl bg-white/80 border border-purple-100 hover:bg-purple-50 transition-colors shadow-sm text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label={isMuted ? "Ton einschalten" : "Ton stummschalten"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={startNewRound}
              className="p-2.5 rounded-xl bg-white/80 border border-purple-100 hover:bg-purple-50 transition-colors shadow-sm text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label="Runde neu starten"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Color Selector Panel */}
        <div className="bg-white/80 p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center text-sm mb-2 animate-pop">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label="Artist Palette">🎨</span>
            <span className="font-extrabold text-slate-700">Wähle deine Farben:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-500">Feld 1 (Zehnerpaket):</span>
              <div className="flex gap-1.5">
                {Object.keys(FRAME1_COLORS).map((name) => (
                  <button
                    key={name}
                    onClick={() => { setColorFrame1(name); playSound('click'); }}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      colorFrame1 === name ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: FRAME1_COLORS[name].hex }}
                    title={name}
                    aria-label={`Farbe 1: ${name}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-500">Feld 2 (Zehnerfeld):</span>
              <div className="flex gap-1.5">
                {Object.keys(FRAME2_COLORS).map((name) => (
                  <button
                    key={name}
                    onClick={() => { setColorFrame2(name); playSound('click'); }}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      colorFrame2 === name ? 'border-purple-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: FRAME2_COLORS[name].hex }}
                    title={name}
                    aria-label={`Farbe 2: ${name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mode & Level Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mode Selector */}
          <div className="bg-white/80 p-1.5 rounded-2xl border border-purple-100 shadow-sm flex gap-1">
            <button
              onClick={() => handleTaskTypeChange('addition')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                taskType === 'addition'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Plus (+)
            </button>
            <button
              onClick={() => handleTaskTypeChange('subtraction')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                taskType === 'subtraction'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                  : 'text-purple-600 hover:bg-purple-50'
              }`}
            >
              Minus (-)
            </button>
          </div>

          {/* Level Selector */}
          <div className="bg-white/80 p-1.5 rounded-2xl border border-purple-100 shadow-sm flex gap-1">
            {( [1, 2, 3] as DifficultyLevel[] ).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  level === lvl
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                    : 'text-pink-600 hover:bg-pink-50'
                }`}
              >
                {lvl === 1 && 'Level 1'}
                {lvl === 2 && 'Level 2'}
                {lvl === 3 && 'Level 3'}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Tracker (Stars) */}
        <div className="bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/60 shadow-sm flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600">Aufgabe {taskIndex + 1} von {TASKS_PER_ROUND}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: TASKS_PER_ROUND }).map((_, idx) => {
              const isActive = idx === taskIndex;
              const isDone = idx < taskIndex;
              return (
                <Star
                  key={idx}
                  size={24}
                  className={`transition-all duration-300 ${
                    isDone 
                      ? 'fill-amber-400 text-amber-400 scale-100' 
                      : isActive 
                        ? 'text-indigo-400 animate-pulse' 
                        : 'text-slate-200'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Board Content */}
      <main className="flex-1 flex flex-col justify-center items-center py-4">
        {roundFinished ? (
          /* Finished Screen */
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl border border-white shadow-2xl max-w-md w-full text-center animate-pop">
            <span className="text-6xl block mb-4" role="img" aria-label="Party Popper">🎉</span>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Großartig gemacht!</h2>
            <p className="text-slate-600 mb-2 font-medium">
              Du hast alle {TASKS_PER_ROUND} Aufgaben im {level === 1 ? 'Level 1' : level === 2 ? 'Level 2' : 'Level 3'} gelöst!
            </p>
            <p className="text-indigo-600 font-extrabold text-2xl mb-6">
              Sterne gesammelt: {score} / {TASKS_PER_ROUND} ⭐
            </p>
            <div className="flex justify-center gap-1.5 mb-8">
              {Array.from({ length: TASKS_PER_ROUND }).map((_, idx) => (
                <Star key={idx} size={36} className="fill-amber-400 text-amber-400 animate-float" style={{ animationDelay: `${idx * 0.15}s` }} />
              ))}
            </div>
            <button
              onClick={startNewRound}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              Nochmal spielen!
            </button>
          </div>
        ) : currentTask ? (
          /* Game Area */
          <div className="w-full flex flex-col items-center">
            {/* Speech bubble / explanation */}
            <div className="relative bg-white border border-indigo-100 p-4 rounded-2xl shadow-md max-w-2xl text-center mb-6 animate-float">
              <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-white border-r border-b border-indigo-100 rotate-45" />
              <p className="text-sm sm:text-base font-bold text-slate-700 flex items-center justify-center gap-2">
                <HelpCircle size={18} className="text-indigo-500 shrink-0" />
                {instructionMessage}
              </p>
            </div>

            {/* Level 3 Palette Toolbar */}
            {level === 3 && !isCorrect && (
              <div className="flex flex-wrap gap-2 p-2 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-100 shadow-lg mb-4 justify-center">
                {currentTask.type === 'addition' ? (
                  <>
                    <button
                      onClick={() => { setActiveTool('color1'); playSound('click'); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                        activeTool === 'color1'
                          ? 'bg-slate-100 border-slate-300 text-slate-700 scale-[1.03] shadow-sm'
                          : 'border-transparent text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-400" />
                      Zahl 1 (Grau)
                    </button>
                    <button
                      onClick={() => { setActiveTool('color2'); playSound('click'); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                        activeTool === 'color2'
                          ? 'bg-red-50 border-red-200 text-red-600 scale-[1.03] shadow-sm'
                          : 'border-transparent text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: FRAME1_COLORS[colorFrame1]?.hex }} />
                      Zahl 2 ({colorFrame1})
                    </button>
                    <button
                      onClick={() => { setActiveTool('color3'); playSound('click'); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                        activeTool === 'color3'
                          ? 'bg-blue-50 border-blue-200 text-blue-600 scale-[1.03] shadow-sm'
                          : 'border-transparent text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: FRAME2_COLORS[colorFrame2]?.hex }} />
                      Zahl 2 ({colorFrame2})
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setActiveTool('color3'); playSound('click'); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                        activeTool === 'color3'
                          ? 'bg-blue-50 border-blue-200 text-blue-600 scale-[1.03] shadow-sm'
                          : 'border-transparent text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: FRAME2_COLORS[colorFrame2]?.hex }} />
                      Abzug ({colorFrame2})
                    </button>
                    <button
                      onClick={() => { setActiveTool('color2'); playSound('click'); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                        activeTool === 'color2'
                          ? 'bg-red-50 border-red-200 text-red-600 scale-[1.03] shadow-sm'
                          : 'border-transparent text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: FRAME1_COLORS[colorFrame1]?.hex }} />
                      Abzug ({colorFrame1})
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setActiveTool('eraser'); playSound('click'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                    activeTool === 'eraser'
                      ? 'bg-slate-100 border-slate-300 text-slate-700 scale-[1.03] shadow-sm'
                      : 'border-transparent text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span role="img" aria-label="Eraser" className="text-sm">🧽</span>
                  Löschen
                </button>
              </div>
            )}

            {/* Connected Twenty Grid Frame */}
            <TwentyField
              task={currentTask}
              level={level}
              cellStates={cellStates}
              onCellClick={handleCellClick}
              colorFrame1={colorFrame1}
              colorFrame2={colorFrame2}
            />

            {/* Mathematical Equation & Answer Form */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
              <div className="flex items-center gap-3 font-extrabold text-4xl sm:text-5xl text-slate-800 tracking-wide select-none">
                <span>{currentTask.operand1}</span>
                <span className="text-indigo-500">{currentTask.type === 'addition' ? '+' : '-'}</span>
                <span>{currentTask.operand2}</span>
                <span className="text-slate-400">=</span>
                
                {/* Result Input Field */}
                <input
                  id="result-input"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={inputValue}
                  disabled={isCorrect === true}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 2) {
                      setInputValue(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (isCorrect) nextTask();
                      else handleCheck();
                    }
                  }}
                  placeholder="?"
                  className={`w-20 h-16 sm:w-24 sm:h-20 text-center rounded-2xl border-3 font-extrabold text-4xl bg-white shadow-inner focus:outline-none transition-all duration-200 select-text ${
                    showShake ? 'animate-shake' : ''
                  } ${
                    isCorrect === true
                      ? 'border-green-500 text-green-600 bg-green-50/50'
                      : isCorrect === false
                        ? 'border-red-400 text-red-500 focus:border-red-500'
                        : 'border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  }`}
                  autoComplete="off"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                {isCorrect ? (
                  <button
                    onClick={nextTask}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 animate-pulse-subtle"
                  >
                    <span>Weiter</span>
                    <ArrowRight size={22} />
                  </button>
                ) : (
                  <button
                    onClick={handleCheck}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 sm:py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <span>Prüfen</span>
                    <CheckCircle size={22} />
                  </button>
                )}
              </div>
            </div>

            {/* Validation Feedback message */}
            {isCorrect === false && (
              <div className="mt-4 text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100 animate-pop">
                Leider nicht ganz richtig! Überprüfe die Punkte oder dein Ergebnis. 🧐
              </div>
            )}
            {isCorrect === true && (
              <div className="mt-4 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-1.5 animate-pop">
                <Sparkles size={16} /> Super! Das ist vollkommen richtig! 🌟
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Footer / Copyright / SEO */}
      <footer className="w-full text-center py-4 border-t border-purple-100/40 mt-8 text-xs text-purple-600/60 font-medium">
        moJoe © 2026 • Ein spielerisches Zwanzigerfeld für den optimalen Zehnerübergang
      </footer>

      {/* Confetti Animation Layer */}
      <Confetti active={showConfetti} />
    </div>
  );
}

export default App;
