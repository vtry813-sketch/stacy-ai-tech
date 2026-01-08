
import React, { useState } from 'react';
import { Page, ChatSession, UserSettings } from '../types.ts';
import { translations, Language } from '../translations.ts';
import { 
  Plus, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Home as HomeIcon, 
  MessageSquare, 
  Trash2,
  Clock,
  Search,
  X
} from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  currentPage: Page;
  setPage: (page: Page) => void;
  avatar: string;
  settings: UserSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeId, 
  onSelect, 
  onNew, 
  onDelete, 
  currentPage, 
  setPage,
  avatar,
  settings
}) => {
  const t = translations[settings.language as Language] || translations.English;
  const [searchQuery, setSearchQuery] = useState('');

  const userInitials = settings.userName
    ? settings.userName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full h-full glass-panel flex flex-col border-r border-slate-800 bg-[#0f172a]/95 overflow-hidden">
      {/* Brand Section */}
      <div className="p-5 md:p-6 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden stacy-gradient p-0.5 shadow-lg shadow-indigo-500/20">
           <img src={avatar} alt="Stacy" className="w-full h-full object-cover rounded-[10px]" />
        </div>
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 tracking-tight">
          Stacy AI
        </h1>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-3 shrink-0">
        <button 
          onClick={onNew}
          className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-medium transition-all group"
        >
          <span className="flex items-center gap-2 text-sm">
            <Plus size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            {t.nav.newChat}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4 shrink-0">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-2 pl-9 pr-8 text-xs text-slate-300 placeholder:text-slate-600 outline-none focus:border-indigo-500/30 focus:bg-slate-800/60 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-slate-300 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <NavItem 
          icon={<HomeIcon size={18} />} 
          label={t.nav.home} 
          active={currentPage === Page.Home} 
          onClick={() => setPage(Page.Home)} 
        />
        <NavItem 
          icon={<LayoutDashboard size={18} />} 
          label={t.nav.dashboard} 
          active={currentPage === Page.Dashboard} 
          onClick={() => setPage(Page.Dashboard)} 
        />
        <NavItem 
          icon={<SettingsIcon size={18} />} 
          label={t.nav.settings} 
          active={currentPage === Page.Settings} 
          onClick={() => setPage(Page.Settings)} 
        />

        <div className="pt-6 pb-2 px-3">
          <p className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
            <Clock size={12} />
            {t.nav.recent}
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="px-3 py-4 text-xs text-slate-500 italic">{t.nav.noHistory}</div>
        ) : filteredSessions.length === 0 ? (
          <div className="px-3 py-4 text-xs text-slate-500 italic">{t.nav.noResults}</div>
        ) : (
          <div className="space-y-0.5 pb-6">
            {filteredSessions.map(session => (
              <div 
                key={session.id}
                className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${activeId === session.id && currentPage === Page.Chat ? 'bg-indigo-500/10 text-indigo-300' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}
              >
                <button 
                  onClick={() => onSelect(session.id)}
                  className="flex-1 flex items-center gap-3 px-1 text-left truncate text-sm"
                >
                  <MessageSquare size={14} className={`shrink-0 ${activeId === session.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate">{session.title}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  className="opacity-0 lg:group-hover:opacity-100 lg:p-1 hover:text-red-400 transition-all rounded-md bg-slate-900 border border-slate-700 p-2 lg:bg-transparent lg:border-none"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/20 shrink-0">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-600">
            {userInitials || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{settings.userName}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase">Stacy {t.nav.proUser}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active ? 'bg-indigo-500/15 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
  >
    <span className={`${active ? 'text-indigo-400' : 'text-slate-500'}`}>{icon}</span>
    <span className="text-sm">{label}</span>
    {active && <div className="ml-auto w-1 h-4 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>}
  </button>
);

export default Sidebar;
