
import React, { useState, useEffect, useCallback } from 'react';
import { Page, ChatSession, UserSettings, Message } from './types';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ChatView from './components/ChatView';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { translations, Language } from './translations';

const STACY_AVATAR = "https://files.catbox.moe/don5ye.jpg";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [settings, setSettings] = useState<UserSettings>({
    userName: 'User',
    apiKey: null,
    theme: 'dark',
    personality: 'Stacy AI is a highly intelligent, multilingual assistant fluent in any language. Helpful, professional, and efficient.',
    language: 'English', 
    temperature: 0.7,
    voiceEnabled: false,
    usage: 0,
    quota: 100 
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const t = translations[settings.language as Language] || translations.English;

  useEffect(() => {
    const langMap: Record<string, string> = {
      'French': 'fr',
      'English': 'en',
      'Spanish': 'es',
      'German': 'de'
    };
    document.documentElement.lang = langMap[settings.language] || 'en';
  }, [settings.language]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = settings.theme === 'dark';
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#f8fafc');
    }
  }, [settings.theme]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('stacy_sessions');
    const savedSettings = localStorage.getItem('stacy_settings');
    
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
    }

    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('stacy_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('stacy_settings', JSON.stringify(settings));
  }, [settings]);

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: t.nav.newChat,
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setCurrentPage(Page.Chat);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [t.nav.newChat]);

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    setCurrentPage(Page.Chat);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const clearAllHistory = () => {
    if (window.confirm(t.settings.confirmDelete)) {
      setSessions([]);
      setActiveSessionId(null);
      setCurrentPage(Page.Home);
      localStorage.removeItem('stacy_sessions');
    }
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const title = messages.length >= 2 ? messages[0].content.slice(0, 30) + '...' : s.title;
        return { ...s, messages, title, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const generateApiKey = () => {
    const key = `Stacy~${Math.random().toString(36).substring(2, 10).toUpperCase()}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setSettings(prev => ({ ...prev, apiKey: key, usage: 0 }));
    return key;
  };

  const consumeCredit = () => {
    setSettings(prev => ({ ...prev, usage: prev.usage + 1 }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const installApp = async () => {
    if (!deferredPrompt) {
      alert("APK Installation Method:\n\n1. Use Chrome on your Android device.\n2. Tap the menu (⋮) in the top right.\n3. Tap 'Install App' or 'Add to Home screen'.\n\nThis will install Stacy as a native Android app.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return (
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-12 scrollbar-thin">
            <Home onStart={createNewChat} avatar={STACY_AVATAR} settings={settings} />
          </div>
        );
      case Page.Chat:
        const activeSession = sessions.find(s => s.id === activeSessionId);
        return <ChatView session={activeSession} settings={settings} updateMessages={(msgs) => activeSessionId && updateSessionMessages(activeSessionId, msgs)} avatar={STACY_AVATAR} onConsume={consumeCredit} />;
      case Page.Dashboard:
        return (
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scrollbar-thin">
            <Dashboard settings={settings} generateKey={generateApiKey} sessionsCount={sessions.length} installApp={installApp} canInstall={!!deferredPrompt} onConsume={consumeCredit} />
          </div>
        );
      case Page.Settings:
        return (
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scrollbar-thin">
            <Settings settings={settings} onUpdate={setSettings} onClearHistory={clearAllHistory} />
          </div>
        );
      default:
        return (
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-12 scrollbar-thin">
            <Home onStart={createNewChat} avatar={STACY_AVATAR} settings={settings} />
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${settings.theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-indigo-950 text-slate-100'}`}>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      {/* Sidebar - Drawer Behavior on Mobile, Column on Desktop */}
      <div 
        className={`fixed lg:relative z-50 h-full transition-transform duration-300 ease-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:w-0 lg:opacity-0 overflow-hidden'}`}
      >
        <Sidebar sessions={sessions} activeId={activeSessionId} onSelect={selectSession} onNew={createNewChat} onDelete={deleteSession} currentPage={currentPage} setPage={setCurrentPage} avatar={STACY_AVATAR} settings={settings} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Responsive Mobile Header */}
        <div className="flex items-center justify-between px-4 h-16 shrink-0 lg:hidden bg-white/5 backdrop-blur-md border-b border-white/10">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 glass-panel rounded-xl shadow-lg border-indigo-500/10 active:scale-95 transition-transform"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden stacy-gradient p-0.5">
              <img src={STACY_AVATAR} className="w-full h-full object-cover rounded-[6px]" />
            </div>
            <span className="font-bold tracking-tight">Stacy AI</span>
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2 glass-panel rounded-xl shadow-lg border-indigo-500/10 active:scale-95 transition-transform"
          >
            {settings.theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
          </button>
        </div>

        {/* Desktop Theme Toggle Floating */}
        <button 
          onClick={toggleTheme}
          className="hidden lg:flex fixed top-4 right-4 z-50 p-2.5 glass-panel rounded-xl shadow-lg border-indigo-500/10 hover:scale-110 active:scale-95 transition-all"
        >
          {settings.theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
        </button>

        {renderPage()}
      </main>
    </div>
  );
};

export default App;
