/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, ArrowRight, Star, HeartCrack } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  targetScore: number;
  level: number;
  onRetry: () => void;
  onNextLevel: () => void;
  isPassed: boolean;
}

export default function GameOverModal({
  isOpen,
  score,
  highScore,
  targetScore,
  level,
  onRetry,
  onNextLevel,
  isPassed
}: GameOverModalProps) {

  useEffect(() => {
    if (isOpen) {
      if (isPassed) {
        sounds.playTriumph();
      } else {
        // Play failure or normal reset sound
      }
    }
  }, [isOpen, isPassed]);

  if (!isOpen) return null;

  const isNewHighScore = score >= highScore && score > 0;

  return (
    <AnimatePresence>
      <div 
        id="game-over-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e0534]/60 backdrop-blur-md"
      >
        <motion.div
          id="game-over-container"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md overflow-hidden rounded-[32px] backdrop-blur-2xl bg-[#3b0764]/40 border border-white/25 text-white shadow-2xl p-6 md:p-8 text-center"
        >
          {/* Subtle colored glow depending on success */}
          {isPassed ? (
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          ) : (
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          )}

          {/* Header Banner */}
          <div className="flex flex-col items-center mb-6">
            <div className={`p-4 rounded-full mb-4 ${
              isPassed 
                ? 'bg-amber-500/20 border border-white/30 text-amber-300' 
                : 'bg-rose-500/20 border border-white/30 text-rose-300'
            }`}>
              {isPassed ? (
                <Trophy className="w-12 h-12 animate-bounce" />
              ) : (
                <HeartCrack className="w-12 h-12" />
              )}
            </div>

            <h2 className="text-3xl font-black tracking-tight uppercase">
              {isPassed ? (
                <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                  SEVİYE GEÇİLDİ!
                </span>
              ) : (
                <span className="bg-gradient-to-r from-red-300 to-rose-500 bg-clip-text text-transparent">
                  HAMLELER BİTTİ
                </span>
              )}
            </h2>

            <p className="text-white/70 text-sm mt-1">
              {isPassed 
                ? `Harika iş çıkardın! Seviye ${level} hedeflerine ulaştın.`
                : `Seviye ${level} hedefine ulaşmak için biraz daha gayret etmelisin.`}
            </p>
          </div>

          {/* Score Stats */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 mb-6">
            <div className="flex flex-col justify-center">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Puanın</span>
              <span className="text-2xl font-black text-rose-300 mt-1">{score}</span>
              <span className="text-[10px] text-white/60 font-medium">Hedef: {targetScore}</span>
            </div>
            
            <div className="flex flex-col justify-center border-l border-white/10">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">En Yüksek</span>
              <span className="text-2xl font-black text-amber-300 mt-1">{Math.max(highScore, score)}</span>
              {isNewHighScore && (
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider animate-pulse">
                  YENİ REKOR! 🎉
                </span>
              )}
            </div>
          </div>

          {/* Core Star indicators */}
          {isPassed && (
            <div className="flex items-center justify-center gap-2 mb-8 text-amber-300">
              <Star className="w-6 h-6 fill-amber-300" />
              <Star className={`w-8 h-8 fill-amber-300 ${score >= targetScore * 1.5 ? 'opacity-100' : 'opacity-30'}`} />
              <Star className={`w-6 h-6 fill-amber-300 ${score >= targetScore * 2 ? 'opacity-100' : 'opacity-30'}`} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isPassed ? (
              <motion.button
                id="modal-next-level-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNextLevel}
                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white rounded-full font-bold flex items-center justify-center gap-2 shadow-lg border border-white/20 cursor-pointer text-lg"
              >
                Sonraki Seviye <ArrowRight className="w-5 h-5 animate-slide" />
              </motion.button>
            ) : (
              <motion.button
                id="modal-retry-failed-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="w-full py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 text-white rounded-full font-bold flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
              >
                Yeniden Dene <RefreshCw className="w-4 h-4" />
              </motion.button>
            )}

            {isPassed && (
              <motion.button
                id="modal-replay-level-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="w-full py-3.5 backdrop-blur-md bg-white/5 hover:bg-white/10 text-white/75 hover:text-white rounded-full font-bold flex items-center justify-center gap-2 border border-white/10 cursor-pointer text-sm"
              >
                Seviyeyi Yeniden Oyna
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
