/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Star, ShieldCheck, Flame, Compass } from 'lucide-react';
import { GameStats, LEVELS } from '../types';

interface ScoreBoardProps {
  stats: GameStats;
}

export default function ScoreBoard({ stats }: ScoreBoardProps) {
  const percent = Math.min(100, Math.round((stats.score / stats.targetScore) * 100));
  const isTargetMet = stats.score >= stats.targetScore;
  const activeLevelInfo = LEVELS.find(l => l.id === stats.level);

  return (
    <div 
      id="score-dashboard"
      className="w-full grid grid-cols-1 select-none"
    >
      {/* Active Level Name & Objective Descriptions */}
      {activeLevelInfo && (
        <div id="level-objective-card" className="p-3 sm:p-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-700/20 to-pink-700/20 border border-white/20 flex flex-col gap-1 sm:gap-1.5 mb-2 sm:mb-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-widest leading-none">
                Aktif Görev: {activeLevelInfo.name}
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase bg-amber-500/25 border border-amber-400/30 px-1.5 sm:px-2 py-0.5 rounded-md text-amber-200">
              Seviye {stats.level}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-white/90 font-medium leading-relaxed">
            {activeLevelInfo.description}
          </p>
          <div className="text-[9px] sm:text-[10px] text-white/50 font-bold uppercase tracking-wider mt-0.5">
            Hedef Şartı: <span className="text-amber-300 font-extrabold">{activeLevelInfo.objective}</span>
          </div>
        </div>
      )}

      {/* Target Progress Bar */}
      <div className="p-3 sm:p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 flex flex-col gap-2 sm:gap-3 mb-2 sm:mb-4 shadow-2xl">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
            <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-widest">
              Hedef İlerlemesi
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-black text-rose-300 bg-white/20 border border-white/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
            {stats.score} / {stats.targetScore} Puan
          </span>
        </div>

        {/* Progress tracks bar */}
        <div className="relative w-full h-3 sm:h-4 bg-white/10 rounded-full border border-white/10 overflow-hidden p-0.5">
          <div
            id="score-progress-fill"
            style={{ width: `${percent}%` }}
            className={`h-full rounded-full transition-all duration-300 ${
              isTargetMet 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/25 animate-pulse' 
                : 'bg-gradient-to-r from-pink-400 to-rose-500 shadow-md shadow-rose-500/15'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-white/60 font-bold uppercase tracking-wider">
          <span>%0 BAŞLANGIÇ</span>
          {isTargetMet ? (
            <span className="text-emerald-300 flex items-center gap-0.5 sm:gap-1">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" /> SONRAKİ SEVİYEYE HAZIRSIN!
            </span>
          ) : (
            <span>HEDEF: %100</span>
          )}
        </div>
      </div>

      {/* Main Stats Cards (Level, Score, Moves) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Level Box */}
        <div className="p-2 sm:p-3.5 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all flex flex-col items-center justify-center text-center shadow-lg">
          <span className="text-[8px] sm:text-[10px] text-white/60 font-extrabold uppercase tracking-widest">SEVİYE</span>
          <span className="text-xl sm:text-2xl font-black text-white mt-0.5 sm:mt-1">{stats.level}</span>
          <span className="text-[8px] sm:text-[9px] text-white/50 font-medium mt-0.5 uppercase hidden sm:inline">Şeker Krallığı</span>
        </div>

        {/* Moves Counter */}
        <div className="p-2 sm:p-3.5 rounded-2xl backdrop-blur-xl bg-white/20 border-2 border-white/35 shadow-xl shadow-white/5 hover:border-rose-400 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Pulsing indicator if dangerously low on moves */}
          {stats.movesLeft <= 5 && (
            <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none" />
          )}
          <span className="text-[8px] sm:text-[10px] text-rose-300 font-extrabold uppercase tracking-widest leading-none">
            HAMLELER
          </span>
          <span className={`text-2xl sm:text-3xl font-black mt-0.5 sm:mt-1 ${
            stats.movesLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-white'
          }`}>
            {stats.movesLeft}
          </span>
          <span className="text-[8px] sm:text-[9px] text-white/50 font-medium mt-0.5 uppercase hidden sm:inline">KALAN</span>
        </div>

        {/* High Score Card */}
        <div className="p-2 sm:p-3.5 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all flex flex-col items-center justify-center text-center shadow-lg">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Trophy className="w-3 w-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
            <span className="text-[8px] sm:text-[10px] text-white/60 font-extrabold uppercase tracking-widest">REKOR</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 sm:mt-1">
            {Math.max(stats.highScore, stats.score)}
          </span>
          <span className="text-[8px] sm:text-[9px] text-white/50 font-medium mt-0.5 uppercase hidden sm:inline">ÇEREZ REKORU</span>
        </div>
      </div>
    </div>
  );
}
