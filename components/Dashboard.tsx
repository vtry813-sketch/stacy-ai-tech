
import React, { useState } from 'react';
import { UserSettings, Page } from '../types.ts';
import { translations, Language } from '../translations.ts';
import { 
  Key, 
  Copy, 
  Check, 
  MessageSquare, 
  Activity, 
  ShieldCheck, 
  Zap,
  BarChart3,
  Play,
  AlertTriangle,
  BookOpen,
  Code,
  Loader2,
  Eye,
  EyeOff,
  Cpu,
  Layers,
  Terminal,
  Globe,
  ExternalLink,
  HelpCircle,
  FileText,
  LifeBuoy
} from 'lucide-react';

interface DashboardProps {
  settings: UserSettings;
  generateKey: () => string;
  sessionsCount: number;
  onConsume?: () => void;
  setPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ settings, generateKey, sessionsCount, onConsume, setPage }) => {
  const t = translations[settings.language as Language] || translations.English;
  const [copied, setCopied] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenSuccess, setRegenSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'js' | 'python' | 'curl'>('js');
  const [showKey, setShowKey] = useState(false);

  const usagePercent = Math.min((settings.usage / settings.quota) * 100, 100);

  const handleCopy = (text: string, setter: (val: boolean) => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const confirmRegen = async () => {
    setIsRegenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    generateKey();
    setIsRegenerating(false);
    setShowRegenConfirm(false);
    setRegenSuccess(true);
    setShowKey(false); 
    setTimeout(() => setRegenSuccess(false), 4000);
  };

  const getMaskedKey = (key: string | null) => {
    if (!key) return "STACY_SESSION_INACTIVE";
    if (showKey) return key;
    return "•".repeat(24);
  };

  const getCodeSnippet = () => {
    const key = (settings.apiKey && showKey) ? settings.apiKey : 'YOUR_STACY_KEY';
    switch (activeTab) {
      case 'js':
        return `// Stacy AI SDK - JavaScript
import { StacyAI } from 'stacy-sdk';

const stacy = new StacyAI({
  apiKey: '${key}',
  endpoint: 'https://stacy-ai.vercel.app/api'
});

const response = await stacy.chat('Hello!');
console.log(response.text);`;
      case 'python':
        return `# Stacy AI - Python
import requests

url = "https://stacy-ai.vercel.app/api/v1/chat"
headers = { "Authorization": "Bearer ${key}" }
data = { "message": "Hi Stacy!" }

res = requests.post(url, json=data, headers=headers)
print(res.json()['content'])`;
      case 'curl':
        return `curl -X POST https://stacy-ai.vercel.app/api/v1/chat \\
-H "Authorization: Bearer ${key}" \\
-H "Content-Type: application/json" \\
-d '{"message": "Hello!"}'`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Confirmation Modal */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-yellow-500/10 rounded-full text-yellow-500">
                <AlertTriangle size={40} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-4 text-slate-100">Regenerate Key?</h3>
            <p className="text-slate-400 text-sm text-center mb-8">This will immediately invalidate your current key.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRegenConfirm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-sm font-bold transition-all text-slate-300">Cancel</button>
              <button onClick={confirmRegen} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-sm font-bold transition-all text-white shadow-lg">
                {isRegenerating ? <Loader2 size={18} className="animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 uppercase">
            {t.nav.dashboard}
          </h1>
          <p className="text-slate-400 text-xs">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full">
          <ShieldCheck size={12} />
          <span className="text-[9px] font-bold uppercase tracking-widest">{t.dashboard.verified}</span>
        </div>
      </header>

      {/* API KEY SECTION */}
      <DashboardSection 
        title={t.dashboard.api.title} 
        description={t.dashboard.api.note}
        icon={<Key className="text-indigo-400" size={16} />}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className={`flex-1 border rounded-xl px-4 py-2 font-mono text-sm flex items-center justify-between transition-all ${
              settings.apiKey ? 'bg-black/40 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/60 border-slate-700/50 text-slate-600'
            }`}>
              <span className="truncate">{getMaskedKey(settings.apiKey)}</span>
              {settings.apiKey && (
                <button onClick={() => setShowKey(!showKey)} className="ml-2 text-slate-500 hover:text-indigo-400 transition-colors">
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleCopy(settings.apiKey || '', setCopied)} disabled={!settings.apiKey} className="p-2.5 glass-panel rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 border-slate-700/50">
                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
              <button 
                onClick={() => settings.apiKey ? setShowRegenConfirm(true) : generateKey()}
                className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 uppercase tracking-widest"
              >
                {settings.apiKey ? t.dashboard.api.regenerate : t.dashboard.api.activate}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
            <Zap size={14} className="text-indigo-400 shrink-0" />
            <p className="text-[10px] text-indigo-200/60 font-medium">Your API key is private. Using it will consume your message credits.</p>
          </div>
        </div>
      </DashboardSection>

      {/* DOCUMENTATION LINK SECTION */}
      <DashboardSection 
        title={t.dashboard.api.docs} 
        description="Explore detailed documentation, endpoints, and community resources."
        icon={<BookOpen className="text-purple-400" size={16} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DocLink 
            icon={<FileText size={16} />} 
            title={t.docs.apiRef} 
            desc="Explore all available endpoints and parameters."
            onClick={() => setPage(Page.Documentation)}
          />
          <DocLink 
            icon={<Terminal size={16} />} 
            title={t.docs.quickStart} 
            desc="Get up and running in less than 5 minutes."
            onClick={() => setPage(Page.Documentation)}
          />
          <DocLink 
            icon={<Cpu size={16} />} 
            title={t.docs.sdkDocs} 
            desc="Full documentation for the Stacy Node.js/Python SDK."
            onClick={() => setPage(Page.Documentation)}
          />
          <DocLink 
            icon={<LifeBuoy size={16} />} 
            title={t.docs.support} 
            desc="Join our community for help and integration tips."
            onClick={() => setPage(Page.Documentation)}
          />
        </div>
      </DashboardSection>

      {/* IMPLEMENTATION GUIDE PREVIEW */}
      <DashboardSection 
        title="Implementation Guide" 
        description="Integrate Stacy AI into your projects with our official SDK."
        icon={<Code className="text-indigo-400" size={16} />}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Layers size={12} className="text-purple-400" />
                SDK Installation
              </h3>
              <div className="bg-black/40 rounded-xl p-3 border border-slate-800 flex items-center justify-between group">
                <code className="text-xs text-indigo-300">npm install stacy-sdk</code>
                <button onClick={() => handleCopy('npm install stacy-sdk', setCopied)} className="text-slate-600 hover:text-white transition-colors">
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} className="text-blue-400" />
                Base API URL
              </h3>
              <div className="bg-black/40 rounded-xl p-3 border border-slate-800 flex items-center justify-between group">
                <code className="text-xs text-blue-300">https://stacy-ai.vercel.app/api</code>
                <button onClick={() => handleCopy('https://stacy-ai.vercel.app/api', setCopied)} className="text-slate-600 hover:text-white transition-colors">
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} className="text-indigo-400" />
                Code Implementation
              </h3>
              <div className="flex gap-2">
                {['js', 'python', 'curl'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`text-[9px] font-bold uppercase px-2 py-1 rounded transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[#0b0e14] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-[9px] font-mono text-slate-500">example.{activeTab === 'curl' ? 'sh' : activeTab}</span>
                <button onClick={() => handleCopy(getCodeSnippet(), setCopied)} className="text-slate-600 hover:text-white transition-colors">
                  <Copy size={12} />
                </button>
              </div>
              <pre className="p-4 text-[11px] text-indigo-200/80 font-mono leading-relaxed overflow-x-auto scrollbar-thin">
                {getCodeSnippet()}
              </pre>
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          icon={<MessageSquare size={16} />} 
          label={t.dashboard.stats.conv} 
          value={sessionsCount} 
          color="indigo" 
        />
        <StatCard 
          icon={<Activity size={16} />} 
          label={t.dashboard.stats.status} 
          value={t.dashboard.stats.online} 
          color="green" 
        />
        <div className="glass-panel p-5 rounded-2xl border-slate-800/40 bg-slate-900/30 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.dashboard.stats.usage}</p>
            <BarChart3 size={16} className="text-purple-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <p className="text-xl font-bold text-slate-100">{settings.usage} <span className="text-[10px] text-slate-500">/ {settings.quota}</span></p>
              <p className="text-[9px] font-bold text-purple-400">{Math.round(usagePercent)}%</p>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${usagePercent > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
                style={{ width: `${usagePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardSection: React.FC<{ title: string; description: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, description, icon, children }) => (
  <section className="glass-panel p-5 rounded-2xl border-slate-800/40 bg-slate-900/30 shadow-sm transition-all hover:bg-slate-900/40">
    <div className="flex gap-3 mb-4">
      <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-700/50 shrink-0 h-fit">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-100">{title}</h2>
        <p className="text-[10px] text-slate-500 font-medium">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const DocLink: React.FC<{ icon: React.ReactNode; title: string; desc: string; onClick: () => void }> = ({ icon, title, desc, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-start gap-3 p-3 bg-slate-800/20 border border-slate-700/30 rounded-xl hover:bg-slate-800/40 hover:border-indigo-500/30 transition-all group text-left w-full"
  >
    <div className="p-2 bg-slate-800/50 rounded-lg text-slate-500 group-hover:text-indigo-400 transition-colors">
      {icon}
    </div>
    <div className="flex-1 overflow-hidden">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-200 group-hover:text-white">{title}</h4>
        <ExternalLink size={10} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
      </div>
      <p className="text-[10px] text-slate-500 truncate mt-0.5">{desc}</p>
    </div>
  </button>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: any; color: string }> = ({ icon, label, value, color }) => (
  <div className="glass-panel p-5 rounded-2xl border-slate-800/40 bg-slate-900/30 flex items-center justify-between shadow-sm">
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold mt-1 text-slate-100">{value}</p>
    </div>
    <div className={`p-2.5 rounded-xl ${
      color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : 
      color === 'green' ? 'bg-green-500/10 text-green-400' : 
      'bg-slate-800 text-slate-400'
    }`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
