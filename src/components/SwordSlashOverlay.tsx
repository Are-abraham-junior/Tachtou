import React, { useEffect } from 'react';
import { playSwordSlashSound, speakCongratulations } from '../utils/audioUtils';
import { Swords, Sparkles } from 'lucide-react';

interface SwordSlashOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  heroName?: string;
  title?: string;
  userName?: string;
  voiceEnabled?: boolean;
  xpReward?: number;
  onFinished?: () => void;
}

export const SwordSlashOverlay: React.FC<SwordSlashOverlayProps> = ({
  isOpen,
  onClose,
  taskTitle,
  heroName,
  title,
  userName,
  voiceEnabled = true,
  xpReward = 50,
  onFinished,
}) => {
  const actualHeroName = heroName || userName || 'Junior';
  const actualTitle = title || '';
  const fullSalutation = actualTitle ? `${actualTitle} ${actualHeroName}` : actualHeroName;

  useEffect(() => {
    if (!isOpen) return;

    // Play sword sound immediately
    playSwordSlashSound();

    // Trigger congratulations speech
    const speechTimer = setTimeout(() => {
      speakCongratulations(actualHeroName, actualTitle, voiceEnabled);
    }, 200);

    // Close overlay after animation finishes (1.2s)
    const closeTimer = setTimeout(() => {
      if (onFinished) {
        onFinished();
      }
      onClose();
    }, 1300);

    return () => {
      clearTimeout(speechTimer);
      clearTimeout(closeTimer);
    };
  }, [isOpen, actualHeroName, actualTitle, onClose, onFinished]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden bg-slate-900/40 backdrop-blur-[2px] animate-fade-in">
      {/* Blade Slash 1 (Diagonal Left-to-Right) */}
      <div className="absolute w-[180%] h-4 bg-gradient-to-r from-transparent via-cyan-300 to-white shadow-[0_0_25px_#38bdf8] animate-slash-1 rounded-full" />

      {/* Blade Slash 2 (Diagonal Right-to-Left) */}
      <div className="absolute w-[180%] h-3 bg-gradient-to-r from-transparent via-amber-300 to-white shadow-[0_0_25px_#fbbf24] animate-slash-2 rounded-full" />

      {/* Central Sparkle Flash Burst */}
      <div className="relative flex flex-col items-center justify-center animate-spark text-center px-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 flex items-center justify-center shadow-[0_0_40px_#f59e0b] border-4 border-white mb-3">
          <Swords className="w-12 h-12 text-slate-950 animate-bounce" />
        </div>

        <div className="bg-slate-900/90 text-white border-4 border-amber-400 p-4 rounded-2xl shadow-[6px_6px_0px_#000] max-w-md">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 font-pixel text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>COUP D'ÉPÉE MORTEL !</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <p className="text-sm font-bold text-slate-100 truncate mb-1">
            "{taskTitle}"
          </p>

          <div className="text-xs text-emerald-400 font-pixel font-bold mt-2">
            + {xpReward} XP GAGNÉS !
          </div>

          <div className="text-[11px] text-slate-300 italic mt-1">
            "Félicitations {fullSalutation} !"
          </div>
        </div>
      </div>
    </div>
  );
};
