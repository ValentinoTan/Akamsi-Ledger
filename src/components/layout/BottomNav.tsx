import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Receipt, 
  Users 
} from 'lucide-react';

interface NavItem {
  id: 'dashboard' | 'sessions' | 'expenses' | 'players';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, totalPendingDebt, setSelectedSessionId } = useApp();

  const handleTabClick = (tab: 'dashboard' | 'sessions' | 'expenses' | 'players') => {
    setActiveTab(tab);
    if (tab === 'sessions') {
      setSelectedSessionId(null);
    }
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'sessions',
      label: 'Sesi',
      icon: CalendarCheck2,
    },
    {
      id: 'expenses',
      label: 'Buku Kas',
      icon: Receipt,
    },
    {
      id: 'players',
      label: 'Member',
      icon: Users,
      badge: totalPendingDebt > 0 ? '!' : undefined,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-lg pb-safe"
    >
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all duration-150 cursor-pointer min-h-[44px] min-w-[44px] ${
                isActive
                  ? 'text-grainient-darkTeal font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {/* Active Tab Ambient Pill */}
              {isActive && (
                <span className="absolute inset-0 bg-gradient-to-r from-grainient-mint/60 via-grainient-teal/20 to-grainient-cyan/50 rounded-2xl -z-10 shadow-2xs transition-all" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4] text-grainient-darkTeal' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-grainient-darkTeal font-bold' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
