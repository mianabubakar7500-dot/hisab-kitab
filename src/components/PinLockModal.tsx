import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export const PinLockModal: React.FC = () => {
  const { isAppLocked, unlockWithPin, profile } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isAppLocked) return null;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;
    const success = unlockWithPin(pin);
    if (!success) {
      setError(true);
      setPin('');
    } else {
      setError(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const next = pin + num;
      setPin(next);
      setError(false);
      if (profile.appLockPin && next.length === profile.appLockPin.length) {
        if (!unlockWithPin(next)) {
          setError(true);
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 text-center border border-slate-200 dark:border-slate-700">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
          <Lock className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {profile.name || 'HISAB KITAB'}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your 4-6 digit PIN to access your business books
        </p>

        {/* PIN Indicators */}
        <div className="my-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'border-sky-600 bg-sky-600 dark:border-sky-400 dark:bg-sky-400 scale-110'
                  : 'border-slate-300 dark:border-slate-600 bg-transparent'
              } ${error ? 'border-red-500 bg-red-500 animate-shake' : ''}`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>Incorrect PIN. Please try again.</span>
          </div>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-800 hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-800 hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleUnlock()}
            disabled={!pin}
            className="h-12 rounded-xl bg-sky-600 text-white font-semibold flex items-center justify-center hover:bg-sky-700 disabled:opacity-50 active:scale-95 transition-all"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          Default Demo PIN: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">1234</span>
        </p>
      </div>
    </div>
  );
};
