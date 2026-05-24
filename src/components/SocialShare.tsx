/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Send, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SocialShareProps {
  score: number;
  level: number;
}

export default function SocialShare({ score, level }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    return `🍬 Şeker Eşleştirme Oyununda Seviye ${level}'e ulaştım ve tam ${score} puan topladım! Bakalım sen benim rekorumu geçebilir misin? 🍭✨ #CandyCrush`;
  };

  const getShareUrl = () => {
    // Falls back to development or shared application URL if available, or current location
    return window.location.href;
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp' | 'telegram') => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getShareUrl());
    
    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
    }
    
    window.open(shareLink, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    const shareTextWithUrl = `${getShareText()} Oyna: ${getShareUrl()}`;
    navigator.clipboard.writeText(shareTextWithUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback
    });
  };

  return (
    <div 
      id="social-share-container"
      className="p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 w-full shadow-lg"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-rose-500/20 rounded-xl border border-white/20 text-rose-300 shrink-0">
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">Başarını Sevdiklerinle Paylaş!</h4>
          <p className="text-[10.5px] sm:text-xs text-white/70">Arkadaşlarına tatlı bir meydan oku.</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
        {/* WhatsApp */}
        <motion.button
          id="share-whatsapp"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleShare('whatsapp')}
          className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-white/10 rounded-lg transition-all cursor-pointer"
          title="WhatsApp'ta Paylaş"
        >
          <MessageCircle className="w-4 h-4 xl:w-5 xl:h-5 fill-emerald-400/10" />
        </motion.button>

        {/* Twitter */}
        <motion.button
          id="share-twitter"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleShare('twitter')}
          className="p-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-white/10 rounded-lg transition-all cursor-pointer"
          title="Twitter / X'te Paylaş"
        >
          <Twitter className="w-4 h-4 xl:w-5 xl:h-5 fill-sky-400/10" />
        </motion.button>

        {/* Facebook */}
        <motion.button
          id="share-facebook"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleShare('facebook')}
          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-white/10 rounded-lg transition-all cursor-pointer"
          title="Facebook'ta Paylaş"
        >
          <Facebook className="w-4 h-4 xl:w-5 xl:h-5 fill-blue-400/10" />
        </motion.button>

        {/* Telegram */}
        <motion.button
          id="share-telegram"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleShare('telegram')}
          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-white/10 rounded-lg transition-all cursor-pointer"
          title="Telegram'da Paylaş"
        >
          <Send className="w-4 h-4 xl:w-5 xl:h-5" />
        </motion.button>

        {/* Copy Link */}
        <motion.button
          id="share-copy"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyLink}
          className={`flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
            copied 
              ? 'bg-gradient-to-r from-rose-400 to-pink-500 border-white/30 text-white shadow-md' 
              : 'backdrop-blur-md bg-white/10 hover:bg-white/20 border-white/20 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" /> Kopyalandı!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Kopyala
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
