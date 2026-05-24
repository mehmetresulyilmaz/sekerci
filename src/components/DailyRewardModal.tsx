/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Zap, Sparkles, Check, Flame, X, Hammer } from 'lucide-react';
import { getCookie, setCookie, DailyReward, BoosterState } from '../types';
import { sounds } from '../utils/audio';

const REWARDS: DailyReward[] = [
  { day: 1, rewardType: 'moves', amount: 5, label: '+5 Hamle', icon: 'Sparkles' },
  { day: 2, rewardType: 'stripe', amount: 1, label: '1x Çizgili Şeker', icon: 'Hammer' },
  { day: 3, rewardType: 'color_bomb', amount: 1, label: '1x Renk Bombası', icon: 'Zap' },
  { day: 4, rewardType: 'moves', amount: 8, label: '+8 Hamle', icon: 'Sparkles' },
  { day: 5, rewardType: 'stripe', amount: 2, label: '2x Çizgili Şeker', icon: 'Hammer' },
  { day: 6, rewardType: 'color_bomb', amount: 2, label: '2x Renk Bombası', icon: 'Zap' },
  { day: 7, rewardType: 'score_boost', amount: 3, label: 'Efsane Sandık', icon: 'Gift' }
];

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (reward: DailyReward) => void;
}

export default function DailyRewardModal({ isOpen, onClose, onRewardClaimed }: DailyRewardModalProps) {
  const [streak, setStreak] = useState<number>(0);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [animationClaimed, setAnimationClaimed] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const lastClaimStr = getCookie('candy_last_claim');
    const streakStr = getCookie('candy_claim_streak');
    
    let currentStreak = streakStr ? parseInt(streakStr, 10) : 0;
    if (isNaN(currentStreak) || currentStreak < 0 || currentStreak >= 7) {
      currentStreak = 0;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!lastClaimStr) {
      // First time claiming
      setStreak(0);
      setCanClaim(true);
    } else {
      const lastClaimDate = new Date(lastClaimStr);
      const diffTime = Math.abs(now.getTime() - lastClaimDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (lastClaimStr === todayStr) {
        // Already claimed today
        setStreak(currentStreak);
        setCanClaim(false);
      } else if (diffDays <= 2.2) {
        // Consecutively claiming
        setStreak(currentStreak);
        setCanClaim(true);
      } else {
        // Streak broken
        setStreak(0);
        setCanClaim(true);
      }
    }
  }, [isOpen]);

  const handleClaim = () => {
    if (!canClaim) return;

    sounds.playClaim();
    
    // Increment streak
    const nextStreak = (streak % 7) + 1;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    setCookie('candy_last_claim', todayStr, 365);
    setCookie('candy_claim_streak', nextStreak.toString(), 365);

    const activeReward = REWARDS[streak]; // streak index is 0-based for Day 1 to 7
    onRewardClaimed(activeReward);

    setStreak(nextStreak);
    setCanClaim(false);
    setAnimationClaimed(true);

    setTimeout(() => {
      setAnimationClaimed(false);
      onClose();
    }, 2000);
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'moves':
        return <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />;
      case 'stripe':
        return <Hammer className="w-8 h-8 text-pink-500 animate-bounce" />;
      case 'color_bomb':
        return <Zap className="w-8 h-8 text-cyan-500 animate-pulse" />;
      default:
        return <Gift className="w-8 h-8 text-rose-500 animate-pulse" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="reward-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e0534]/60 backdrop-blur-md"
      >
        <motion.div
          id="reward-card-container"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[32px] backdrop-blur-2xl bg-[#3b0764]/40 border border-white/25 text-white shadow-2xl p-6 md:p-8"
        >
          {/* Glowing backlights */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            id="reward-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4" /> Günlük Ödül Serisi
            </div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-300 via-amber-200 to-rose-300 bg-clip-text text-transparent">
              Tatlı Sürprizler Seni Bekliyor!
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Her gün giriş yap, oyunda güçlendirici hamleler ve özel şekerler kazan!
            </p>
          </div>

          {/* Main Grid for Days */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {REWARDS.map((rew) => {
              const isClaimedIdx = rew.day <= streak;
              const isCurrentToClaim = rew.day === (streak + 1) && canClaim;
              const isFuture = rew.day > (streak + (canClaim ? 1 : 0));

              let borderClass = 'border-white/10 bg-white/5';
              let textTitleColor = 'text-white/80';
              let overlayGlow = null;

              if (isClaimedIdx) {
                borderClass = 'border-rose-400/50 bg-rose-500/20';
                textTitleColor = 'text-rose-200';
              } else if (isCurrentToClaim) {
                borderClass = 'border-amber-300 bg-white/20 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/25';
                textTitleColor = 'text-amber-200';
                overlayGlow = (
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent animate-pulse rounded-2xl pointer-events-none" />
                );
              }

              return (
                <div
                  key={rew.day}
                  className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${borderClass} ${
                    rew.day === 7 ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-white/10 via-rose-500/20 to-amber-500/20' : ''
                  }`}
                >
                  {overlayGlow}

                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    Gün {rew.day}
                  </span>

                  <div className="my-3 flex items-center justify-center h-14">
                    {isClaimedIdx ? (
                      <div className="w-10 h-10 rounded-full bg-rose-500/25 flex items-center justify-center text-rose-300 border border-white/20">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    ) : (
                      getRewardIcon(rew.rewardType)
                    )}
                  </div>

                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-bold text-center ${textTitleColor}`}>
                      {rew.label}
                    </span>
                    {isCurrentToClaim && (
                      <span className="text-[10px] font-semibold text-amber-300 uppercase mt-0.5 tracking-wider animate-bounce">
                        Şimdi Al!
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action section */}
          <div className="flex flex-col items-center gap-3">
            {canClaim ? (
              <motion.button
                id="claim-reward-action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaim}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full font-bold text-white shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-shadow flex items-center justify-center gap-2 cursor-pointer text-lg"
              >
                <Gift className="w-6 h-6 animate-pulse" /> Günlük Ödülümü Al!
              </motion.button>
            ) : (
              <div className="text-center">
                <p className="text-sm text-neutral-400 font-medium">
                  {streak >= 7 && !canClaim 
                    ? "Tebrikler! 7 günlük seriyi başarıyla tamamladın! 🎉"
                    : "Bugünlük ödülünü kaptın!"}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Sıradaki lezzetli şekerler yarın tam seninle olacak! 🍬
                </p>
              </div>
            )}
          </div>

          {/* Animation fireworks feedback for winning */}
          <AnimatePresence>
            {animationClaimed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center z-10 p-6 text-center"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-pink-500 rounded-full blur-2xl animate-pulse" />
                  <Gift className="w-20 h-20 text-rose-400 relative z-10 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                  Enfes Hediyen Eklendi!!
                </h3>
                <p className="text-sm text-neutral-300 max-w-sm mt-2">
                  Güçlendiriciler başarıyla şeker kavanozuna eklendi. Şimdi patlatma zamanı!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
