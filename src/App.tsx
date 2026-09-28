import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { SessionsListView } from './components/sessions/SessionsListView';
import { ExpensesListView } from './components/expenses/ExpensesListView';
import { PlayerRosterView } from './components/players/PlayerRosterView';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'sessions' && <SessionsListView />}
      {activeTab === 'expenses' && <ExpensesListView />}
      {activeTab === 'players' && <PlayerRosterView />}
    </main>
  );
};

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-grain bg-slate-50 flex flex-col antialiased text-slate-800">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
        <BottomNav />
        <PWAInstallBanner />
      </div>
    </AppProvider>
  );
}

export default App;
