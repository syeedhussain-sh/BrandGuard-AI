import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { BrandGuidelinesPage } from './pages/BrandGuidelinesPage';
import { ContentCheckerPage } from './pages/ContentCheckerPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import './App.css';

const MainLayout: React.FC = () => {
  const { activePage } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'guidelines':
        return <BrandGuidelinesPage />;
      case 'checker':
        return <ContentCheckerPage />;
      case 'results':
        return <AnalysisResultsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="main-content">
        <Header onToggleMobileMenu={() => setIsMobileOpen(true)} />
        <main>{renderActivePage()}</main>
        <Toast />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
