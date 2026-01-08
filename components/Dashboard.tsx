
import React, { useState } from 'react';
import { UserSettings } from '../types.ts';
import { translations, Language } from '../translations.ts';
import { 
  Key, 
  Copy, 
  Check, 
  MessageSquare, 
  Activity, 
  Smartphone, 
  Download,
  Info,
  ShieldCheck,
  Zap,
  BarChart3,
  Terminal,
  Play,
  AlertTriangle,
  BookOpen,
  Code,
  ExternalLink,
  MessageCircle,
  Hash,
  Loader2,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface DashboardProps {
  settings: UserSettings;
  generateKey: () => string;
  sessionsCount: number;
  installApp?: () => void;
  canInstall?: boolean;
  onConsume?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ settings, generateKey, sessionsCount, installApp, canInstall, onConsume }) => {
  const t = translations[settings.language as Language] || translations.English;
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenSuccess, setRegenSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'js' | 'python' | 'curl'>('js');
  const [showKey, setShowKey] = useState(false);

  const usagePercent = Math.min((settings.usage / settings.quota) * 100, 100);
  const creditsRemaining = Math.max(settings.quota - settings.usage, 0);

  const handleCopy = (text: string, setter: (val: boolean) => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleSimulateCall = () => {
    if (!settings.apiKey || creditsRemaining <= 0 || simulating) return;
    setSimulating(true);
    setTimeout(() => {
      onConsume?.();
      setSimulating(false);
    }, 800);
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
        return `// JavaScript / Node.js
const response = await fetch('https://api.stacy.ai/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: '${key}',
    message: 'Hello Stacy!',
    stream: false
  })
});

const data = await response.json();
console.log(data.content);`;
      case 'python':
        return `# Python Implementation
import requests

url = "https://api.stacy.ai/v1/chat"
payload = {
    "key": "${key}",
    "message": "Hello Stacy!",
    "temperature": 0.7
}

response = requests.post(url, json=payload)
print(response.json()['content'])`;
      case 'curl':
        return `curl -X POST https://api.stacy.ai/v1/chat \\
-H "Content-Type: application/json" \\
-d '{
  "key": "${key}",
  "message": "Hello Stacy!",
  "stream": true
}'`;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8 pb-24 animate-in fade-in duration-500">
      {/* Confirmation Modal */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-yellow-500/10 rounded-full text-yellow-500">
                <AlertTriangle size={40} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Regenerate API Key?</h3>
            <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
              Are you sure you want to regenerate your API key? This action is irreversible and will invalidate your current key.
            </p>
            <div className="flex gap-3">
              <button 
                disabled={isRegenerating}
                onClick={() => setShowRegenConfirm(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isRegenerating}
                onClick={confirmRegen}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {isRegenerating ? <Loader2 size={18} className="animate-spin" /> : 'Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{t.dashboard.title}</h1>
          <p className="text-slate-400 text-sm font-medium">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <ShieldCheck size={14} className="text-green-400" />
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{t.dashboard.verified}</span>
        </div>
      </header>

      {/* Grid Stats & Quota UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<MessageSquare size={18} />} label={t.dashboard.stats.conv} value={sessionsCount} color="indigo" />
        
        <div className="glass-panel p-5 rounded-2xl border-slate-800 shadow-sm flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.dashboard.stats.usage}</p>
            <BarChart3 size={18} className="text-purple-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <p className="text-xl font-bold">{settings.usage} <span className="text-xs text-slate-500 font-medium">/ {settings.quota}</span></p>
              <p className="text-[10px] font-black text-purple-400">{Math.round(usagePercent)}%</p>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-1000 ease-out ${usagePercent > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                 style={{ width: `${usagePercent}%` }}
               ></div>
            </div>
          </div>
        </div>

        <StatCard icon={<Activity size={18} />} label={t.dashboard.stats.status} value={t.dashboard.stats.online} color="blue" />
      </div>

      {/* API Key Panel */}
      <section className="glass-panel rounded-3xl overflow-hidden border-slate-800 bg-slate-900/40 relative">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key size={20} className="text-indigo-400" />
            <h2 className="text-lg font-bold">{t.dashboard.api.title}</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={`flex-1 border rounded-2xl px-5 py-3 font-mono text-sm flex items-center justify-between min-h-[52px] transition-all overflow-hidden ${
              settings.apiKey ? 'bg-black/40 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/50 border-slate-800 text-slate-600'
            }`}>
              <span className="truncate">
                {getMaskedKey(settings.apiKey)}
              </span>
              {settings.apiKey && (
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="ml-2 p-1.5 text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleCopy(settings.apiKey || '', setCopied)}
                disabled={!settings.apiKey}
                className="p-3.5 glass-panel rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 text-slate-300"
              >
                {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
              </button>
              <button 
                onClick={() => settings.apiKey ? setShowRegenConfirm(true) : generateKey()}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {settings.apiKey ? t.dashboard.api.regenerate : t.dashboard.api.activate}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Documentation */}
      <section className="glass-panel rounded-3xl overflow-hidden border-slate-800 bg-slate-900/20">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <BookOpen size={20} className="text-purple-400" />
          <h2 className="text-lg font-bold">{t.dashboard.api.docs}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TabButton active={activeTab === 'js'} onClick={() => setActiveTab('js')} label="JavaScript" />
            <TabButton active={activeTab === 'python'} onClick={() => setActiveTab('python')} label="Python" />
            <TabButton active={activeTab === 'curl'} onClick={() => setActiveTab('curl')} label="cURL" />
          </div>
          <div className="bg-[#0b0e14] rounded-2xl border border-white/5 overflow-hidden font-mono text-xs shadow-2xl p-5">
            <pre className="text-indigo-200/90 leading-relaxed overflow-x-auto">
              {getCodeSnippet()}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
      active 
        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
        : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'
    }`}
  >
    {label}
  </button>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: any; color: string }> = ({ icon, label, value, color }) => (
  <div className="glass-panel p-5 rounded-2xl border-slate-800 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
    <div className={`p-2.5 rounded-xl ${color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-blue-500/10 text-blue-400'}`}>
      {icon}
    </div>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; description: string }> = ({ number, title, description }) => (
  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
    <span className="text-xs font-black text-indigo-500/50">{number}</span>
    <h4 className="font-bold text-slate-100">{title}</h4>
    <p className="text-[11px] text-slate-500 leading-snug">{description}</p>
  </div>
);

const DocFeatureItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
    <div className="shrink-0">{icon}</div>
    <div>
      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">{title}</h3>
      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{description}</p>
    </div>
  </div>
);

export default Dashboard;
