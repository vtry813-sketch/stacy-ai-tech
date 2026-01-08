
import React, { useState } from 'react';
import { UserSettings } from '../types.ts';
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
  Terminal,
  Play,
  AlertTriangle,
  BookOpen,
  Code,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
  Cpu,
  Globe,
  Sparkles,
  Command,
  FileCode,
  Layers
} from 'lucide-react';

interface DashboardProps {
  settings: UserSettings;
  generateKey: () => string;
  sessionsCount: number;
  onConsume?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ settings, generateKey, sessionsCount, onConsume }) => {
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
        return `// Stacy AI SDK - Node.js/Browser
import { Stacy } from 'stacy-sdk';

const ai = new Stacy({
  apiKey: '${key}',
  baseUrl: 'https://stacy-ai.vercel.app/api'
});

const response = await ai.chat({
  message: 'Hello Stacy!',
  temperature: ${settings.temperature}
});

console.log(response.text);`;
      case 'python':
        return `# Stacy AI Python Integration
import requests

HEADERS = {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
}

data = { "message": "Hi Stacy!" }
res = requests.post("https://stacy-ai.vercel.app/api/v1/chat", 
                    json=data, headers=HEADERS)

print(res.json()['content'])`;
      case 'curl':
        return `curl -X POST https://stacy-ai.vercel.app/api/v1/chat \\
-H "Authorization: Bearer ${key}" \\
-H "Content-Type: application/json" \\
-d '{"message": "Hello from terminal"}'`;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8 pb-32 animate-in fade-in duration-500">
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
              Are you sure? This will immediately invalidate your old key and break existing integrations.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRegenConfirm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-sm font-bold transition-all">Cancel</button>
              <button onClick={confirmRegen} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                {isRegenerating ? <Loader2 size={18} className="animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">{t.dashboard.title}</h1>
          <p className="text-slate-400 text-sm font-medium">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <ShieldCheck size={14} className="text-green-400" />
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{t.dashboard.verified}</span>
        </div>
      </header>

      {/* DEVELOPER HUB / API DOCUMENTATION */}
      <section className="relative overflow-hidden group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-15 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative glass-panel rounded-[2.5rem] border-indigo-500/30 bg-indigo-950/20 shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col lg:flex-row items-start gap-10">
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-500/20 rounded-[1.5rem] border border-indigo-500/30 text-indigo-400 shadow-xl shadow-indigo-500/10">
                  <Command size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Developer Integration Hub</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Stacy API v3.0 REST Interface</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Layers size={18} className="text-indigo-400" />
                    How to install the Stacy SDK
                  </h3>
                  <div className="bg-black/40 rounded-xl p-4 border border-slate-800 font-mono text-xs text-indigo-300 flex items-center justify-between">
                    <span>npm install @stacy/sdk --save</span>
                    <button onClick={() => handleCopy('npm install @stacy/sdk --save', setCopied)} className="hover:text-white transition-colors">
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <FileCode size={18} className="text-purple-400" />
                    Integration Steps
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <DocStep number="01" title="Generate Key" desc="Get your personal Stacy Neural Key below." />
                    <DocStep number="02" title="Auth Header" desc="Use 'Authorization: Bearer <KEY>' in your requests." />
                    <DocStep number="03" title="Base URL" desc="Endpoint: stacy-ai.vercel.app/api/v1/chat" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[450px] space-y-4 shrink-0">
               <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-2">
                   <TabButton active={activeTab === 'js'} onClick={() => setActiveTab('js')} label="Node.js" />
                   <TabButton active={activeTab === 'python'} onClick={() => setActiveTab('python')} label="Python" />
                   <TabButton active={activeTab === 'curl'} onClick={() => setActiveTab('curl')} label="cURL" />
                 </div>
               </div>
               <div className="relative bg-[#0b0e14] rounded-3xl border border-slate-800 overflow-hidden font-mono text-xs shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">example_integration.{activeTab === 'python' ? 'py' : activeTab === 'js' ? 'js' : 'sh'}</span>
                    <button onClick={() => handleCopy(getCodeSnippet(), setCopied)} className="text-slate-500 hover:text-white transition-colors">
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <pre className="p-6 text-indigo-200/90 leading-relaxed overflow-x-auto">
                    {getCodeSnippet()}
                  </pre>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<MessageSquare size={20} />} label={t.dashboard.stats.conv} value={sessionsCount} color="indigo" />
        
        <div className="glass-panel p-6 rounded-[2rem] border-slate-800 shadow-xl flex flex-col justify-between h-full bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.dashboard.stats.usage}</p>
            <BarChart3 size={20} className="text-purple-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black">{settings.usage} <span className="text-xs text-slate-500 font-bold">/ {settings.quota}</span></p>
              <p className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{Math.round(usagePercent)}%</p>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-1000 ease-out ${usagePercent > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} style={{ width: `${usagePercent}%` }}></div>
            </div>
          </div>
        </div>

        <StatCard icon={<Activity size={20} />} label={t.dashboard.stats.status} value={t.dashboard.stats.online} color="blue" />
      </div>

      {/* API Key Panel */}
      <section className="glass-panel rounded-[2rem] overflow-hidden border-slate-800 bg-slate-900/40 relative shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Key size={22} className="text-indigo-400" />
            <h2 className="text-lg font-black uppercase tracking-tight">{t.dashboard.api.title}</h2>
          </div>
          {regenSuccess && <div className="text-green-400 text-[10px] font-black animate-pulse uppercase tracking-widest">Neural Key Updated</div>}
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={`flex-1 border rounded-2xl px-6 py-4 font-mono text-sm flex items-center justify-between min-h-[64px] transition-all overflow-hidden ${
              settings.apiKey ? 'bg-black/60 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/50 border-slate-800 text-slate-600'
            }`}>
              <span className="truncate tracking-widest">{getMaskedKey(settings.apiKey)}</span>
              {settings.apiKey && (
                <button onClick={() => setShowKey(!showKey)} className="ml-2 p-2 text-slate-500 hover:text-indigo-400 transition-colors shrink-0 bg-white/5 rounded-xl">
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleCopy(settings.apiKey || '', setCopied)} disabled={!settings.apiKey} className="p-4 glass-panel rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 text-slate-300 border-slate-700">
                {copied ? <Check size={24} className="text-green-400" /> : <Copy size={24} />}
              </button>
              <button onClick={() => settings.apiKey ? setShowRegenConfirm(true) : generateKey()} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 uppercase tracking-widest">
                {settings.apiKey ? t.dashboard.api.regenerate : t.dashboard.api.activate}
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-3">
            <Zap size={16} className="text-indigo-400" />
            <p className="text-xs text-indigo-200/60 font-medium">Use this key in your project as shown in the Documentation above.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
      active 
        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
        : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'
    }`}
  >
    {label}
  </button>
);

const DocStep: React.FC<{ number: string; title: string; desc: string }> = ({ number, title, desc }) => (
  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
    <span className="text-xl font-black text-indigo-500/20">{number}</span>
    <div>
      <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">{title}</h4>
      <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
    </div>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: any; color: string }> = ({ icon, label, value, color }) => (
  <div className="glass-panel p-6 rounded-[2rem] border-slate-800 shadow-xl flex items-center justify-between bg-slate-900/30">
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
      <p className="text-2xl font-black mt-1 uppercase">{value}</p>
    </div>
    <div className={`p-3.5 rounded-2xl ${color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-blue-500/10 text-blue-400'}`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
