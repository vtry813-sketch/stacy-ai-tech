
import React from 'react';
import { ArrowRight, Sparkles, Bot, Zap, Smartphone, Download } from 'lucide-react';
import { UserSettings } from '../types';
import { translations, Language } from '../translations';

interface HomeProps {
  onStart: () => void;
  avatar: string;
  settings: UserSettings;
}

const Home: React.FC<HomeProps> = ({ onStart, avatar, settings }) => {
  const t = translations[settings.language as Language] || translations.French;

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-6 md:py-12 text-center animate-in fade-in duration-700">
      <div className="relative mb-6 md:mb-10 group">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity"></div>
        <img 
          src={avatar} 
          alt="Stacy AI" 
          className="relative w-40 h-40 xs:w-48 xs:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 object-cover rounded-full border-4 border-slate-900 shadow-2xl transform transition-transform group-hover:scale-[1.02]"
        />
        <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-white p-2 md:p-4 rounded-2xl md:rounded-3xl shadow-2xl text-indigo-600">
          <Sparkles size={20} className="md:w-7 md:h-7" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tighter leading-tight">
        {t.home.title} <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-300 to-purple-400">Stacy AI</span>
      </h1>
      
      <p className="text-sm md:text-lg lg:text-xl text-slate-400 max-w-2xl mb-8 md:mb-12 px-4 leading-relaxed font-medium">
        {t.home.subtitle}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-12 md:mb-20 px-6 w-full max-w-md sm:max-w-none">
        <button 
          onClick={onStart}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 md:px-10 md:py-5 bg-white text-indigo-900 rounded-[1.5rem] md:rounded-[2rem] font-black text-base md:text-lg transition-all transform hover:scale-105 hover:shadow-2xl active:scale-95"
        >
          {t.home.cta}
          <ArrowRight size={20} className="md:w-5 md:h-5" />
        </button>
        <div className="flex items-center gap-1.5 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs md:text-sm font-bold">
          <Smartphone size={14} className="md:w-4 md:h-4" />
          <span>{t.home.readyAndroid}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl px-4">
        <FeatureCard 
          icon={<Bot className="text-indigo-400" />} 
          title={t.home.feat1Title} 
          description={t.home.feat1Desc}
        />
        <FeatureCard 
          icon={<Zap className="text-purple-400" />} 
          title={t.home.feat2Title} 
          description={t.home.feat2Desc}
        />
        <FeatureCard 
          icon={<Download className="text-blue-400" />} 
          title={t.home.feat3Title} 
          description={t.home.feat3Desc}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; className?: string }> = ({ icon, title, description, className = "" }) => (
  <div className={`glass-panel p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-left border-slate-800/50 hover:border-indigo-500/40 transition-all group ${className}`}>
    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform">
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <h3 className="text-lg md:text-xl font-black mb-1.5 md:mb-2 text-slate-100">{title}</h3>
    <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">{description}</p>
  </div>
);

export default Home;
