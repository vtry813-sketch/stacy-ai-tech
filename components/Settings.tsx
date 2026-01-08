
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { translations, Language } from '../translations';
import { 
  User, 
  Moon, 
  Sun, 
  Brain, 
  Save, 
  Palette, 
  Volume2, 
  VolumeX, 
  Trash2, 
  CheckCircle2, 
  Info,
  Globe
} from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
  onClearHistory: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClearHistory }) => {
  const t = translations[settings.language as Language] || translations.French;
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: keyof UserSettings, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            {t.settings.title}
          </h1>
          <p className="text-slate-400 text-xs">{t.settings.subtitle}</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full animate-in zoom-in duration-300">
            <CheckCircle2 size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{t.settings.applied}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-5">
        {/* Identité Section */}
        <SettingSection 
          title={t.settings.identity} 
          description={t.settings.identityDesc}
          icon={<User className="text-indigo-400" size={16} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t.settings.userName}</label>
              <input 
                type="text" 
                value={settings.userName}
                onChange={(e) => handleChange('userName', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-all shadow-inner placeholder:text-slate-600"
                placeholder="Ex: John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t.settings.langLabel}</label>
              <div className="relative">
                <select 
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition-all shadow-inner appearance-none cursor-pointer"
                >
                  <option value="French">Français</option>
                  <option value="English">English</option>
                  <option value="Spanish">Español</option>
                  <option value="German">Deutsch</option>
                </select>
                <Globe size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Intelligence Section */}
        <SettingSection 
          title={t.settings.intel} 
          description={t.settings.intelDesc}
          icon={<Brain className="text-purple-400" size={16} />}
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t.settings.creativity}</label>
                <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">{settings.temperature}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={settings.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-600 uppercase">
                <span>{t.settings.prec}</span>
                <span>{t.settings.crea}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t.settings.perso}</label>
              <textarea 
                rows={2}
                value={settings.personality}
                onChange={(e) => handleChange('personality', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2 text-slate-100 outline-none focus:border-purple-500/50 transition-all resize-none shadow-inner text-sm leading-relaxed"
                placeholder={t.settings.persoPlaceholder}
              />
            </div>
          </div>
        </SettingSection>

        {/* Interface Section */}
        <SettingSection 
          title={t.settings.prefs} 
          description={t.settings.prefsDesc}
          icon={<Palette className="text-blue-400" size={16} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToggleRow 
              icon={settings.theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              label={t.settings.dark}
              active={settings.theme === 'dark'}
              onToggle={() => handleChange('theme', settings.theme === 'dark' ? 'light' : 'dark')}
              colorClass="bg-indigo-600"
            />
            <ToggleRow 
              icon={settings.voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              label={t.settings.audio}
              active={settings.voiceEnabled}
              onToggle={() => handleChange('voiceEnabled', !settings.voiceEnabled)}
              colorClass="bg-blue-600"
            />
          </div>
        </SettingSection>

        {/* Danger Zone - Global History Deletion */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <Trash2 size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-200 leading-none">{t.settings.dangerTitle}</p>
              <p className="text-[10px] text-red-400/60 mt-1">{t.settings.dangerDesc}</p>
            </div>
          </div>
          <button 
            onClick={onClearHistory}
            className="px-4 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg shadow-red-900/10 active:scale-95 whitespace-nowrap"
          >
            {t.settings.deleteAll}
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-2 px-2">
          <div className="flex items-center gap-2 text-slate-600 text-[10px] font-medium italic">
            <Info size={12} />
            <span>{t.settings.savedLocally}</span>
          </div>
          <button 
            onClick={handleSave}
            className="group flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold transition-all shadow-md active:scale-95"
          >
            <Save size={14} className="group-hover:scale-110 transition-transform" />
            {t.settings.save}
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingSection: React.FC<{ title: string; description: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, description, icon, children }) => (
  <section className="glass-panel p-5 rounded-2xl border-slate-800/40 bg-slate-900/30 shadow-sm">
    <div className="flex gap-3 mb-4">
      <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-700/50 shrink-0 h-fit">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-100">{title}</h2>
        <p className="text-[10px] text-slate-500">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const ToggleRow: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onToggle: () => void; colorClass: string }> = ({ icon, label, active, onToggle, colorClass }) => (
  <div className="flex items-center justify-between p-2.5 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="text-slate-500">
        {icon}
      </div>
      <span className="font-bold text-[11px] text-slate-300">{label}</span>
    </div>
    <button 
      onClick={onToggle}
      className={`w-8 h-4.5 rounded-full p-0.5 transition-all relative ${active ? colorClass : 'bg-slate-700'}`}
    >
      <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 shadow-sm ${active ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
    </button>
  </div>
);

export default Settings;
