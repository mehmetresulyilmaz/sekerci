/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  Play, 
  HelpCircle, 
  Compass, 
  Gift, 
  Flame, 
  Volume2, 
  VolumeX, 
  Facebook, 
  Twitter, 
  RotateCcw,
  Calendar,
  Zap,
  Hammer,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import { getCookie, setCookie, GameStats, BoosterState, DailyReward, LEVELS, DailyQuest } from './types';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import DailyRewardModal from './components/DailyRewardModal';
import GameOverModal from './components/GameOverModal';
import SocialShare from './components/SocialShare';
import { sounds } from './utils/audio';

function getLevelConfig(lvl: number) {
  const cfg = LEVELS.find(l => l.id === lvl);
  if (cfg) {
    return { target: cfg.target, moves: cfg.moves };
  }
  return {
    target: lvl * 1500,
    moves: Math.max(15, 25 - Math.floor(lvl / 2))
  };
}

const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: 'quest_score',
    title: 'Skor Şampiyonu',
    description: 'Herhangi bir oyunda tek seferde 5.000 skora ulaş!',
    targetValue: 5000,
    currentValue: 0,
    rewardType: 'stripe',
    rewardAmount: 1,
    rewardLabel: '1 Satır Çekici',
    isClaimed: false
  },
  {
    id: 'quest_moves',
    title: 'Hamle Tasarrufu',
    description: 'Seviyelerden birini en az 8 hamle kala tamamla!',
    targetValue: 8,
    currentValue: 0,
    rewardType: 'color_bomb',
    rewardAmount: 1,
    rewardLabel: '1 Renk Bombası',
    isClaimed: false
  },
  {
    id: 'quest_color_comb',
    title: 'Eşleştirme Ustası',
    description: 'Toplamda 200 adet şekeri patlat!',
    targetValue: 200,
    currentValue: 0,
    rewardType: 'score_boost',
    rewardAmount: 500,
    rewardLabel: '500 Puan Rekor Ödülü',
    isClaimed: false
  }
];

export default function App() {
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    movesLeft: 30,
    targetScore: 1200,
    level: 1,
    combos: 0,
  });

  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(DEFAULT_QUESTS);

  // Cookied boosters state
  const [boosters, setBoosters] = useState<BoosterState>({
    extraMovesCount: 0,
    stripeHammerCount: 3, // Start with 3 helper hammers
    colorBombCount: 1,    // Start with 1 color bomb helper
  });

  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [lastMatchPassed, setLastMatchPassed] = useState(false);
  const [dailyClaimBadge, setDailyClaimBadge] = useState(false);
  const [activeTab, setActiveTab] = useState<'levels' | 'quests'>('levels');
  const [showInstructions, setShowInstructions] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);

  // Helper to save quests to cookie
  const saveQuests = (quests: DailyQuest[]) => {
    setDailyQuests(quests);
    setCookie('candy_daily_quests_v2', JSON.stringify(quests), 365);
  };

  // Initialize cookies states
  useEffect(() => {
    // High Score Cookie load
    const cookieHighScore = getCookie('candy_high_score');
    const loadedHigh = cookieHighScore ? parseInt(cookieHighScore, 10) : 0;

    setStats(prev => ({
      ...prev,
      highScore: isNaN(loadedHigh) ? 0 : loadedHigh,
    }));

    // Unlocked level loads
    const cookieUnlocked = getCookie('candy_unlocked_level');
    const loadedUnlocked = cookieUnlocked ? parseInt(cookieUnlocked, 10) : 1;
    setUnlockedLevel(isNaN(loadedUnlocked) ? 1 : loadedUnlocked);

    // Booster Cookie loads or set defaults
    const hCount = getCookie('candy_stripe_hammers');
    const bCount = getCookie('candy_color_bombs');

    setBoosters({
      extraMovesCount: 0,
      stripeHammerCount: hCount ? parseInt(hCount, 10) : 3,
      colorBombCount: bCount ? parseInt(bCount, 10) : 2,
    });

    // Load custom daily quests state
    const questCookie = getCookie('candy_daily_quests_v2');
    if (questCookie) {
      try {
        const parsed = JSON.parse(questCookie);
        if (Array.isArray(parsed) && parsed.length === 3) {
          setDailyQuests(parsed);
        }
      } catch (err) {
        // use default quests
      }
    }

    // Check if daily reward is currently available
    const lastClaimStr = getCookie('candy_last_claim');
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastClaimStr !== todayStr) {
      setDailyClaimBadge(true);
    }
  }, []);

  const startNewGame = (chosenLevel: number = 1) => {
    sounds.playSelect();
    const config = getLevelConfig(chosenLevel);

    setStats(prev => ({
      ...prev,
      score: 0,
      level: chosenLevel,
      movesLeft: config.moves,
      targetScore: config.target,
    }));

    setScreen('game');
    setIsGameOverOpen(false);
  };

  const handleStatsChange = (newStats: GameStats, candiesMatchedThisTurn: number = 0) => {
    setStats(newStats);

    // Update quest values dynamically
    let needsSave = false;
    const nextQuests = dailyQuests.map(q => {
      if (q.id === 'quest_score' && newStats.score > q.currentValue) {
        needsSave = true;
        return { ...q, currentValue: Math.min(q.targetValue, newStats.score) };
      }
      if (q.id === 'quest_color_comb' && candiesMatchedThisTurn > 0) {
        needsSave = true;
        const updatedVal = q.currentValue + candiesMatchedThisTurn;
        return { ...q, currentValue: Math.min(q.targetValue, updatedVal) };
      }
      return q;
    });

    if (needsSave) {
      saveQuests(nextQuests);
    }

    // Save persistent high score to cookie if surpassed
    if (newStats.score > stats.highScore) {
      setCookie('candy_high_score', newStats.score.toString(), 365);
      setStats(prev => ({ ...prev, highScore: newStats.score }));
    }
  };

  const handleUseBooster = (type: 'stripe' | 'color_bomb') => {
    if (type === 'stripe' && boosters.stripeHammerCount > 0) {
      const nextCount = boosters.stripeHammerCount - 1;
      setBoosters(prev => ({ ...prev, stripeHammerCount: nextCount }));
      setCookie('candy_stripe_hammers', nextCount.toString(), 365);
    } else if (type === 'color_bomb' && boosters.colorBombCount > 0) {
      const nextCount = boosters.colorBombCount - 1;
      setBoosters(prev => ({ ...prev, colorBombCount: nextCount }));
      setCookie('candy_color_bombs', nextCount.toString(), 365);
    }
  };

  const handleRewardClaimed = (claimed: DailyReward) => {
    // Add rewards to active count
    setBoosters(prev => {
      let nextStripe = prev.stripeHammerCount;
      let nextColor = prev.colorBombCount;
      let addedMoves = 0;

      if (claimed.rewardType === 'stripe') {
        nextStripe += claimed.amount;
        setCookie('candy_stripe_hammers', nextStripe.toString(), 365);
      } else if (claimed.rewardType === 'color_bomb') {
        nextColor += claimed.amount;
        setCookie('candy_color_bombs', nextColor.toString(), 365);
      } else if (claimed.rewardType === 'moves') {
        // Boosts moves inside the active/next gameplay configuration
        addedMoves = claimed.amount;
      } else if (claimed.rewardType === 'score_boost') {
        // Mega chest gives massive bundle
        nextStripe += 2;
        nextColor += 2;
        setCookie('candy_stripe_hammers', nextStripe.toString(), 365);
        setCookie('candy_color_bombs', nextColor.toString(), 365);
      }

      // If active in a game, append extra moves immediately
      if (screen === 'game' && addedMoves > 0) {
        setStats(s => ({ ...s, movesLeft: s.movesLeft + addedMoves }));
      }

      return {
        ...prev,
        stripeHammerCount: nextStripe,
        colorBombCount: nextColor,
      };
    });

    setDailyClaimBadge(false);
  };

  const handleGameOver = (finalScore: number, passed: boolean) => {
    setLastMatchPassed(passed);
    setIsGameOverOpen(true);

    if (passed) {
      // Unlock next level
      const nextLevel = stats.level + 1;
      if (nextLevel > unlockedLevel) {
        setUnlockedLevel(nextLevel);
        setCookie('candy_unlocked_level', nextLevel.toString(), 365);
      }

      const remainingMoves = stats.movesLeft;
      const updated = dailyQuests.map(q => {
        if (q.id === 'quest_moves') {
          const val = Math.max(q.currentValue, remainingMoves);
          return { ...q, currentValue: Math.min(q.targetValue, val) };
        }
        return q;
      });
      saveQuests(updated);
    }
  };

  const claimQuestReward = (questId: string) => {
    sounds.playSpecialActivate?.();
    const updated = dailyQuests.map(q => {
      if (q.id === questId) {
        return { ...q, isClaimed: true };
      }
      return q;
    });
    saveQuests(updated);

    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest) return;

    setBoosters(prev => {
      let nextStripe = prev.stripeHammerCount;
      let nextColor = prev.colorBombCount;

      if (quest.rewardType === 'stripe') {
        nextStripe += quest.rewardAmount;
        setCookie('candy_stripe_hammers', nextStripe.toString(), 365);
      } else if (quest.rewardType === 'color_bomb') {
        nextColor += quest.rewardAmount;
        setCookie('candy_color_bombs', nextColor.toString(), 365);
      } else if (quest.rewardType === 'score_boost') {
        const nextScore = stats.highScore + quest.rewardAmount;
        setCookie('candy_high_score', nextScore.toString(), 365);
        setStats(s => ({ ...s, highScore: nextScore }));
      }

      return {
        ...prev,
        stripeHammerCount: nextStripe,
        colorBombCount: nextColor
      };
    });
  };

  const advanceLevel = () => {
    const nextLvl = stats.level + 1;
    startNewGame(nextLvl);
  };

  const retryLevel = () => {
    startNewGame(stats.level);
  };

  return (
    <div 
      id="app-theme-wrapper"
      className="min-h-screen w-full relative bg-gradient-to-tr from-[#3b0764] via-[#701a75] to-[#db2777] text-white font-sans flex flex-col items-center justify-between px-3 py-2.5 sm:p-5 pb-10 selection:bg-white/30 selection:text-white overflow-x-hidden"
    >
      {/* Background radial spotlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Screen Layout Wrapper */}
      <div id="content-body" className="relative z-10 w-full max-w-4xl flex-1 flex flex-col items-center justify-start md:justify-center my-1 sm:my-4">
        
        {/* Main Logo & Title Row */}
        <header id="app-main-header" className="w-full flex items-center justify-between mb-3.5 sm:mb-6 px-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-white/10 flex items-center justify-center">
              <div className="w-full h-full backdrop-blur-md bg-white/20 rounded-[10px] sm:rounded-[14px] flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-pink-100 to-amber-200 bg-clip-text text-transparent leading-none">
                TATLI ŞEKERLER
              </h1>
              <p className="text-[9px] md:text-xs text-white/70 font-semibold tracking-wider uppercase mt-0.5">
                ŞEKER EŞLEŞTİRME KRALLIĞI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Daily Chest Button Indicator */}
            <motion.button
              id="header-daily-reward-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRewardOpen(true)}
              className="relative p-2.5 sm:p-3 backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 rounded-xl sm:rounded-2xl transition-all cursor-pointer text-amber-300 shadow-lg"
              title="Günlük Ödüller"
            >
              <Gift className="w-4.5 h-4.5 sm:w-5 sm:h-5 animate-bounce" />
              {dailyClaimBadge && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </motion.button>

            {screen === 'game' && (
              <motion.button
                id="header-quit-menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setScreen('home')}
                className="px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-lg"
              >
                Ana Menü
              </motion.button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* SCREEN: HOME */}
          {screen === 'home' && (
            <motion.div
              id="home-landing-screen"
              key="home-screen"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full max-w-lg flex flex-col gap-4"
            >
              {/* Compact Promotional Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 p-5 text-center shadow-xl">
                {/* Glowing decorations inside hero */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                
                <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-neutral-100 to-rose-200 bg-clip-text text-transparent uppercase mb-1">
                  Tatlı Eşleştirmeler
                </h2>
                
                <p className="text-white/80 text-xs max-w-sm mx-auto leading-relaxed">
                  Şekerleri patlat, engelleri aş ve günlük görevleri tamamlayarak en yüksek skora ulaş!
                </p>

                {/* Score cookie indicator */}
                <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-2xl shadow-md">
                  <Trophy className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span className="text-[11px] text-white/90 font-bold">
                    En Yüksek Skorun: <span className="text-amber-300 font-extrabold">{stats.highScore}</span>
                  </span>
                </div>
              </div>

              {/* Collapsible Instructions Panel */}
              <div className="rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden shadow-lg transition-all duration-300">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-extrabold text-white/95 uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-cyan-300" /> Nasıl Oynanır?
                  </span>
                  <span className="text-cyan-300/80 text-[10px] font-bold flex items-center gap-1">
                    {showInstructions ? 'Gizle' : 'Göster'}
                    {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </button>
                
                {showInstructions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4 border-t border-white/5"
                  >
                    <ul className="text-xs text-white/85 flex flex-col gap-2 list-disc pl-4 leading-relaxed mt-3">
                      <li>Şekerleri kaydırmak veya değiştirmek için <strong>iki ardışık şekere tıkla</strong> veya şekerleri <strong>fareyle/parmağınla kaydır</strong>.</li>
                      <li><strong>4'lü Eşleşme:</strong> Sıra veya sütun patlatan <span className="text-pink-300 font-bold">Çizgili Özel Şeker</span> kazandırır.</li>
                      <li><strong>5'li Eşleşme:</strong> Eşsiz bir <span className="text-amber-300 font-bold">Renk Bombası</span> yaratır! Herhangi bir renkle eşleştirerek o renkteki tüm şekerleri yok et.</li>
                      <li><strong>Sıkıştın mı?</strong> Ücretsiz Çekiç Smasher gücünü kullanarak dilediğin şekeri veya engeli hamle harcamadan kırabilirsin!</li>
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Play / Explore Tabs Switcher Control */}
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 gap-1 shadow-inner">
                <button
                  onClick={() => setActiveTab('levels')}
                  className={`flex-1 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'levels' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-white/60 hover:text-white/95 hover:bg-white/5'}`}
                >
                  🎯 Seviyeler (10 Bölüm)
                </button>
                <button
                  onClick={() => setActiveTab('quests')}
                  className={`flex-1 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'quests' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-white/60 hover:text-white/95 hover:bg-white/5'}`}
                >
                  🎁 Günlük Görevler
                  {dailyQuests.filter(q => q.currentValue >= q.targetValue && !q.isClaimed).length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block ml-0.5" />
                  )}
                </button>
              </div>

              {/* Dynamic tab rendering based on state */}
              <AnimatePresence mode="wait">
                {activeTab === 'levels' ? (
                  /* LEVEL SELECTION ARCHITECT */
                  <motion.div
                    key="tab-levels"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    id="levels-selection-box"
                    className="rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 p-4 flex flex-col gap-3 shadow-lg"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {LEVELS.map((lvl) => {
                        const isLocked = lvl.id > unlockedLevel;
                        return (
                          <motion.button
                            key={lvl.id}
                            id={`level-selector-btn-${lvl.id}`}
                            whileHover={isLocked ? {} : { scale: 1.05 }}
                            whileTap={isLocked ? {} : { scale: 0.95 }}
                            onClick={() => !isLocked && startNewGame(lvl.id)}
                            disabled={isLocked}
                            className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                              isLocked 
                                ? "bg-black/20 border-white/5 text-white/40 cursor-not-allowed" 
                                : "bg-white/10 hover:bg-white/15 hover:border-white/30 border-white/10 text-white/90 hover:text-white cursor-pointer"
                            }`}
                          >
                            <span className="text-[8px] font-black opacity-65 uppercase tracking-widest leading-none">
                              {isLocked ? "KİLİTLİ" : "SEVİYE"}
                            </span>
                            <span className="text-lg font-black mt-0.5 leading-none flex items-center justify-center gap-1">
                              {lvl.id}
                              {isLocked && <Lock className="w-3.5 h-3.5 text-white/45 animate-pulse" />}
                            </span>
                            <span className={`text-[8.5px] font-bold truncate w-full mt-1 px-1 ${
                              isLocked ? "text-white/30" : "text-pink-200"
                            }`}>
                              {isLocked ? "???" : lvl.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  /* DAILY QUESTS DASHBOARD */
                  <motion.div
                    key="tab-quests"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    id="daily-quests-box"
                    className="rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 p-4 flex flex-col gap-2.5 shadow-lg"
                  >
                    <div className="flex flex-col gap-2.5">
                      {dailyQuests.map((quest) => {
                        const isCompleted = quest.currentValue >= quest.targetValue;
                        const percent = Math.min(100, Math.round((quest.currentValue / quest.targetValue) * 105));
                        
                        return (
                          <div key={quest.id} id={`quest-row-${quest.id}`} className="p-2.5 bg-white/5 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex-1 flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-rose-300 leading-tight">{quest.title}</span>
                                {quest.isClaimed ? (
                                  <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">TAMAMLANDI</span>
                                ) : isCompleted ? (
                                  <span className="text-[8px] font-black uppercase text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">ÖDÜLÜ AL</span>
                                ) : null}
                              </div>
                              <span className="text-[10.5px] text-white/80 leading-snug">{quest.description}</span>
                              
                              {/* Progress bar */}
                              <div className="flex items-center gap-3 mt-1 shadow-sm">
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full border border-white/5 overflow-hidden">
                                  <div className="h-full bg-cyan-400 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                                </div>
                                <span className="text-[9.5px] font-bold text-cyan-300 font-mono">
                                  {quest.currentValue} / {quest.targetValue}
                                </span>
                              </div>
                            </div>

                            {/* Reward Claim Actions Button */}
                            <div className="flex items-center gap-2">
                              <div className="text-right sm:block hidden">
                                <span className="text-[8px] text-white/50 block font-bold uppercase leading-none">ÖDÜL:</span>
                                <span className="text-[9.5px] text-amber-300 font-black tracking-wide leading-none">{quest.rewardLabel}</span>
                              </div>
                              {quest.isClaimed ? (
                                <button disabled className="px-2.5 py-1.5 bg-neutral-700/50 border border-neutral-600/30 text-white/40 font-bold rounded-lg text-xs cursor-not-allowed">
                                  Alındı
                                </button>
                              ) : isCompleted ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => claimQuestReward(quest.id)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-300 text-neutral-900 font-black rounded-lg text-xs cursor-pointer shadow-lg hover:brightness-110 active:brightness-95 transition-all"
                                >
                                  Al
                                </motion.button>
                              ) : (
                                <button disabled className="px-2.5 py-1.5 bg-white/10 border border-white/5 text-white/50 font-bold rounded-lg text-[10.5px] cursor-not-allowed">
                                  {quest.rewardAmount} {quest.rewardType === 'stripe' ? 'Hamle' : quest.rewardType === 'color_bomb' ? 'Bomba' : 'Skor'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enter Button Action */}
              <div id="home-enter-play-button" className="flex flex-col gap-2.5 mt-1">
                <motion.button
                  id="start-match-direct-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startNewGame(Math.min(unlockedLevel, LEVELS.length))}
                  className="w-full py-4 bg-gradient-to-r from-pink-400 via-rose-500 to-amber-500 rounded-2xl font-black text-white text-lg uppercase tracking-tight shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <Play className="w-5 h-5 fill-white stroke-none" /> Hemen Oyna (Seviye {Math.min(unlockedLevel, LEVELS.length)})
                </motion.button>

                <div className="flex justify-center gap-4">
                  {stats.highScore > 0 && (
                    <button
                      id="reset-highscore-data"
                      onClick={() => {
                        if (confirm('En yüksek skor çerezini sıfırlamak istediğine emin misin?')) {
                          setCookie('candy_high_score', '0', 365);
                          setStats(prev => ({ ...prev, highScore: 0 }));
                        }
                      }}
                      className="text-white/50 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Rekoru Sıfırla
                    </button>
                  )}

                  {unlockedLevel > 1 && (
                    <button
                      id="reset-unlocked-levels"
                      onClick={() => {
                        if (confirm('Seviye ilerlemeni sıfırlamak ve tüm seviyeleri tekrar kilitlemek istediğine emin misin?')) {
                          setCookie('candy_unlocked_level', '1', 365);
                          setUnlockedLevel(1);
                        }
                      }}
                      className="text-white/50 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" /> Seviyeleri Sıfırla
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: LIVE GAMEPLAY */}
          {screen === 'game' && (
            <motion.div
              id="gameplay-arena-view"
              key="game-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl flex flex-col md:grid md:grid-cols-12 gap-3.5 md:gap-6"
            >
              {/* Side controls (Level details, Target, Score) */}
              <div className="md:col-span-4 flex flex-col gap-3 md:gap-4.5">
                <ScoreBoard stats={stats} />

                <div className="hidden md:flex flex-col gap-3 p-3.5 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-xs text-white/80 leading-normal shadow-xl">
                  <h4 className="font-bold text-white uppercase tracking-widest text-[9px]">Taktikler:</h4>
                  <div className="flex items-start gap-2">
                    <Zap className="col-span-1 w-3.5 h-3.5 text-cyan-300 mt-0.5 shrink-0" />
                    <span>Zincir reaksiyon patlamaları katlanarak çok daha fazla puan kazandırır.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Hammer className="col-span-1 w-3.5 h-3.5 text-pink-300 mt-0.5 shrink-0" />
                    <span>Alt çekiçlerden birini aktifleştirerek hamle hakkını koruyabilirsin.</span>
                  </div>
                </div>

                <div className="hidden md:block">
                  <SocialShare score={stats.score} level={stats.level} />
                </div>
              </div>

              {/* Center GameBoard play */}
              <div className="md:col-span-8 flex flex-col items-center">
                <GameBoard
                  level={stats.level}
                  stats={stats}
                  onStatsChange={handleStatsChange}
                  boosters={boosters}
                  onUseBooster={handleUseBooster}
                  onGameOver={handleGameOver}
                />
              </div>

              {/* Mobile share block */}
              <div className="block md:hidden mt-3">
                <SocialShare score={stats.score} level={stats.level} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* FOOTER */}
      <footer id="app-footer-brand" className="w-full text-center text-[10px] text-white/40 font-bold uppercase tracking-widest mt-8 py-4 border-t border-white/10 select-none">
        Şeker Eşleştirme Oyunu © 2026 • Şık Tasarım, Güçlü Oyun Deneyimi
      </footer>

      {/* DAILY REWARDS MODAL */}
      <DailyRewardModal
        isOpen={isRewardOpen}
        onClose={() => setIsRewardOpen(false)}
        onRewardClaimed={handleRewardClaimed}
      />

      {/* LEVEL COMPLETE STATE / GAMEOVER DIALOG */}
      <GameOverModal
        isOpen={isGameOverOpen}
        score={stats.score}
        highScore={stats.highScore}
        targetScore={stats.targetScore}
        level={stats.level}
        onRetry={retryLevel}
        onNextLevel={advanceLevel}
        isPassed={lastMatchPassed}
      />
    </div>
  );
}
