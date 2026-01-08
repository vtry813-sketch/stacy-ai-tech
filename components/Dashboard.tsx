
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
  EyeOff,
  Cpu,
  Globe,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  settings: UserSettings;
  generateKey: () => string;
  sessionsCount: number;
  installApp: () => void;
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
        return `// Stacy AI SDK - JS
const res = await fetch('https://api.stacy.ai/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: '${key}', message: 'Hello!' })
});`;
      case 'python':
        return `# Stacy AI Python
import requests
res = requests.post("https://api.stacy.ai/v1/chat", json={
    "key": "${key}",
    "message": "Hi Stacy!"
})`;
      case 'curl':
        return `curl -X POST https://api.stacy.ai/v1/chat \\
-H "Content-Type: application/json" \\
-d '{"key": "${key}", "message": "Hi!"}'`;
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

      {/* APK DEPLOYMENT SECTION - ACTIVELY TRIGGER INSTALL */}
      <section className="relative overflow-hidden group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-15 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative glass-panel rounded-[2.5rem] border-indigo-500/30 bg-indigo-950/20 shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-500/20 rounded-[1.5rem] border border-indigo-500/30 text-indigo-400 shadow-xl shadow-indigo-500/10">
                  <Smartphone size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{t.dashboard.androidTitle}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Stacy Native APK v2.5 Deployment Ready</p>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-300 leading-relaxed text-lg max-w-lg font-medium italic opacity-80">
                Stacy AI peut être installée comme une **application native APK** sur votre appareil. 
                Une expérience immersive plein écran, sans latence navigateur, accessible instantanément.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-indigo-500/20 rounded-lg"><Cpu size={18} className="text-indigo-400" /></div>
                  <span className="text-xs font-bold text-slate-300 uppercase">Poids Ultra-Léger</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-purple-500/20 rounded-lg"><Zap size={18} className="text-purple-400" /></div>
                  <span className="text-xs font-bold text-slate-300 uppercase">Boost Performance</span>
                </div>
              </div>

              <button 
                onClick={installApp}
                className={`w-full sm:w-auto group relative flex items-center justify-center gap-4 px-12 py-6 bg-white text-indigo-950 rounded-[2.5rem] font-black text-xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]`}
              >
                <div className="absolute inset-0 rounded-[2.5rem] bg-indigo-500 blur-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <Download size={26} className="animate-bounce" />
                <span className="relative">TÉLÉCHARGER L'APK</span>
                {canInstall && <Sparkles size={18} className="text-indigo-600 animate-pulse" />}
              </button>
            </div>

            <div className="hidden lg:block relative shrink-0">
               <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full"></div>
               <div className="relative w-56 h-[450px] bg-slate-900 border-[8px] border-slate-800 rounded-[3.5rem] shadow-2xl overflow-hidden scale-110">
                  <div className="absolute top-0 inset-x-0 h-8 bg-slate-800 flex justify-center items-center">
                    <div className="w-16 h-2 bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="mt-12 flex flex-col items-center gap-6 px-6">
                     <div className="w-24 h-24 rounded-3xl stacy-gradient p-1.5 shadow-2xl animate-float">
                        <img src="https://files.catbox.moe/don5ye.jpg" className="w-full h-full object-cover rounded-2xl" />
                     </div>
                     <div className="w-full space-y-3">
                       <div className="w-full h-3 bg-slate-800 rounded-full"></div>
                       <div className="w-4/5 h-3 bg-slate-800 rounded-full"></div>
                       <div className="w-3/5 h-3 bg-slate-800/50 rounded-full"></div>
                     </div>
                     <div className="mt-12 w-full h-40 bg-indigo-600/10 rounded-3xl border border-indigo-500/20 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
                     </div>
                  </div>
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
        </div>
      </section>
    </div>
  );
};

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
