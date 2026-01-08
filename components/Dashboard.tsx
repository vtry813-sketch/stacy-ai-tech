
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { translations, Language } from '../translations';
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
    setShowKey(false); // Reset reveal on regeneration
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

      {/* APK & Mobile Deployment */}
      <section className="glass-panel rounded-[2.5rem] overflow-hidden border-indigo-500/30 bg-indigo-500/5 shadow-2xl shadow-indigo-500/5">
        <div className="p-8 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-indigo-600/20 rounded-3xl border border-indigo-500/30 text-indigo-400">
                <Smartphone size={36} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {t.dashboard.androidTitle}
                  <span className="px-2 py-0.5 bg-indigo-600 rounded text-[10px] font-black">NATIVE v1.0</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1 max-w-lg">
                  Deploy Stacy as a standalone application on your Android home screen. Full-screen experience with lightning-fast load times.
                </p>
              </div>
            </div>
            
            <button 
              onClick={installApp}
              className={`group flex flex-col items-center justify-center gap-1 px-12 py-5 rounded-[2rem] font-black transition-all transform active:scale-95 shadow-2xl bg-white text-indigo-900 hover:bg-indigo-50`}
            >
              <div className="flex items-center gap-2">
                <Download size={22} className="animate-bounce" />
                <span className="text-lg uppercase">Install APK</span>
              </div>
              <span className="text-[10px] opacity-70 uppercase tracking-tighter">Direct Android Deployment</span>
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StepCard 
            number="01" 
            title="Approve Prompt" 
            description="Tap 'Install APK'. If your browser doesn't show a prompt, use the Chrome menu 'Add to Home Screen' option." 
          />
          <StepCard 
            number="02" 
            title="Native Integration" 
            description="Stacy will integrate into your Android app drawer with its native icon and splash screen." 
          />
          <StepCard 
            number="03" 
            title="Enjoy Stacy" 
            description="Launch Stacy just like a native app. No address bar, more space for your conversations." 
          />
        </div>
      </section>

      {/* API Key Panel */}
      <section className="glass-panel rounded-3xl overflow-hidden border-slate-800 bg-slate-900/40 relative">
        {regenSuccess && (
          <div className="absolute top-4 right-4 animate-in slide-in-from-right duration-500">
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
              <Check size={16} />
              API Key Regenerated Successfully
            </div>
          </div>
        )}

        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key size={20} className="text-indigo-400" />
            <h2 className="text-lg font-bold">{t.dashboard.api.title}</h2>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${settings.apiKey ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {settings.apiKey ? t.dashboard.api.statusActive : t.dashboard.api.statusInactive}
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
                  title={showKey ? "Hide Key" : "Reveal Key"}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-3">
                <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-indigo-300 font-bold leading-relaxed">
                    {t.dashboard.api.note}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">
                    {creditsRemaining} / {settings.quota} {t.chat.creditsLeft}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleSimulateCall}
                disabled={!settings.apiKey || creditsRemaining <= 0 || simulating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                {simulating ? <Loader2 size={14} className="animate-spin text-indigo-500" /> : <Play size={14} />}
                {t.dashboard.api.simulate}
              </button>
            </div>

            <div className="bg-black/60 rounded-2xl border border-slate-800 overflow-hidden font-mono text-[10px]">
              <div className="bg-slate-800/50 px-4 py-2 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal size={12} />
                  <span>Interactive Endpoint</span>
                </div>
              </div>
              <div className="p-4 text-slate-300 space-y-2">
                <p><span className="text-purple-400">POST</span> <span className="text-indigo-400">https://api.stacy.ai/v1/chat</span></p>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 overflow-x-auto relative">
                   <div className="absolute top-2 right-2 flex items-center gap-2">
                      <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{showKey ? "Unlocked" : "Masked"}</span>
                   </div>
                  <pre className="whitespace-pre">{`{
  "key": "${getMaskedKey(settings.apiKey)}",
  "message": "Hello Stacy!",
  "stream": true
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Documentation Section */}
      <section className="glass-panel rounded-3xl overflow-hidden border-slate-800 bg-slate-900/20">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <BookOpen size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t.dashboard.api.docs}</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Integration Guide</p>
            </div>
          </div>
          <a 
            href="https://docs.stacy.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-indigo-400 transition-all border border-indigo-500/10"
          >
            Full API Docs <ExternalLink size={14} />
          </a>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <DocFeatureItem 
              icon={<MessageCircle size={18} className="text-indigo-400" />}
              title="Chat API"
              description="Simple POST request to chat with Stacy. Context is automatically handled."
            />
            <DocFeatureItem 
              icon={<Zap size={18} className="text-purple-400" />}
              title="Streaming"
              description="Receive partial updates in real-time via Server-Sent Events (SSE)."
            />
            <DocFeatureItem 
              icon={<Hash size={18} className="text-blue-400" />}
              title="External Context"
              description="Pass custom 'userId' to maintain conversations across platforms."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2">
                <TabButton active={activeTab === 'js'} onClick={() => setActiveTab('js')} label="JavaScript" />
                <TabButton active={activeTab === 'python'} onClick={() => setActiveTab('python')} label="Python" />
                <TabButton active={activeTab === 'curl'} onClick={() => setActiveTab('curl')} label="cURL" />
              </div>
              <button 
                onClick={() => setShowKey(!showKey)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${showKey ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500 border border-transparent'}`}
              >
                 {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
                 {showKey ? "Mask Tokens" : "Show Tokens"}
              </button>
            </div>

            <div className="relative group">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button 
                  onClick={() => handleCopy(getCodeSnippet(), () => {})}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/5"
                  title="Copy Code"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="bg-[#0b0e14] rounded-2xl border border-white/5 overflow-hidden font-mono text-xs shadow-2xl">
                <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Terminal size={12} />
                    <span className="text-[10px] uppercase font-black tracking-widest">{activeTab === 'js' ? 'fetch-example.js' : activeTab === 'python' ? 'stacy_api.py' : 'shell'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                  </div>
                </div>
                <div className="p-5 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
                  <pre className="text-indigo-200/90 leading-relaxed">
                    {activeTab === 'js' && (
                      <>
                        <span className="text-slate-500">// Stacy AI Node.js Implementation</span><br/>
                        <span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> <span className="text-indigo-400">fetch</span>(<span className="text-green-400">'https://api.stacy.ai/v1/chat'</span>, {'{'}<br/>
                        &nbsp;&nbsp;method: <span className="text-green-400">'POST'</span>,<br/>
                        &nbsp;&nbsp;headers: {'{'} <span className="text-green-400">'Content-Type'</span>: <span className="text-green-400">'application/json'</span> {'}'},<br/>
                        &nbsp;&nbsp;body: JSON.<span className="text-indigo-400">stringify</span>({'{'}<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;key: <span className="text-green-400">'{getMaskedKey(settings.apiKey)}'</span>,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;message: <span className="text-green-400">'Hello Stacy!'</span>,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;stream: <span className="text-orange-400">false</span><br/>
                        &nbsp;&nbsp;{'}'})<br/>
                        {'}'});<br/><br/>
                        <span className="text-purple-400">const</span> data = <span className="text-purple-400">await</span> response.<span className="text-indigo-400">json</span>();<br/>
                        console.<span className="text-indigo-400">log</span>(data.content);
                      </>
                    )}
                    {activeTab === 'python' && (
                      <>
                        <span className="text-slate-500"># Python Implementation using Requests</span><br/>
                        <span className="text-purple-400">import</span> requests<br/><br/>
                        url = <span className="text-green-400">"https://api.stacy.ai/v1/chat"</span><br/>
                        payload = {'{'}<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">"key"</span>: <span className="text-green-400">"{getMaskedKey(settings.apiKey)}"</span>,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">"message"</span>: <span className="text-green-400">"Explain AI like I'm five."</span>,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-400">"temperature"</span>: <span className="text-orange-400">0.7</span><br/>
                        {'}'}<br/><br/>
                        response = requests.<span className="text-indigo-400">post</span>(url, json=payload)<br/>
                        <span className="text-indigo-400">print</span>(response.<span className="text-indigo-400">json</span>()[<span className="text-green-400">'content'</span>])
                      </>
                    )}
                    {activeTab === 'curl' && (
                      <>
                        <span className="text-purple-400">curl</span> -X <span className="text-indigo-400">POST</span> https://api.stacy.ai/v1/chat \<br/>
                        -H <span className="text-green-400">"Content-Type: application/json"</span> \<br/>
                        -d <span className="text-green-400">'{'{'}"key": "{getMaskedKey(settings.apiKey)}", "message": "Hi Stacy!"{'}'}'</span>
                      </>
                    )}
                  </pre>
                </div>
              </div>
            </div>
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

const DocFeatureItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
    <div className="shrink-0">{icon}</div>
    <div>
      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
        {title}
        <ChevronRight size={12} className="text-slate-600" />
      </h3>
      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{description}</p>
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

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: any; color: string }> = ({ icon, label, value, color }) => (
  <div className="glass-panel p-5 rounded-2xl border-slate-800 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
    <div className={`p-2.5 rounded-xl ${color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : color === 'purple' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
