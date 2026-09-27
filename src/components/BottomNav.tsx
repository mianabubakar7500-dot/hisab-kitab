import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import {
  Home,
  Menu,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'menu', label: 'Menu', icon: Menu },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-lg dark:border-slate-800/90 dark:bg-slate-900/95 md:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex h-16 items-center justify-around px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'menu' &&
              ['parties', 'items', 'sales', 'purchases', 'quotations', 'payments', 'expenses', 'reports', 'guide'].includes(
                activeTab
              ));

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-1 flex-col items-center justify-center py-2 h-full transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active top pill indicator */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-[0_1px_6px_rgba(5,150,105,0.6)]" />
              )}
              
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 stroke-[2.5]' : 'scale-100 stroke-[1.8]'
                }`}
              />
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
