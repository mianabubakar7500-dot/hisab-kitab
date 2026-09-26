import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Code2,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { HKIcon } from './HKIcon';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'apk_guide' | 'pwa_install' | 'architecture'>('downloads');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on Android: Open in Google Chrome -> tap menu (⋮) -> tap "Install app" or "Add to Home Screen".');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const currentAppUrl = window.location.origin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-4 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-5 sm:px-8 py-4 dark:border-slate-800 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <HKIcon size={38} className="rounded-xl shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  HISAB KITAB Downloads & Build Hub
                </h2>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download full source code, Android APK/AAB bundle, and installation packages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 px-5 sm:px-8 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'downloads', label: '1-Click Downloads', icon: Download },
            { id: 'apk_guide', label: 'Build APK & AAB', icon: Smartphone },
            { id: 'pwa_install', label: 'Install on Android Phone', icon: Package },
            { id: 'architecture', label: 'Source Code Info', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white/70 dark:bg-slate-900/70 rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* TAB 1: 1-CLICK DOWNLOADS */}
          {activeTab === 'downloads' && (
            <div className="space-y-6">
              {/* Highlight: Direct Android APK Generator */}
              <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-100">
                      <Sparkles className="h-3 w-3" />
                      <span>Android APK Ready</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Download / Generate Android APK File
                    </h3>
                    <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
                      Apne Android phone mein install karne ke liye ya WhatsApp par kisi ko APK bhejne ke liye 1-click mein APK generate karein:
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <a
                      href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentAppUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Smartphone className="h-4 w-4 text-emerald-700" />
                      <span>Download .APK Now</span>
                      <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                    </a>
                    <button
                      onClick={handleInstallPWA}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-900 text-white border border-white/20 px-3.5 py-2.5 text-xs font-bold cursor-pointer transition-all"
                    >
                      <span>Install on Phone</span>
                    </button>
                  </div>
                </div>
                <div className="mt-3.5 pt-3 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-50">
                  <div>📱 <strong>Direct Install:</strong> Android phone Chrome mein 3 dots (⋮) &rarr; "Install app" dabayein.</div>
                  <div>⚡ <strong>.APK File:</strong> PWABuilder par "Package for Android" dabate hi .apk file download ho jayegi.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Complete Source Code ZIP */}
                <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 via-white to-slate-50 p-5 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-800/50 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
                      <Code2 className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Full App
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Complete Source Code (ZIP)
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Full clean repository containing React 19, TypeScript, Express backend, Tailwind CSS, Vite config, icons, assets, and Android Studio project.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">.ZIP Archive (~170 KB)</span>
                    <a
                      href="/downloads/hisab-kitab-source.zip"
                      download="hisab-kitab-pro-source.zip"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm cursor-pointer transition-all active:scale-95"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download ZIP</span>
                    </a>
                  </div>
                </div>

                {/* 2. Android Studio Project Bundle */}
                <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 p-5 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-800/50 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      APK & AAB Ready
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Android Studio Project (ZIP)
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Native Gradle project with AndroidManifest.xml, MainActivity.java, launcher icons, and build configs configured for instant APK and Play Store AAB generation.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">Ready for Gradle</span>
                    <a
                      href="/downloads/hisab-kitab-android.zip"
                      download="hisab-kitab-android-studio-project.zip"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm cursor-pointer transition-all active:scale-95"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Android Project</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Instant Install Card */}
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-800/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-600 text-white p-3 shadow-md">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Direct Install on Android Smartphone
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Install directly without compiling! Creates an official WebAPK on your phone with offline support.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleInstallPWA}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>{isInstallable ? 'Install App Now' : 'How to Install on Phone'}</span>
                </button>
              </div>

              {/* What is in the download */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Included in the Source Code Package
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Pure TypeScript & React 19 Frontend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Native Android Studio Gradle Setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Express 4 Backend with Gemini AI OCR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Offline PWA Manifest & Service Worker</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>jsPDF Invoice & Khata Ledger Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Clean WhatsApp Sharing (Strict PDF Only)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUILD APK & AAB GUIDE */}
          {activeTab === 'apk_guide' && (
            <div className="space-y-6">
              {/* Method A: Cloud 1-Click APK/AAB Builder */}
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-md bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                      Fastest Option (60 Seconds)
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                      Generate APK & AAB with PWABuilder
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Google & Microsoft recommend PWABuilder to instantly package progressive web apps into signed Android APK files and Google Play Store ready AAB bundles.
                    </p>
                  </div>
                  <a
                    href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentAppUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm cursor-pointer transition-all"
                  >
                    <span>Open PWABuilder</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300">
                  <strong>3 Simple Steps:</strong> 1. Click Open PWABuilder. 2. Click "Package for Stores" & choose Android. 3. Download your finished <strong>.apk</strong> (for direct phone install) or <strong>.aab</strong> (for Google Play Store)!
                </div>
              </div>

              {/* Method B: Local Build with Android Studio */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Build Locally with Android Studio & Gradle
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  After downloading and extracting the source code ZIP, run the following commands to generate your APK and AAB:
                </p>

                {/* Step 1 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>1. Build Web Assets & Copy to Android Folder:</span>
                    <button
                      onClick={() => copyToClipboard('npm run build\nmkdir -p android/app/src/main/assets\ncp -r dist/* android/app/src/main/assets/', 'step1')}
                      className="text-[11px] text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCmd === 'step1' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedCmd === 'step1' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto">
                    npm run build{'\n'}
                    mkdir -p android/app/src/main/assets{'\n'}
                    cp -r dist/* android/app/src/main/assets/
                  </pre>
                </div>

                {/* Step 2: Build APK */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>2. Generate Android APK (Direct Phone Installation):</span>
                    <button
                      onClick={() => copyToClipboard('cd android\n./gradlew assembleRelease', 'step2')}
                      className="text-[11px] text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCmd === 'step2' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedCmd === 'step2' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto">
                    cd android{'\n'}
                    ./gradlew assembleRelease{'\n'}
                    # Output: android/app/build/outputs/apk/release/app-release.apk
                  </pre>
                </div>

                {/* Step 3: Build AAB */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>3. Generate Android App Bundle (.aab for Google Play Store):</span>
                    <button
                      onClick={() => copyToClipboard('cd android\n./gradlew bundleRelease', 'step3')}
                      className="text-[11px] text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCmd === 'step3' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedCmd === 'step3' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto">
                    cd android{'\n'}
                    ./gradlew bundleRelease{'\n'}
                    # Output: android/app/build/outputs/bundle/release/app-release.aab
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSTALL ON ANDROID PHONE (PWA / WEBAPK) */}
          {activeTab === 'pwa_install' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-indigo-600" />
                  <span>How to Install on Any Android Phone in 10 Seconds</span>
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  HISAB KITAB has built-in WebAPK technology. When you install it through Chrome on Android, the operating system creates a genuine native app icon with standalone full-screen window and hardware acceleration.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
                  <div className="mx-auto w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-sm mb-3">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Open in Chrome</h4>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Open the shared app link on Google Chrome on your Android mobile device.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
                  <div className="mx-auto w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-sm mb-3">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tap Menu (⋮)</h4>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Tap the 3 dots in the top right corner of Chrome and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
                  <div className="mx-auto w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-sm mb-3">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Launch & Enjoy</h4>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Android installs the WebAPK with the gold HK emblem. It runs offline without any browser address bar.
                  </p>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleInstallPWA}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Trigger Android App Install Prompt</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SOURCE CODE ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-500" />
                  <span>Architecture & Directory Structure</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  The codebase is clean, strictly typed, modular, and ready for development or production deployment:
                </p>

                <div className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 space-y-1 overflow-x-auto">
                  <div>📁 hisab-kitab/</div>
                  <div>├── 📁 android/                     <span className="text-slate-500"># Native Android Studio project (Gradle, Manifest, Java)</span></div>
                  <div>│   ├── 📁 app/src/main/java/     <span className="text-slate-500"># MainActivity.java (WebView, PDF downloads, share)</span></div>
                  <div>│   └── build.gradle              <span className="text-slate-500"># Configured for assembleRelease (APK) & bundleRelease (AAB)</span></div>
                  <div>├── 📁 public/                      <span className="text-slate-500"># Web assets, icons, manifest.json, sw.js</span></div>
                  <div>│   ├── iconHK.svg                <span className="text-slate-500"># Luxury gold HK circular emblem</span></div>
                  <div>│   └── downloads/                <span className="text-slate-500"># Pre-packaged source.zip and android.zip</span></div>
                  <div>├── 📁 src/                         <span className="text-slate-500"># TypeScript application core</span></div>
                  <div>│   ├── 📁 components/            <span className="text-slate-500"># Invoices, Parties, Inventory, Guide & Tips, Common</span></div>
                  <div>│   ├── 📁 context/               <span className="text-slate-500"># AppContext (Khata, stock, billing state)</span></div>
                  <div>│   └── 📁 services/              <span className="text-slate-500"># pdfService.ts (Tax invoice logic, WhatsApp PDF share)</span></div>
                  <div>├── capacitor.config.json         <span className="text-slate-500"># Capacitor mobile packaging configuration</span></div>
                  <div>├── README-ANDROID.md             <span className="text-slate-500"># Step-by-step APK & AAB compilation documentation</span></div>
                  <div>├── server.ts                     <span className="text-slate-500"># Express 4 server & Gemini 3.1 Pro OCR proxy</span></div>
                  <div>└── package.json                  <span className="text-slate-500"># Dependencies: React 19, Tailwind v4, Vite 8, jsPDF</span></div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <a
                  href="/downloads/hisab-kitab-source.zip"
                  download="hisab-kitab-pro-source.zip"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm cursor-pointer transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Complete ZIP Archive</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
