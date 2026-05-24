/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, AlertCircle, RefreshCw, Zap, Hammer } from 'lucide-react';
import { CandyType, SpecialType, CandyItem, GameStats, BoosterState, LEVELS } from '../types';
import { sounds } from '../utils/audio';

const BOARD_SIZE = 8;

interface GameBoardProps {
  level: number;
  stats: GameStats;
  onStatsChange: (stats: GameStats) => void;
  boosters: BoosterState;
  onUseBooster: (type: 'stripe' | 'color_bomb') => void;
  onGameOver: (score: number, passed: boolean) => void;
}

export default function GameBoard({
  level,
  stats,
  onStatsChange,
  boosters,
  onUseBooster,
  onGameOver
}: GameBoardProps) {
  const [board, setBoard] = useState<CandyItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeBooster, setActiveBooster] = useState<'stripe' | 'color_bomb' | null>(null);
  const [comboCount, setComboCount] = useState<number>(0);

  // Touch swipe support refs
  const touchStartRef = useRef<{ x: number; y: number; id: string } | null>(null);

  // Initialize Board on mount or level change
  useEffect(() => {
    initBoard();
  }, [level]);

  // Handle game over conditions
  useEffect(() => {
    if (!isProcessing && board.length > 0) {
      const hasMoves = hasAnyPossibleMove(board);
      if (stats.movesLeft <= 0 || !hasMoves) {
        const isPassed = stats.score >= stats.targetScore;
        onGameOver(stats.score, isPassed);
      }
    }
  }, [stats.movesLeft, isProcessing, board]);

  // Generate a random candy type that doesn't immediately form match-3 at initialization
  const getRandomCandyType = (row: number, col: number, tempBoard: CandyItem[]): CandyType => {
    const forbiddenTypes: CandyType[] = [];
    
    // Check horizontal matches left of cell
    if (col >= 2) {
      const left1 = tempBoard.find(c => c.row === row && c.col === col - 1 && !c.isBlocker);
      const left2 = tempBoard.find(c => c.row === row && c.col === col - 2 && !c.isBlocker);
      if (left1 && left2 && left1.type === left2.type) {
        forbiddenTypes.push(left1.type);
      }
    }

    // Check vertical matches above cell
    if (row >= 2) {
      const above1 = tempBoard.find(c => c.row === row - 1 && c.col === col && !c.isBlocker);
      const above2 = tempBoard.find(c => c.row === row - 2 && c.col === col && !c.isBlocker);
      if (above1 && above2 && above1.type === above2.type) {
        forbiddenTypes.push(above1.type);
      }
    }

    // Pick a candy type that is NOT forbidden
    const availableTypes = [
      CandyType.RED_CHERRY,
      CandyType.BLUE_JELLY,
      CandyType.YELLOW_LEMON,
      CandyType.GREEN_APPLE,
      CandyType.ORANGE_CARAMEL,
      CandyType.PURPLE_GUM
    ].filter(t => !forbiddenTypes.includes(t));

    const randomIndex = Math.floor(Math.random() * availableTypes.length);
    return availableTypes[randomIndex];
  };

  const createCandy = (id: string, type: CandyType, row: number, col: number, special: SpecialType = 'NORMAL'): CandyItem => ({
    id,
    type,
    special,
    row,
    col,
  });

  const initBoard = () => {
    const lvlDef = LEVELS.find(l => l.id === level) || LEVELS[0];
    const blockersList = lvlDef.blockers || [];
    const frozenList = lvlDef.frozen || [];

    let tempBoard: CandyItem[] = [];
    let attempts = 0;

    do {
      tempBoard = [];
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const id = `${row}-${col}-${Math.random().toString(36).substr(2, 9)}`;
          
          const isBlocker = blockersList.some(b => b.row === row && b.col === col);
          const isFrozen = frozenList.some(f => f.row === row && f.col === col);

          if (isBlocker) {
            const item = createCandy(id, CandyType.RED_CHERRY, row, col);
            item.isBlocker = true;
            tempBoard.push(item);
          } else {
            const type = getRandomCandyType(row, col, tempBoard);
            const item = createCandy(id, type, row, col);
            if (isFrozen) {
              item.frozen = true;
            }
            tempBoard.push(item);
          }
        }
      }
      attempts++;
    } while (!hasAnyPossibleMove(tempBoard) && attempts < 15);

    setBoard(tempBoard);
    setSelectedId(null);
    setIsProcessing(false);
    setComboCount(0);
  };

  // Touch Swipe handler start
  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    if (isProcessing) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      id: itemId
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isProcessing || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < 30 && absY < 30) {
      // It's a normal tap, handled by onClick
      touchStartRef.current = null;
      return;
    }

    const startCandy = board.find(c => c.id === touchStartRef.current?.id);
    if (!startCandy) {
      touchStartRef.current = null;
      return;
    }

    let targetRow = startCandy.row;
    let targetCol = startCandy.col;

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) targetCol += 1; // swipe right
      else targetCol -= 1; // swipe left
    } else {
      // Vertical swipe
      if (deltaY > 0) targetRow += 1; // swipe down
      else targetRow -= 1; // swipe up
    }

    // Verify boundaries
    if (targetRow >= 0 && targetRow < BOARD_SIZE && targetCol >= 0 && targetCol < BOARD_SIZE) {
      const targetCandy = board.find(c => c.row === targetRow && c.col === targetCol);
      if (targetCandy) {
        executeSwap(startCandy, targetCandy);
      }
    }

    touchStartRef.current = null;
  };

  const handleCandyClick = (clickedCandy: CandyItem) => {
    if (isProcessing) return;
    if (clickedCandy.isBlocker) return;

    if (activeBooster) {
      applyBoosterEffect(clickedCandy);
      return;
    }

    sounds.playSelect();

    if (selectedId === null) {
      setSelectedId(clickedCandy.id);
    } else {
      const selectedCandy = board.find(c => c.id === selectedId);
      if (!selectedCandy) {
        setSelectedId(clickedCandy.id);
        return;
      }

      const isAdjacent = 
        (Math.abs(selectedCandy.row - clickedCandy.row) === 1 && selectedCandy.col === clickedCandy.col) ||
        (Math.abs(selectedCandy.col - clickedCandy.col) === 1 && selectedCandy.row === clickedCandy.row);

      if (isAdjacent) {
        executeSwap(selectedCandy, clickedCandy);
      } else {
        // Change selection
        setSelectedId(clickedCandy.id);
      }
    }
  };

  const executeSwap = async (candyA: CandyItem, candyB: CandyItem) => {
    if (candyA.isBlocker || candyB.isBlocker) return;
    setIsProcessing(true);
    setSelectedId(null);
    sounds.playSwap();

    // Visual Swap
    setBoard(prevBoard => {
      return prevBoard.map(candy => {
        if (candy.id === candyA.id) {
          return { ...candy, row: candyB.row, col: candyB.col };
        }
        if (candy.id === candyB.id) {
          return { ...candy, row: candyA.row, col: candyA.col };
        }
        return candy;
      });
    });

    // Wait a brief period for transition animations
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check matches on the temporary preview board
    const currentBoardState = board.map(candy => {
      if (candy.id === candyA.id) return { ...candy, row: candyB.row, col: candyB.col };
      if (candy.id === candyB.id) return { ...candy, row: candyA.row, col: candyA.col };
      return candy;
    });

    const isColorBombSwap = candyA.special === 'COLOR_BOMB' || candyB.special === 'COLOR_BOMB';

    let matchesResult;
    if (isColorBombSwap) {
      matchesResult = triggerColorBombCombination(candyA, candyB, currentBoardState);
    } else {
      matchesResult = findMatches(currentBoardState);
    }

    if (matchesResult.hasMatches) {
      // Successful move! Deplete dynamic moves count
      onStatsChange({
        ...stats,
        movesLeft: stats.movesLeft - 1
      });
      // Run the elimination engine
      await processEliminationsAndCascades(matchesResult.matchedIds, currentBoardState, 1);
    } else {
      // Put them back since it didn't match!
      sounds.playSwap();
      setBoard(prevBoard => {
        return prevBoard.map(candy => {
          if (candy.id === candyA.id) {
            return { ...candy, row: candyA.row, col: candyA.col };
          }
          if (candy.id === candyB.id) {
            return { ...candy, row: candyB.row, col: candyB.col };
          }
          return candy;
        });
      });
      setIsProcessing(false);
    }
  };

  // Boosters implementation
  const applyBoosterEffect = async (targetCandy: CandyItem) => {
    if (!activeBooster) return;
    setIsProcessing(true);
    sounds.playSpecialActivate();

    let matchedIds: string[] = [];
    const currentBoard = [...board];

    if (activeBooster === 'stripe') {
      // Column hammer smashing - trigger whole column and row
      matchedIds = currentBoard
        .filter(c => c.row === targetCandy.row || c.col === targetCandy.col)
        .map(c => c.id);
      
      onUseBooster('stripe');
    } else if (activeBooster === 'color_bomb') {
      // Color blast - trigger all candies of this specific color
      matchedIds = currentBoard
        .filter(c => c.type === targetCandy.type || c.id === targetCandy.id)
        .map(c => c.id);

      onUseBooster('color_bomb');
    }

    setActiveBooster(null);

    // Run the cascade process immediately for smashed cookies
    if (matchedIds.length > 0) {
      await processEliminationsAndCascades(matchedIds, currentBoard, 1);
    } else {
      setIsProcessing(false);
    }
  };

  const triggerColorBombCombination = (itemA: CandyItem, itemB: CandyItem, currentBoard: CandyItem[]) => {
    const isABomb = itemA.special === 'COLOR_BOMB';
    const targetType = isABomb ? itemB.type : itemA.type;
    const bombItem = isABomb ? itemA : itemB;

    sounds.playSpecialActivate();

    const matchedIds = currentBoard
      .filter(c => c.type === targetType || c.id === bombItem.id)
      .map(c => c.id);

    return {
      hasMatches: true,
      matchedIds
    };
  };

  // Find all horizontal and vertical match-3, match-4 and match-5 patterns
  const findMatches = (currentBoard: CandyItem[]) => {
    const matchedIds = new Set<string>();

    // Grid representation for parsing index safely
    const grid: (CandyItem | null)[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    currentBoard.forEach(c => {
      if (c.row >= 0 && c.row < BOARD_SIZE && c.col >= 0 && c.col < BOARD_SIZE) {
        if (!c.isBlocker) {
          grid[c.row][c.col] = c;
        }
      }
    });

    // Check Horizontal Matches
    for (let r = 0; r < BOARD_SIZE; r++) {
      let matchLength = 1;
      let matchType: CandyType | null = null;
      let startCol = 0;

      for (let c = 0; c < BOARD_SIZE; c++) {
        const item = grid[r][c];
        if (item && item.type === matchType) {
          matchLength++;
        } else {
          if (matchLength >= 3 && matchType !== null) {
            for (let i = startCol; i < startCol + matchLength; i++) {
              const matchedItem = grid[r][i];
              if (matchedItem) matchedIds.add(matchedItem.id);
            }
          }
          matchType = item ? item.type : null;
          matchLength = 1;
          startCol = c;
        }
      }
      // Check last iteration
      if (matchLength >= 3 && matchType !== null) {
        for (let i = startCol; i < startCol + matchLength; i++) {
          const matchedItem = grid[r][i];
          if (matchedItem) matchedIds.add(matchedItem.id);
        }
      }
    }

    // Check Vertical Matches
    for (let c = 0; c < BOARD_SIZE; c++) {
      let matchLength = 1;
      let matchType: CandyType | null = null;
      let startRow = 0;

      for (let r = 0; r < BOARD_SIZE; r++) {
        const item = grid[r][c];
        if (item && item.type === matchType) {
          matchLength++;
        } else {
          if (matchLength >= 3 && matchType !== null) {
            for (let i = startRow; i < startRow + matchLength; i++) {
              const matchedItem = grid[i][c];
              if (matchedItem) matchedIds.add(matchedItem.id);
            }
          }
          matchType = item ? item.type : null;
          matchLength = 1;
          startRow = r;
        }
      }
      // Check last iteration
      if (matchLength >= 3 && matchType !== null) {
        for (let i = startRow; i < startRow + matchLength; i++) {
          const matchedItem = grid[i][c];
          if (matchedItem) matchedIds.add(matchedItem.id);
        }
      }
    }

    return {
      hasMatches: matchedIds.size > 0,
      matchedIds: Array.from(matchedIds)
    };
  };

  const hasAnyPossibleMove = (currentBoard: CandyItem[]): boolean => {
    // Grid representation for parsing index safely
    const grid: (CandyItem | null)[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    currentBoard.forEach(c => {
      if (c.row >= 0 && c.row < BOARD_SIZE && c.col >= 0 && c.col < BOARD_SIZE) {
        grid[c.row][c.col] = c;
      }
    });

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const item = grid[r][c];
        if (!item || item.isBlocker) continue;

        // Color bomb candies are wildcards: if adjacent to any non-blocker, it's a valid move
        if (item.special === 'COLOR_BOMB') {
          const neighbors = [
            { row: r - 1, col: c },
            { row: r + 1, col: c },
            { row: r, col: c - 1 },
            { row: r, col: c + 1 }
          ];
          for (const nb of neighbors) {
            if (nb.row >= 0 && nb.row < BOARD_SIZE && nb.col >= 0 && nb.col < BOARD_SIZE) {
              const nItem = grid[nb.row][nb.col];
              if (nItem && !nItem.isBlocker) {
                return true;
              }
            }
          }
        }

        // Check horizontal swap with right neighbor
        if (c + 1 < BOARD_SIZE) {
          const neighbor = grid[r][c + 1];
          if (neighbor && !neighbor.isBlocker) {
            // Swap item and neighbor on a copied layout
            const simulatedBoard = currentBoard.map(candy => {
              if (candy.id === item.id) return { ...candy, row: r, col: c + 1 };
              if (candy.id === neighbor.id) return { ...candy, row: r, col: c };
              return candy;
            });
            
            // If either candy is a color bomb, it's a valid possible move!
            if (item.special === 'COLOR_BOMB' || neighbor.special === 'COLOR_BOMB') {
              return true;
            }
            if (findMatches(simulatedBoard).hasMatches) {
              return true;
            }
          }
        }

        // Check vertical swap with bottom neighbor
        if (r + 1 < BOARD_SIZE) {
          const neighbor = grid[r + 1][c];
          if (neighbor && !neighbor.isBlocker) {
            // Swap item and neighbor on a copied layout
            const simulatedBoard = currentBoard.map(candy => {
              if (candy.id === item.id) return { ...candy, row: r + 1, col: c };
              if (candy.id === neighbor.id) return { ...candy, row: r, col: c };
              return candy;
            });
            
            // If either candy is a color bomb, it's a valid possible move!
            if (item.special === 'COLOR_BOMB' || neighbor.special === 'COLOR_BOMB') {
              return true;
            }
            if (findMatches(simulatedBoard).hasMatches) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  // Scoring and cascade logic loop
  const processEliminationsAndCascades = async (matchedIds: string[], currentBoard: CandyItem[], combo: number) => {
    setComboCount(combo);
    sounds.playMatch(combo);

    // Visual match indicator
    setBoard(prev => prev.map(c => {
      if (matchedIds.includes(c.id)) {
        return { ...c, isMatched: true };
      }
      return c;
    }));

    // Pause briefly for explosion fade effect
    await new Promise(resolve => setTimeout(resolve, 250));

    // Calculate score
    const matchedCount = matchedIds.length;
    let basePoints = matchedCount * 40;
    let comboMultiplier = combo > 1 ? combo * 0.5 : 1;
    let scoreGained = Math.round(basePoints * comboMultiplier);

    // Detect if special sweets should form:
    // Match 4 horizontally or vertically: Creates Striped Candy
    // Match 5: Creates Color Bomb!
    let specialCandyToForm: CandyItem | null = null;
    if (matchedCount >= 5) {
      // Select the center of the match as the birth spot
      const targetId = matchedIds[Math.floor(matchedCount / 2)];
      const spot = currentBoard.find(c => c.id === targetId);
      if (spot) {
        specialCandyToForm = createCandy(
          `special-${Date.now()}-${Math.random()}`,
          CandyType.COLOR_BOMB,
          spot.row,
          spot.col,
          'COLOR_BOMB'
        );
      }
    } else if (matchedCount === 4) {
      const targetId = matchedIds[1];
      const spot = currentBoard.find(c => c.id === targetId);
      if (spot) {
        const isHorizontal = currentBoard.filter(c => matchedIds.includes(c.id) && c.row === spot.row).length >= 3;
        specialCandyToForm = createCandy(
          `special-${Date.now()}-${Math.random()}`,
          spot.type,
          spot.row,
          spot.col,
          isHorizontal ? 'STRIPED_H' : 'STRIPED_V'
        );
      }
    }

    // Eliminate matches from list (except those that had ice, which break their ice layer instead)
    const frozenMatched = currentBoard.filter(c => matchedIds.includes(c.id) && c.frozen);
    const unicedSweets = frozenMatched.map(c => ({
      ...c,
      frozen: false,
      isMatched: false
    }));

    // Find and smash neighboring chocolate blockers
    const blockersToDestroy: string[] = [];
    const boardBlockers = currentBoard.filter(c => c.isBlocker);
    boardBlockers.forEach(blocker => {
      const isNeighborMatched = currentBoard.some(c => 
        matchedIds.includes(c.id) && 
        Math.abs(c.row - blocker.row) + Math.abs(c.col - blocker.col) === 1
      );
      if (isNeighborMatched) {
        blockersToDestroy.push(blocker.id);
      }
    });

    let filteredBoard = currentBoard.filter(c => 
      !matchedIds.includes(c.id) && !blockersToDestroy.includes(c.id)
    );

    filteredBoard.push(...unicedSweets);

    // Dynamic bonus score for melting ice / clearing chocolate blocker blocks!
    const bonusScore = (frozenMatched.length + blockersToDestroy.length) * 100;
    scoreGained += bonusScore;

    if (bonusScore > 0) {
      sounds.playSpecialActivate?.();
    }

    // If a special candy was formed, inject it
    if (specialCandyToForm) {
      filteredBoard.push(specialCandyToForm);
    }

    // Gravity engine: Calculate and slide items down
    const nextBoardState = applyGravityAndFillRefills(filteredBoard);

    setBoard(nextBoardState);
    onStatsChange({
      ...stats,
      score: stats.score + scoreGained,
      combos: combo
    });

    // Wait for the cascade sliders to stop rolling
    await new Promise(resolve => setTimeout(resolve, 350));

    // Recheck matches recursively ( cascades! )
    const cascadeCheck = findMatches(nextBoardState);
    if (cascadeCheck.hasMatches) {
      await processEliminationsAndCascades(cascadeCheck.matchedIds, nextBoardState, combo + 1);
    } else {
      setIsProcessing(false);
      setComboCount(0);
    }
  };

  const applyGravityAndFillRefills = (oldBoard: CandyItem[]): CandyItem[] => {
    const finalBoard: CandyItem[] = [];
    
    // Find all static blockers to keep in place
    const blockers = oldBoard.filter(item => item.isBlocker);
    
    // Group active elements by column
    for (let c = 0; c < BOARD_SIZE; c++) {
      const colBlockers = blockers.filter(b => b.col === c);
      
      // Existing non-blocker items in this column, sorted lower rows first (bottom to top)
      const fallingItems = oldBoard
        .filter(item => item.col === c && !item.isBlocker)
        .sort((a, b) => b.row - a.row);

      const colResults: CandyItem[] = [];
      let fallingIndex = 0;

      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        // If there is an active blocker at r, c, preserve it!
        const blockerAtSpot = colBlockers.find(b => b.row === r);
        if (blockerAtSpot) {
          colResults.push(blockerAtSpot);
          continue;
        }

        if (fallingIndex < fallingItems.length) {
          const item = fallingItems[fallingIndex];
          colResults.push({
            ...item,
            row: r
          });
          fallingIndex++;
        } else {
          // Generate new cascade drop refills
          const uniqueId = `drop-${c}-${r}-${Math.random().toString(36).substr(2, 5)}`;
          const randomType = [
            CandyType.RED_CHERRY,
            CandyType.BLUE_JELLY,
            CandyType.YELLOW_LEMON,
            CandyType.GREEN_APPLE,
            CandyType.ORANGE_CARAMEL,
            CandyType.PURPLE_GUM
          ][Math.floor(Math.random() * 6)];

          colResults.push({
            id: uniqueId,
            type: randomType,
            special: 'NORMAL',
            row: r,
            col: c,
          });
        }
      }
      finalBoard.push(...colResults);
    }

    return finalBoard;
  };

  // Rendering graphics representation of candies
  const getCandyUIStyle = (item: CandyItem) => {
    let classes = 'relative w-full h-full rounded-2xl flex items-center justify-center p-1.5 cursor-pointer shadow-md select-none touch-none ';
    let gradient = '';
    let shape = null;

    if (item.isBlocker) {
      classes += 'bg-gradient-to-br from-[#54210b] via-[#331102] to-neutral-900 border-2 border-amber-600/45 shadow-xl';
      shape = (
        <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-black text-amber-500 tracking-widest leading-none uppercase select-none">ÇOKO</span>
          <div className="w-7 h-7 bg-amber-950 border-2 border-amber-700 rounded-lg mt-1 flex flex-wrap gap-0.5 p-0.5 shadow-inner">
            <div className="w-2.5 h-2.5 bg-amber-900 border border-amber-800 rounded-sm" />
            <div className="w-2.5 h-2.5 bg-amber-900 border border-amber-800 rounded-sm" />
            <div className="w-2.5 h-2.5 bg-amber-900 border border-amber-800 rounded-sm" />
            <div className="w-2.5 h-2.5 bg-amber-900 border border-amber-800 rounded-sm" />
          </div>
        </div>
      );
      return { classes, gradient, shape };
    }

    if (item.special === 'COLOR_BOMB') {
      classes += 'bg-gradient-to-br from-purple-600 via-neutral-900 to-amber-500 border border-amber-400/40 animate-pulse';
      shape = (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-20 animate-pulse" />
          {/* Chocolate ball */}
          <div className="w-10 h-10 rounded-full bg-amber-950 border-2 border-amber-400 relative flex flex-wrap gap-1 p-1 items-center justify-center overflow-hidden">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
          <Sparkles className="absolute w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      );
      return { classes, gradient, shape };
    }

    switch (item.type) {
      case CandyType.RED_CHERRY:
        gradient = 'bg-gradient-to-br from-rose-500 via-red-500 to-red-700';
        shape = (
          <div className="relative w-9 h-9 flex items-center justify-center">
            {/* Gloss shine */}
            <div className="absolute top-1 left-2.5 w-3 h-1.5 bg-white/40 rounded-full" />
            {/* Stem */}
            <div className="absolute -top-1 right-2 w-3 h-3 border-r-2 border-t-2 border-green-500/80 rounded-tr-md rounded-bl-sm" />
            <div className="w-8.5 h-8 bg-gradient-to-b from-rose-400 to-rose-600 rounded-full flex items-center justify-center border-b border-rose-700 shadow-inner" />
          </div>
        );
        break;

      case CandyType.BLUE_JELLY:
        gradient = 'bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700';
        shape = (
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute top-1 left-3 w-2 h-1 bg-white/50 rounded-full" />
            {/* Diamond shape */}
            <div className="w-7.5 h-7.5 bg-gradient-to-b from-blue-400 to-indigo-600 rotate-45 rounded-lg flex items-center justify-center border-b-2 border-indigo-700 shadow-lg" />
          </div>
        );
        break;

      case CandyType.YELLOW_LEMON:
        gradient = 'bg-gradient-to-br from-amber-300 via-yellow-400 to-yellow-600';
        shape = (
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute top-1 left-2 w-2.5 h-1.5 bg-white/50 rounded-full" />
            {/* Oval tablet sugar */}
            <div className="w-9 h-6.5 bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full flex items-center justify-center border-b border-amber-700 shadow-inner" />
          </div>
        );
        break;

      case CandyType.GREEN_APPLE:
        gradient = 'bg-gradient-to-br from-lime-400 via-emerald-500 to-green-700';
        shape = (
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute top-1 left-3 w-1.5 h-3 bg-white/40 rounded-full rotate-12" />
            {/* Square soft-candy */}
            <div className="w-8 h-8 bg-gradient-to-br from-lime-300 to-emerald-600 rounded-xl flex items-center justify-center border-b-2 border-emerald-800 shadow-md" />
          </div>
        );
        break;

      case CandyType.ORANGE_CARAMEL:
        gradient = 'bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700';
        shape = (
          <div className="relative w-9 h-9 flex items-center justify-center">
            {/* Swirly stripes or wrapper tips */}
            <div className="absolute -left-1 w-2.5 h-5 bg-orange-400 skew-y-12 rounded-l-sm" />
            <div className="absolute -right-1 w-2.5 h-5 bg-orange-400 -skew-y-12 rounded-r-sm" />
            <div className="w-7.5 h-7.5 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full ring-2 ring-orange-400 flex items-center justify-center" />
          </div>
        );
        break;

      case CandyType.PURPLE_GUM:
        gradient = 'bg-gradient-to-br from-fuchsia-400 via-purple-500 to-violet-700';
        shape = (
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute top-1 left-2.5 w-3 h-2 bg-white/40 rounded-full" />
            {/* Star sugar crystal or clustered gel */}
            <div className="w-8 h-8 bg-gradient-to-tr from-fuchsia-400 to-violet-600 rounded-full flex items-center justify-center border-b-2 border-violet-800 shadow-lg">
              <div className="w-4 h-4 rounded-full bg-violet-400/30" />
            </div>
          </div>
        );
        break;
    }

    classes += gradient;

    // Special items indicators
    if (item.special === 'STRIPED_H') {
      shape = (
        <div className="relative w-full h-full flex items-center justify-center">
          {shape}
          {/* Horizontal glowing lines */}
          <div className="absolute inset-x-0 h-1.5 bg-white/80 blur-[1px] animate-pulse" />
          <div className="absolute inset-x-0 h-0.5 bg-yellow-100" />
        </div>
      );
    } else if (item.special === 'STRIPED_V') {
      shape = (
        <div className="relative w-full h-full flex items-center justify-center">
          {shape}
          {/* Vertical glowing line */}
          <div className="absolute inset-y-0 w-1.5 bg-white/80 blur-[1px] animate-pulse" />
          <div className="absolute inset-y-0 w-0.5 bg-yellow-100" />
        </div>
      );
    }

    if (item.frozen) {
      shape = (
        <div className="relative w-full h-full flex items-center justify-center">
          {shape}
          {/* Frosted ice overlay glass cage overlay */}
          <div className="absolute inset-0 bg-cyan-100/35 border-2 border-sky-300/65 rounded-2xl flex items-center justify-center pointer-events-none shadow-inner backdrop-blur-[0.5px]">
            <div className="absolute w-2 h-5 bg-white/40 rotate-45 rounded-full blur-[1px]" />
            <div className="absolute w-full h-full border border-sky-200/40 rounded-xl" />
          </div>
        </div>
      );
    }

    return { classes, gradient, shape };
  };

  return (
    <div id="game-arena-wrapper" className="flex flex-col items-center gap-3 sm:gap-5 w-full">
      {/* Target and Combo header banner */}
      <div 
        id="combo-banner-box"
        className="w-full flex items-center justify-between px-4 py-2 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" />
          <span className="text-xs font-bold text-white/80 tracking-wider">KOMBO DURUMU:</span>
        </div>

        <AnimatePresence mode="wait">
          {comboCount > 0 ? (
            <motion.div
              key={comboCount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1], opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5 text-amber-300 font-extrabold text-sm"
            >
              <Flame className="w-4 h-4 fill-amber-300 animate-bounce" /> {comboCount}x Kombo Katlayıcı!
            </motion.div>
          ) : (
            <span className="text-xs font-semibold text-white/40">Arka arkaya eşleştir ve katla!</span>
          )}
        </AnimatePresence>
      </div>

      {/* Grid container with absolute layout cells */}
      <div 
        id="board-play-container"
        className="relative w-full aspect-square max-w-lg overflow-hidden rounded-[32px] backdrop-blur-2xl bg-white/5 p-2.5 border-2 border-white/15 shadow-2xl select-none"
      >
        {/* Playable Matrix */}
        <div className="grid grid-cols-8 grid-rows-8 gap-1.5 w-full h-full">
          {board
            .sort((a, b) => (a.row * BOARD_SIZE + a.col) - (b.row * BOARD_SIZE + b.col))
            .map(item => {
              const { classes, shape } = getCandyUIStyle(item);
              const isSelected = selectedId === item.id;
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleCandyClick(item)}
                  onTouchStart={(e) => handleTouchStart(e, item.id)}
                  onTouchEnd={handleTouchEnd}
                  className="relative w-full aspect-square"
                >
                  <AnimatePresence>
                    {!item.isMatched && (
                      <motion.div
                        layoutId={item.id}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ 
                          scale: isSelected ? 1.05 : 1, 
                          opacity: 1,
                          rotate: isSelected ? [0, -3, 3, 0] : 0
                        }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ 
                          type: 'spring', 
                          damping: 18, 
                          stiffness: 160,
                          rotate: isSelected ? { repeat: Infinity, duration: 1.5 } : {}
                        }}
                        className={`${classes} ${
                          isSelected ? 'ring-4 ring-white scale-105 z-10 shadow-lg shadow-white/30' : ''
                        }`}
                      >
                        {shape}
                        
                        {/* Selected overlay neon outline */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-2xl border-2 border-white animate-pulse" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bubble matched popping spark particles */}
                  {item.isMatched && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        initial={{ scale: 0.6, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        className="w-8 h-8 rounded-full border border-white/80 bg-white/25 blur-[1px]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Boosters action buttons */}
      <div 
        id="board-actions-boosters"
        className="w-full grid grid-cols-2 gap-3"
      >
        {/* Cylinder / Stripe Hammer */}
        <motion.button
          id="booster-stripe-hammer-btn"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (activeBooster === 'stripe') {
              setActiveBooster(null);
            } else if (boosters.stripeHammerCount > 0) {
              setActiveBooster('stripe');
            }
          }}
          disabled={boosters.stripeHammerCount <= 0 && activeBooster !== 'stripe'}
          className={`flex items-center justify-between p-3.5 rounded-2xl border font-bold transition-all relative overflow-hidden cursor-pointer ${
            activeBooster === 'stripe'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-white/40 text-white shadow-lg'
              : boosters.stripeHammerCount > 0
                ? 'backdrop-blur-xl bg-white/10 hover:bg-white/15 border-white/20 text-white'
                : 'backdrop-blur-sm bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          {activeBooster === 'stripe' && (
            <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
          )}
          <div className="flex items-center gap-2">
            <Hammer className={`w-5 h-5 ${activeBooster === 'stripe' ? 'text-white animate-bounce' : 'text-pink-300'}`} />
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs">Çekiç Smasher</span>
              <span className="text-[10px] text-white/50 font-medium">Sütun Patlatıcı</span>
            </div>
          </div>
          <span className="text-xs text-white/80 font-extrabold bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
            {boosters.stripeHammerCount}
          </span>
        </motion.button>

        {/* Color Blast Bomb */}
        <motion.button
          id="booster-color-bomb-btn"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (activeBooster === 'color_bomb') {
              setActiveBooster(null);
            } else if (boosters.colorBombCount > 0) {
              setActiveBooster('color_bomb');
            }
          }}
          disabled={boosters.colorBombCount <= 0 && activeBooster !== 'color_bomb'}
          className={`flex items-center justify-between p-3.5 rounded-2xl border font-bold transition-all relative overflow-hidden cursor-pointer ${
            activeBooster === 'color_bomb'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 border-white/40 text-white shadow-lg'
              : boosters.colorBombCount > 0
                ? 'backdrop-blur-xl bg-white/10 hover:bg-white/15 border-white/20 text-white'
                : 'backdrop-blur-sm bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          {activeBooster === 'color_bomb' && (
            <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
          )}
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${activeBooster === 'color_bomb' ? 'text-white animate-spin' : 'text-cyan-300'}`} />
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs">Renk Bombası</span>
              <span className="text-[10px] text-white/50 font-medium">Aynı Renk Patlat</span>
            </div>
          </div>
          <span className="text-xs text-white/80 font-extrabold bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
            {boosters.colorBombCount}
          </span>
        </motion.button>
      </div>

      {activeBooster && (
        <div className="flex items-center gap-2 text-xs text-amber-200 font-semibold backdrop-blur-md bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-300" /> Eşleşme olmadan hedefe tıklayarak gücü serbest bırak!
        </div>
      )}
    </div>
  );
}
