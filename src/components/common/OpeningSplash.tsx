import React, { useState, useEffect } from 'react';
import { HKIcon } from './HKIcon';
import { Sparkles, ArrowRight } from 'lucide-react';

interface OpeningSplashProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export const OpeningSplash: React.FC<OpeningSplashProps> = ({ onComplete, forceShow = false }) => {
  const [phase, setPhase] = useState<'intro' | 'active' | 'ready' | 'exit'>('intro');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Books...');

  useEffect(() => {
    // Phase 1: Mount & start icon scale
    const t0 = setTimeout(() => {
      setPhase('active');
    }, 80);

    // Progress animation synced with icon reveal
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 14) + 8;
        return next > 100 ? 100 : next;
      });
    }, 110);

    const t1 = setTimeout(() => {
      setStatusText('Loading Customer Khata & Stock...');
    }, 600);

    const t2 = setTimeout(() => {
      setStatusText('Syncing PDF Engine...');
    }, 1100);

    const t3 = setTimeout(() => {
      setStatusText('Welcome to Hisab Kitab');
      setPhase('ready');
    }, 1600);

    // Phase 3: Smooth exit transition
    const t4 = setTimeout(() => {
      setPhase('exit');
    }, 1950);

    const t5 = setTimeout(() => {
      onComplete();
    }, 2350);

    return () => {
      clearTimeout(t0);
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white transition-all duration-500 select-none overflow-hidden ${
        phase === 'exit'
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Radial Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(16,185,129,0.18),rgba(15,23,42,0.95))]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Gold Light Particle Ring */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Pulsing Wave */}
          <div
            className={`absolute -inset-4 rounded-[40px] bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 blur-xl transition-all duration-1000 ${
              phase === 'active' || phase === 'ready'
                ? 'scale-110 opacity-70 animate-pulse'
                : 'scale-90 opacity-0'
            }`}
          />

          {/* Shimmer sweep effect */}
          <div className="relative group">
            <HKIcon
              size={130}
              className={`transition-all duration-700 ease-out transform ${
                phase === 'intro'
                  ? 'scale-70 opacity-0 rotate-[-4deg]'
                  : phase === 'active'
                  ? 'scale-100 opacity-100 rotate-0'
                  : 'scale-105 opacity-100'
              }`}
            />

            {/* Glowing Sweep Highlight */}
            <div
              className={`absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none transition-opacity duration-500 ${
                phase === 'active' || phase === 'ready' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>

        {/* Brand Text Reveal - Synced with Icon */}
        <div
          className={`mt-6 text-center transition-all duration-700 delay-150 transform ${
            phase === 'intro'
              ? 'translate-y-4 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 font-sans">
              HISAB KITAB
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-emerald-400/90">
            Smart Billing & Accounting
          </p>
        </div>

        {/* Dynamic Progress Bar & Status Text */}
        <div
          className={`mt-8 w-64 flex flex-col items-center gap-2 transition-all duration-500 delay-300 ${
            phase === 'intro' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div className="w-full h-1.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/60 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="w-full flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5 truncate">
              {phase === 'ready' ? (
                <Sparkles className="h-3 w-3 text-amber-300 animate-spin" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
              <span className="text-slate-300">{statusText}</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Subtle Skip Button */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold backdrop-blur-md border border-slate-700/60 transition-all cursor-pointer"
      >
        <span>Skip</span>
        <ArrowRight className="h-3 w-3" />
      </button>

      {/* Bottom Version Branding */}
      <div className="absolute bottom-6 left-6 text-[10px] text-slate-500 font-mono tracking-wider">
        v2.5 • Offline Ready
      </div>
    </div>
  );
};
