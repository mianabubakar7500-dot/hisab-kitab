import React, { useState, useEffect } from 'react';
import { HKIcon } from './HKIcon';
import { Sparkles } from 'lucide-react';

interface OpeningSplashProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export const OpeningSplash: React.FC<OpeningSplashProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'mount' | 'appear' | 'reveal' | 'ready' | 'exit'>('mount');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Logo appears smoothly with subtle scale & fade
    const t0 = setTimeout(() => {
      setPhase('appear');
    }, 60);

    // 2. Branding text appears naturally
    const t1 = setTimeout(() => {
      setPhase('reveal');
    }, 380);

    // 3. Fast progress bar increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + 25);
      });
    }, 80);

    // 4. Ready state
    const t2 = setTimeout(() => {
      setPhase('ready');
    }, 950);

    // 5. Smooth fade out transition to Home screen
    const t3 = setTimeout(() => {
      setPhase('exit');
    }, 1300);

    const t4 = setTimeout(() => {
      onComplete();
    }, 1650);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearInterval(interval);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden transition-all duration-400 ease-out cursor-pointer ${
        phase === 'exit'
          ? 'opacity-0 scale-102 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Ambient Emerald Background Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.18),rgba(6,78,59,0.08),rgba(2,44,34,0))] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/12 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-sm w-full text-center">
        {/* Animated Icon Container */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Subtle Emerald Glow Aura */}
          <div
            className={`absolute -inset-6 rounded-[56px] bg-emerald-500/20 blur-2xl transition-all duration-700 ${
              phase === 'appear' || phase === 'reveal' || phase === 'ready'
                ? 'scale-110 opacity-70'
                : 'scale-75 opacity-0'
            }`}
          />

          {/* Icon with Subtle, Stable Scale & Fade (Not Flashy) */}
          <div
            className={`relative transition-all duration-500 ease-out transform ${
              phase === 'mount'
                ? 'scale-85 opacity-0 translate-y-3'
                : 'scale-100 opacity-100 translate-y-0'
            }`}
          >
            <HKIcon size={112} className="drop-shadow-[0_16px_30px_rgba(5,150,105,0.4)]" />

            {/* Subtle light sweep over the book */}
            <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>

        {/* Hisab Kitab Branding Appears Naturally */}
        <div
          className={`space-y-1 transition-all duration-500 transform ${
            phase === 'mount' || phase === 'appear'
              ? 'translate-y-3 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Digital Accounting</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              HISAB
            </span>
            <span className="text-slate-100">KITAB</span>
          </h1>

          <p className="text-xs text-emerald-300/80 font-medium">
            Smart Billing & Accounting Made Simple
          </p>
        </div>

        {/* Subtle Minimalist Loading Bar */}
        <div
          className={`w-48 mt-6 transition-all duration-400 ${
            phase === 'mount' || phase === 'appear' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-emerald-500/20">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
