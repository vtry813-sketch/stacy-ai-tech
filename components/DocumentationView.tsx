
import React from 'react';
import { translations, Language } from '../translations.ts';
import { UserSettings, Page } from '../types.ts';
import { ArrowLeft, Code, Globe, Terminal, Shield, Cpu, BookOpen, MessageCircle } from 'lucide-react';

interface DocumentationViewProps {
  settings: UserSettings;
  setPage: (page: Page) => void;
}

const DocumentationView: React.FC<DocumentationViewProps> = ({ settings, setPage }) => {
  const t = translations[settings.language as Language] || translations.English;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-4">
        <button 
          onClick={() => setPage(Page.Dashboard)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors w-fit px-2"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">{t.docs.back}</span>
        </button>
        <div className="px-2">
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 uppercase">
            {t.docs.title}
          </h1>
          <p className="text-slate-400 text-sm font-medium">{t.docs.subtitle}</p>
        </div>
      </header>

      <div className="space-y-12">
        <DocSection title={t.docs.quickStart} icon={<Terminal className="text-indigo-400" />}>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>To begin integrating Stacy AI into your environment, follow these three simple steps:</p>
            <ol className="list-decimal list-inside space-y-3 pl-2">
              <li><strong>Generate your Key:</strong> Head to the Developer Dashboard and click "Generate Key".</li>
              <li><strong>Configure headers:</strong> Every request to our servers must include the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">Authorization: Bearer YOUR_KEY</code> header.</li>
              <li><strong>Send a POST request:</strong> Target the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">/v1/chat</code> endpoint with a JSON body containing your message.</li>
            </ol>
          </div>
        </DocSection>

        <DocSection title={t.docs.apiRef} icon={<Globe className="text-blue-400" />}>
          <div className="space-y-6">
            <div className="p-5 glass-panel rounded-2xl border-slate-800/40 bg-slate-900/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-2 py-1 rounded uppercase">POST</span>
                <code className="text-xs font-mono text-slate-100">/api/v1/chat</code>
              </div>
              <p className="text-xs text-slate-400 mb-4">Main endpoint for neural conversation tasks.</p>
              
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Request Body</h4>
              <pre className="bg-black/60 p-4 rounded-xl text-[11px] font-mono text-indigo-200 overflow-x-auto">
{`{
  "message": "Hello Stacy!",
  "stream": false,
  "temperature": 0.7
}`}
              </pre>
            </div>

            <div className="p-5 glass-panel rounded-2xl border-slate-800/40 bg-slate-900/30">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Response Format</h4>
              <pre className="bg-black/60 p-4 rounded-xl text-[11px] font-mono text-green-200 overflow-x-auto">
{`{
  "id": "stacy_8f2a...",
  "role": "assistant",
  "content": "Hello! I am ready to assist you.",
  "usage": {
    "total_tokens": 42
  }
}`}
              </pre>
            </div>
          </div>
        </DocSection>

        <DocSection title={t.docs.sdkDocs} icon={<Cpu className="text-purple-400" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SDKCard 
              name="Node.js SDK" 
              install="npm i stacy-sdk" 
              desc="Full support for server-side and client-side applications."
            />
            <SDKCard 
              name="Python SDK" 
              install="pip install stacy-ai" 
              desc="Perfect for data science and AI-powered automation scripts."
            />
          </div>
        </DocSection>

        <DocSection title={t.docs.support} icon={<MessageCircle className="text-pink-400" />}>
          <div className="flex flex-col sm:flex-row gap-4">
             <a href="#" className="flex-1 p-6 glass-panel rounded-2xl border-slate-800/40 hover:border-pink-500/30 bg-slate-900/30 transition-all text-center group">
               <h4 className="text-sm font-bold text-slate-100 group-hover:text-pink-400 transition-colors">Join Discord</h4>
               <p className="text-[10px] text-slate-500 mt-2">Interact with other developers and get direct help.</p>
             </a>
             <a href="#" className="flex-1 p-6 glass-panel rounded-2xl border-slate-800/40 hover:border-blue-500/30 bg-slate-900/30 transition-all text-center group">
               <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">Twitter Feed</h4>
               <p className="text-[10px] text-slate-500 mt-2">Stay updated with the latest Stacy AI releases.</p>
             </a>
          </div>
        </DocSection>
      </div>
    </div>
  );
};

const DocSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="px-2">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 shrink-0">
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <h2 className="text-xl font-bold text-slate-100 uppercase tracking-tight">{title}</h2>
    </div>
    {children}
  </section>
);

const SDKCard: React.FC<{ name: string; install: string; desc: string }> = ({ name, install, desc }) => (
  <div className="p-5 glass-panel rounded-2xl border-slate-800/40 bg-slate-900/30 flex flex-col justify-between">
    <div>
      <h4 className="text-sm font-bold text-slate-100 mb-1">{name}</h4>
      <p className="text-[10px] text-slate-500 mb-4">{desc}</p>
    </div>
    <div className="bg-black/60 rounded-xl p-3 border border-slate-800 font-mono text-[10px] text-indigo-300">
      {install}
    </div>
  </div>
);

export default DocumentationView;
