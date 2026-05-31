import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Indicators from './components/Indicators';
import Billing from './components/Billing';
import LinksAndInstructions from './components/LinksAndInstructions';
import Settings from './components/Settings';
import { BRANDING } from '@/branding';
import Auth from './components/Auth';
import { UserAuth } from './types';
import { getCurrentAuthProfile, subscribeToAuthChanges, signOutCurrentUser } from './lib/auth';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth, setAuth] = useState<UserAuth | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    let isMounted = true;

    document.title = BRANDING.documentTitle;

    const bootstrap = async () => {
      try {
        const storedAuth = await getCurrentAuthProfile();
        if (!isMounted) return;
        setAuth(storedAuth);
        setIsAuthenticated(!!storedAuth?.email);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    const { data: authListener } = subscribeToAuthChanges((nextAuth) => {
      if (!isMounted) return;
      setAuth(nextAuth);
      setIsAuthenticated(!!nextAuth?.email);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (userAuth: UserAuth) => {
    setAuth(userAuth);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await signOutCurrentUser();
    setAuth(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-50 flex items-center justify-center text-sm font-semibold text-zinc-500">
        Carregando ControlCopy...
      </div>
    );
  }

  if (!isAuthenticated || !auth) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 flex flex-col xl:flex-row">
      {/* Persistent Left Sidebar Header */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        auth={auth} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 xl:p-8 pb-[calc(6.5rem+env(safe-area-inset-bottom))] xl:pb-8">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'users' && <Users />}
        {activeTab === 'indicators' && <Indicators />}
        {activeTab === 'billing' && <Billing />}
        {activeTab === 'links' && <LinksAndInstructions />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}
