import { useState, useMemo, useEffect } from 'react';
import { TwentyField } from './components/TwentyField';
import { Confetti } from './components/Confetti';
import { FRAME1_COLORS, FRAME2_COLORS } from './types';
import type { Task, CellState, DifficultyLevel, TaskType } from './types';
import { soundManager } from './utils/SoundManager';
import { Star, RefreshCw, Volume2, VolumeX, CheckCircle, ArrowRight, Sparkles, Settings, Eraser, Frown, Trophy } from 'lucide-react';

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
    const C = task.result;
    if (lvl === 1) {
      // Level 1: Fully visual
      // C cells (result) = color1 (gray filled)
      for (let i = 0; i < C; i++) {
        states[i] = 'color1';
      }
      // Subtracted B cells = colored:
      // - cells in first frame (up to 9) = color2
      // - cells in second frame (10+) = color3
      for (let i = C; i < task.operand1; i++) {
        states[i] = i >= 10 ? 'color3' : 'color2';
      }
    } else if (lvl === 2) {
      // Level 2: Minuend cells pre-colored (gray), child colors/subtracts B cells by making them colored
      for (let i = 0; i < task.operand1; i++) {
        states[i] = 'color1';
      }
    }
    // Level 3: Start completely empty
  }

  return states;
};

const firstTask = generateTask('addition', 1);

function App() {
  // Game Settings
  const [taskType, setTaskType] = useState<TaskType>('addition');
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  // Hint State
  const [showHint, setShowHint] = useState(false);

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
    setShowHint(false);
    setActiveTool('color1');
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
    setShowHint(false);
    setActiveTool('color1');
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
    setShowHint(false);
    setActiveTool('color1');
  };

  const nextTask = () => {
    setShowConfetti(false);
    setIsCorrect(null);
    setInputValue('');
    setShowHint(false);
    
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

  const playSound = (sound: 'correct' | 'incorrect' | 'click' | 'chirp') => {
    if (isMuted) return;
    if (sound === 'correct') soundManager.playCorrect();
    else if (sound === 'incorrect') soundManager.playIncorrect();
    else if (sound === 'click') soundManager.playClick();
    else if (sound === 'chirp') soundManager.playChirp();
  };

  const handleMascotClick = () => {
    const nextShowHint = !showHint;
    setShowHint(nextShowHint);
    if (nextShowHint) {
      playSound('chirp');
    } else {
      playSound('click');
    }
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
        // Subtraction Level 2: toggle between color1 (gray) and colored (color2/color3)
        // Only indices from result to operand1 - 1 are interactive (enforced by TwentyField's isCellInteractive)
        const targetColor = index >= 10 ? 'color3' : 'color2';
        if (newCellStates[index] === 'color1') {
          newCellStates[index] = targetColor;
        } else {
          newCellStates[index] = 'color1';
        }
      }
    } else if (level === 3) {
      // Free drawing: set cell state to active tool with child-friendly toggle
      if (activeTool === 'eraser') {
        newCellStates[index] = 'empty';
      } else if (activeTool === 'color1') {
        newCellStates[index] = newCellStates[index] === 'color1' ? 'empty' : 'color1';
      } else if (activeTool === 'color2') {
        const targetColor = index >= 10 ? 'color3' : 'color2';
        if (currentTask.type === 'subtraction') {
          // In subtraction, Abzug tool can only paint over gray (color1) cells, and toggles them back to gray
          if (newCellStates[index] === 'color1') {
            newCellStates[index] = targetColor;
          } else if (newCellStates[index] === targetColor) {
            newCellStates[index] = 'color1';
          }
        } else {
          // In addition, standard toggle between empty and colored
          newCellStates[index] = newCellStates[index] === targetColor ? 'empty' : targetColor;
        }
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
        // - Cells from 0 to C-1 must be color1 (gray filled)
        // - Cells from C to 9 (if any) must be color2
        // - Cells from 10 to A-1 (if any) must be color3
        // - Cells from A onwards must be empty
        for (let i = 0; i < 20; i++) {
          if (i < C) {
            if (cellStates[i] !== 'color1') {
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

  // Listen to physical keyboard events globally for desktop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (roundFinished) {
        if (e.key === 'Enter') {
          playSound('click');
          startNewRound();
        }
        return;
      }

      if (!currentTask) return;

      if (e.key === 'Enter') {
        if (isCorrect === true) {
          playSound('click');
          nextTask();
        } else {
          handleCheck();
        }
        return;
      }

      // If already correct, block typing
      if (isCorrect === true) return;

      if (/^[0-9]$/.test(e.key)) {
        playSound('click');
        setInputValue((prev) => {
          if (prev.length < 2) {
            return prev + e.key;
          }
          return prev;
        });
      } else if (e.key === 'Backspace') {
        playSound('click');
        setInputValue((prev) => prev.slice(0, -1));
      } else if (e.key === 'Escape') {
        playSound('click');
        setInputValue('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTask, isCorrect, roundFinished, inputValue, isMuted, nextTask, handleCheck, startNewRound]);

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
      const C = A - B;
      const secondFieldPoints = A - 10;
      const firstFieldPoints = B - secondFieldPoints;

      if (level === 1) {
        return `Rechne ${A} minus ${B}! Zähle die grauen Punkte, um das Ergebnis zu finden.`;
      } else if (level === 2) {
        return `Ziehe ${B} Punkte ab! Klicke die Punkte von hinten her an (${secondFieldPoints} in Feld 2 mit ${colorFrame2}, dann ${firstFieldPoints} in Feld 1 mit ${colorFrame1}).`;
      } else {
        return `Lege die Aufgabe selbst! Male ${C} graue Punkte für das Ergebnis. Male dann den Abzug von ${B} (${firstFieldPoints} in Feld 1 mit ${colorFrame1}, und ${secondFieldPoints} in Feld 2 mit ${colorFrame2}) an.`;
      }
    }
  }, [currentTask, level, colorFrame1, colorFrame2]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col justify-between select-none">
      {/* Top Banner / Progress & Settings */}
      <header className="relative w-full flex flex-col gap-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Custom SVG logo with cute abacus beads */}
            <svg className="w-10 h-10 shrink-0 drop-shadow-sm animate-float" viewBox="0 0 100 100">
              <rect x="10" y="20" width="80" height="60" rx="15" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="6" />
              <line x1="33" y1="20" x2="33" y2="80" stroke="#cbd5e1" strokeWidth="5" />
              <line x1="66" y1="20" x2="66" y2="80" stroke="#cbd5e1" strokeWidth="5" />
              {/* Beads */}
              <circle cx="33" cy="38" r="9" fill="#ff70b0" />
              <circle cx="33" cy="58" r="9" fill="#3b82f6" />
              <circle cx="66" cy="45" r="9" fill="#22c55e" />
              <circle cx="66" cy="65" r="9" fill="#facc15" />
            </svg>
            <div>
              <h1 className="text-3xl font-extrabold font-heading text-slate-800 tracking-tight leading-none mb-0.5">
                moJoe
              </h1>
              <p className="text-xs font-semibold text-indigo-500/80">Das interaktive Zwanzigerfeld</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cute Owl Mascot Button */}
            <button
              onClick={handleMascotClick}
              className={`p-1 rounded-2xl border transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 cursor-pointer flex items-center justify-center w-11 h-11 ${
                showHint 
                  ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-400/20 scale-[1.03]' 
                  : 'bg-white/80 border-slate-200/60 hover:bg-slate-50 hover:scale-[1.03]'
              }`}
              aria-label="Hilfe-Eule antippen"
            >
              <svg
                className="w-8 h-8 animate-mascot shrink-0 select-none drop-shadow-sm"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="55" r="32" fill="#818cf8" />
                <ellipse cx="50" cy="62" rx="20" ry="16" fill="#e0e7ff" />
                <polygon points="25,32 38,36 22,18" fill="#818cf8" />
                <polygon points="75,32 62,36 78,18" fill="#818cf8" />
                <circle cx="38" cy="42" r="12" fill="white" />
                <circle cx="62" cy="42" r="12" fill="white" />
                <circle cx="40" cy="42" r="6" fill="#1e1b4b" />
                <circle cx="60" cy="42" r="6" fill="#1e1b4b" />
                <circle cx="38" cy="40" r="2" fill="white" />
                <circle cx="58" cy="40" r="2" fill="white" />
                <polygon points="50,48 45,56 55,56" fill="#fbbf24" />
                <circle cx="40" cy="86" r="5" fill="#f59e0b" />
                <circle cx="60" cy="86" r="5" fill="#f59e0b" />
              </svg>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-2xl bg-white/80 border border-slate-200/60 hover:bg-slate-50 hover:scale-[1.03] transition-all shadow-sm text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 cursor-pointer"
              aria-label={isMuted ? "Ton einschalten" : "Ton stummschalten"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={startNewRound}
              className="p-2.5 rounded-2xl bg-white/80 border border-slate-200/60 hover:bg-slate-50 hover:scale-[1.03] transition-all shadow-sm text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 cursor-pointer"
              aria-label="Runde neu starten"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-2xl border transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 cursor-pointer ${
                showSettings 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 scale-[1.03]' 
                  : 'bg-white/80 border-slate-200/60 hover:bg-slate-50 hover:scale-[1.03] text-slate-600'
              }`}
              aria-label="Einstellungen öffnen"
            >
              <Settings size={20} className={showSettings ? 'animate-spin-slow' : ''} />
            </button>
          </div>
        </div>

        {/* Unified Settings Drawer */}
        {showSettings && (
          <div className="clay-card p-5 mt-1 flex flex-col gap-4 animate-pop">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mode Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-xs text-slate-400 uppercase tracking-wider px-1">Rechenart</span>
                <div className="bg-white/90 p-1 rounded-2xl border border-slate-200/50 shadow-sm flex gap-1">
                  <button
                    onClick={() => handleTaskTypeChange('addition')}
                    className={`flex-1 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                      taskType === 'addition'
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    Plus (+)
                  </button>
                  <button
                    onClick={() => handleTaskTypeChange('subtraction')}
                    className={`flex-1 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                      taskType === 'subtraction'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                        : 'text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Minus (-)
                  </button>
                </div>
              </div>

              {/* Level Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-xs text-slate-400 uppercase tracking-wider px-1">Schwierigkeit</span>
                <div className="bg-white/90 p-1 rounded-2xl border border-slate-200/50 shadow-sm flex gap-1">
                  {( [1, 2, 3] as DifficultyLevel[] ).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleLevelChange(lvl)}
                      className={`flex-1 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                        level === lvl
                          ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                          : 'text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      Level {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Separator line */}
            <div className="h-px bg-slate-200/60 w-full" />

            {/* Colors Selectors */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-sm">
              <span className="font-bold text-slate-500 px-1">Gestalte dein Feld:</span>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Feld 1:</span>
                  <div className="flex gap-1.5">
                    {Object.keys(FRAME1_COLORS).map((name) => (
                      <button
                        key={name}
                        onClick={() => { setColorFrame1(name); playSound('click'); }}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 cursor-pointer ${
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
                  <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Feld 2:</span>
                  <div className="flex gap-1.5">
                    {Object.keys(FRAME2_COLORS).map((name) => (
                      <button
                        key={name}
                        onClick={() => { setColorFrame2(name); playSound('click'); }}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 cursor-pointer ${
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
          </div>
        )}

        {/* Progress Tracker (Stars) */}
        <div className="bg-white/50 border border-slate-200/50 px-5 py-3 rounded-2xl shadow-sm flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500 font-heading">Aufgabe {taskIndex + 1} von {TASKS_PER_ROUND}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: TASKS_PER_ROUND }).map((_, idx) => {
              const isActive = idx === taskIndex;
              const isDone = idx < taskIndex;
              return (
                <Star
                  key={idx}
                  size={22}
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

        {/* Floating Speech bubble / Help Hint Overlay */}
        {showHint && !roundFinished && currentTask && (
          <div className="absolute right-0 top-14 z-50 w-[calc(100vw-32px)] sm:w-80 bg-white/90 backdrop-blur-md border border-indigo-100/50 p-4 rounded-3xl shadow-xl animate-pop">
            {/* Tail pointing up to the mascot button */}
            <div className="absolute -top-2 right-[170px] w-4 h-4 bg-white/90 border-t border-l border-indigo-100/60 transform rotate-45" />
            
            {/* Close Button */}
            <button
              onClick={() => { setShowHint(false); playSound('click'); }}
              className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Hinweis schließen"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <p className="text-sm font-bold text-slate-600 leading-snug pr-5">
              {instructionMessage}
            </p>
          </div>
        )}
      </header>

      {/* Main Board Content */}
      <main className="flex-1 flex flex-col justify-center items-center py-1.5">
        {roundFinished ? (
          /* Finished Screen */
          <div className="clay-card p-8 max-w-md w-full text-center animate-pop flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4 border-2 border-amber-200 shadow-sm animate-float">
              <Trophy size={42} className="text-amber-500 fill-amber-300" />
            </div>
            <h2 className="text-3xl font-bold font-heading text-slate-800 mb-2">Großartig gemacht!</h2>
            <p className="text-slate-500 mb-2 font-semibold">
              Du hast alle {TASKS_PER_ROUND} Aufgaben im {level === 1 ? 'Level 1' : level === 2 ? 'Level 2' : 'Level 3'} gelöst!
            </p>
            <p className="text-indigo-600 font-extrabold font-heading text-2xl mb-6">
              Sterne gesammelt: {score} / {TASKS_PER_ROUND} ⭐
            </p>
            <div className="flex justify-center gap-1.5 mb-8">
              {Array.from({ length: score }).map((_, idx) => (
                <Star key={idx} size={32} className="fill-amber-400 text-amber-400 animate-float" style={{ animationDelay: `${idx * 0.15}s` }} />
              ))}
            </div>
            <button
              onClick={startNewRound}
              className="w-full py-4 bg-gradient-to-b from-pink-400 to-rose-600 border-rose-700 text-white text-xl clay-btn"
            >
              Nochmal spielen!
            </button>
          </div>
        ) : currentTask ? (
          /* Game Area */
          <div className="w-full flex flex-col items-center">

            {/* Level 3 Palette Toolbar */}
            {level === 3 && !isCorrect && (
              <div className="flex flex-wrap gap-2 p-2 bg-white/95 rounded-2xl border border-slate-200/60 shadow-md mb-4 justify-center">
                {currentTask.type === 'addition' ? (
                  <>
                    <button
                      onClick={() => { setActiveTool('color1'); playSound('click'); }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                        activeTool === 'color1'
                          ? 'bg-slate-100 border-slate-300 text-slate-700 scale-[1.02] shadow-sm'
                          : 'border-transparent text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-400 shadow-sm" />
                      Zahl 1 (Grau)
                    </button>
                    <button
                      onClick={() => { setActiveTool('color2'); playSound('click'); }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                        activeTool === 'color2'
                          ? 'bg-red-50 border-red-200 text-red-600 scale-[1.02] shadow-sm'
                          : 'border-transparent text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-0.5 mr-1 shrink-0">
                        <div className="w-2.5 h-3.5 rounded-l-full shadow-sm" style={{ backgroundColor: FRAME1_COLORS[colorFrame1]?.hex || '#ef4444' }} />
                        <div className="w-2.5 h-3.5 rounded-r-full shadow-sm" style={{ backgroundColor: FRAME2_COLORS[colorFrame2]?.hex || '#3b82f6' }} />
                      </div>
                      Zahl 2 (Bunt)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setActiveTool('color1'); playSound('click'); }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                        activeTool === 'color1'
                          ? 'bg-slate-100 border-slate-300 text-slate-700 scale-[1.02] shadow-sm'
                          : 'border-transparent text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-400 shadow-sm" />
                      Zahl 1 (Grau)
                    </button>
                    <button
                      onClick={() => { setActiveTool('color2'); playSound('click'); }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                        activeTool === 'color2'
                          ? 'bg-red-50 border-red-200 text-red-600 scale-[1.02] shadow-sm'
                          : 'border-transparent text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-0.5 mr-1 shrink-0">
                        <div className="w-2.5 h-3.5 rounded-l-full shadow-sm" style={{ backgroundColor: FRAME1_COLORS[colorFrame1]?.hex || '#ef4444' }} />
                        <div className="w-2.5 h-3.5 rounded-r-full shadow-sm" style={{ backgroundColor: FRAME2_COLORS[colorFrame2]?.hex || '#3b82f6' }} />
                      </div>
                      Abzug (Bunt)
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setActiveTool('eraser'); playSound('click'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                    activeTool === 'eraser'
                      ? 'bg-slate-100 border-slate-300 text-slate-700 scale-[1.02] shadow-sm'
                      : 'border-transparent text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Eraser size={16} className="text-slate-500" />
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
            {(() => {
              const A = currentTask.operand1;
              const B = currentTask.operand2;
              let pct: number;
              let colorA: string;
              let colorB: string;
              
              if (currentTask.type === 'addition') {
                const toTen = 10 - A;
                pct = (toTen / B) * 100;
                colorA = FRAME1_COLORS[colorFrame1]?.hex || '#ff5c5c';
                colorB = FRAME2_COLORS[colorFrame2]?.hex || '#3b82f6';
              } else {
                const secondFieldPoints = A - 10;
                pct = (secondFieldPoints / B) * 100;
                colorA = FRAME2_COLORS[colorFrame2]?.hex || '#3b82f6';
                colorB = FRAME1_COLORS[colorFrame1]?.hex || '#ff5c5c';
              }

              const operand2Style: React.CSSProperties = {
                backgroundImage: `linear-gradient(to right, ${colorA} ${pct}%, ${colorB} ${pct}%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block',
              };

              return (
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full justify-center">
                  <div className="flex items-center gap-3 font-heading font-extrabold text-5xl sm:text-6xl text-slate-700 tracking-wide select-none">
                    <span style={{ color: '#64748b' }}>{A}</span>
                    <span className="text-slate-500">{currentTask.type === 'addition' ? '+' : '-'}</span>
                    <span style={operand2Style}>{B}</span>
                    <span className="text-slate-500">=</span>
                    
                    {/* Result Display Bubble (Read-only to prevent mobile keyboard) */}
                    <div
                      id="result-display"
                      role="textbox"
                      aria-label="Ergebnis"
                      aria-readonly="true"
                      aria-placeholder="?"
                      className={`w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded-3xl font-heading font-extrabold text-4xl bg-white clay-input transition-all duration-200 select-none ${
                        showShake ? 'animate-shake' : ''
                      } ${
                        isCorrect === true
                          ? 'border-green-500 text-green-600 bg-green-50/50 !shadow-none'
                          : isCorrect === false
                            ? 'border-red-400 text-red-500'
                            : 'text-slate-700'
                      }`}
                    >
                      {inputValue || '?'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    {isCorrect ? (
                      <button
                        onClick={nextTask}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 sm:py-5 bg-gradient-to-b from-[#10b981] to-[#059669] border-[#065f46] text-white text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-95 clay-btn"
                      >
                        <span>Weiter</span>
                        <ArrowRight size={22} />
                      </button>
                    ) : (
                      <button
                        onClick={handleCheck}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 sm:py-5 bg-gradient-to-b from-indigo-500 to-[#4f46e5] border-[#3730a3] text-white text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-95 clay-btn"
                      >
                        <span>Prüfen</span>
                        <CheckCircle size={22} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Custom On-screen Keypad */}
            {!isCorrect && (
              <div className="mt-6 mb-2 w-full max-w-[280px] grid grid-cols-3 gap-3 animate-pop">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setInputValue((prev) => {
                        if (prev.length < 2) {
                          return prev + num;
                        }
                        return prev;
                      });
                    }}
                    className="h-14 sm:h-16 text-2xl sm:text-3xl bg-white text-slate-700 font-heading font-extrabold rounded-2xl shadow-sm border border-slate-200/50 hover:bg-indigo-50/10 active:scale-95 cursor-pointer clay-btn flex items-center justify-center transition-all duration-150"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Clear (C) button */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setInputValue('');
                  }}
                  className="h-14 sm:h-16 text-xl sm:text-2xl bg-amber-50 text-amber-600 border border-amber-200/40 hover:bg-amber-100/50 font-heading font-extrabold rounded-2xl active:scale-95 cursor-pointer clay-btn flex items-center justify-center transition-all duration-150"
                  aria-label="Eingabe löschen"
                >
                  C
                </button>

                {/* Digit 0 */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setInputValue((prev) => {
                      if (prev.length < 2) {
                        return prev + '0';
                      }
                      return prev;
                    });
                  }}
                  className="h-14 sm:h-16 text-2xl sm:text-3xl bg-white text-slate-700 font-heading font-extrabold rounded-2xl shadow-sm border border-slate-200/50 hover:bg-indigo-50/10 active:scale-95 cursor-pointer clay-btn flex items-center justify-center transition-all duration-150"
                >
                  0
                </button>

                {/* Backspace button */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setInputValue((prev) => prev.slice(0, -1));
                  }}
                  className="h-14 sm:h-16 text-lg sm:text-xl bg-rose-50 text-rose-600 border border-rose-200/40 hover:bg-rose-100/50 font-heading font-extrabold rounded-2xl active:scale-95 cursor-pointer clay-btn flex items-center justify-center transition-all duration-150"
                  aria-label="Letzte Stelle löschen"
                >
                  ⌫
                </button>
              </div>
            )}

            {/* Validation Feedback message */}
            {isCorrect === false && (
              <div className="mt-4 text-red-600 font-bold text-sm bg-red-50 border-2 border-red-200 px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm animate-pop font-heading animate-shake">
                <Frown size={20} className="text-red-500 shrink-0" />
                <span>Leider nicht ganz richtig! Überprüfe die Punkte oder dein Ergebnis.</span>
              </div>
            )}
            {isCorrect === true && (
              <div className="mt-4 text-emerald-700 font-bold text-sm bg-emerald-50 border-2 border-emerald-200 px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm animate-pop font-heading">
                <Sparkles size={20} className="text-emerald-500 animate-pulse shrink-0" />
                <span>Super! Das ist vollkommen richtig! 🌟</span>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Footer / Copyright / SEO */}
      <footer className="w-full text-center py-4 border-t border-indigo-100/40 mt-8 text-xs text-indigo-500/60 font-semibold">
        moJoe © 2026 • Ein spielerisches Zwanzigerfeld für den optimalen Zehnerübergang
      </footer>

      {/* Confetti Animation Layer */}
      <Confetti active={showConfetti} />
    </div>
  );
}

export default App;
