import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Indicators from './components/Indicators';
import Billing from './components/Billing';
import LinksAndInstructions from './components/LinksAndInstructions';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { UserAuth } from './types';
import { ControlCopyDB } from './lib/db';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth, setAuth] = useState<UserAuth | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check if user is already authenticated in LocalStorage
    const storedAuth = ControlCopyDB.getAuth();
    if (storedAuth && storedAuth.email) {
      setAuth(storedAuth);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (userAuth: UserAuth) => {
    setAuth(userAuth);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('cc_auth');
    setAuth(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated || !auth) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Persistent Left Sidebar Header */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        auth={auth} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
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
