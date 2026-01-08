
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message, UserSettings } from '../types.ts';
import { User, Sparkles, ArrowUpCircle, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import { streamStacyResponse, generateStacyImage } from '../services/geminiService.ts';
import { translations, Language } from '../translations.ts';

interface ChatViewProps {
  session: ChatSession | undefined;
  settings: UserSettings;
  updateMessages: (messages: Message[]) => void;
  avatar: string;
  onConsume: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ session, settings, updateMessages, avatar, onConsume }) => {
  const t = translations[settings.language as Language] || translations.English;
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isTyping]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [session?.id]);

  const checkIfImageRequest = (text: string): boolean => {
    const lowText = text.toLowerCase();
    return lowText.startsWith('/image') || 
           lowText.includes('génère une image') || 
           lowText.includes('dessine') || 
           lowText.includes('generate image') || 
           lowText.includes('draw');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const currentMessages = [...session.messages, userMessage];
    updateMessages(currentMessages);
    const userPrompt = input;
    setInput('');
    setIsTyping(true);

    // Détection de demande d'image
    if (checkIfImageRequest(userPrompt)) {
      try {
        const assistantMessageId = (Date.now() + 1).toString();
        // Message d'attente
        const waitingMsg: Message = { 
          id: assistantMessageId, 
          role: 'assistant', 
          content: "🎨 Stacy est en train de créer votre image...", 
          timestamp: Date.now() 
        };
        updateMessages([...currentMessages, waitingMsg]);

        const imageUrl = await generateStacyImage(userPrompt.replace('/image', '').trim());
        
        const finalMsg: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: `![Generated Image](${imageUrl})`,
          timestamp: Date.now()
        };
        updateMessages([...currentMessages, finalMsg]);
        onConsume();
      } catch (error) {
        console.error(error);
        updateMessages([...currentMessages, { id: Date.now().toString(), role: 'assistant', content: "Désolée, je n'ai pas pu générer cette image.", timestamp: Date.now() }]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Traitement texte standard
    const history = session.messages.map(m => ({
      role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: m.content }]
    }));

    try {
      let assistantResponse = "";
      const assistantMessageId = (Date.now() + 1).toString();
      const initialAssistantMsg: Message = { id: assistantMessageId, role: 'assistant', content: '', timestamp: Date.now() };
      updateMessages([...currentMessages, initialAssistantMsg]);

      await streamStacyResponse(
        userPrompt,
        history,
        `You are Stacy AI, a world-class personal assistant. You are multilingual and can communicate fluently in any language. Personality: ${settings.personality}. Always respond in the language the user uses. Use Markdown for formatting.`,
        (chunk) => {
          assistantResponse += chunk;
          updateMessages([...currentMessages, { ...initialAssistantMsg, content: assistantResponse }]);
        },
        settings.temperature
      );

      if (settings.voiceEnabled && assistantResponse) {
        const utterance = new SpeechSynthesisUtterance(assistantResponse);
        utterance.lang = settings.language === 'French' ? 'fr-FR' : 
                       settings.language === 'Spanish' ? 'es-ES' :
                       settings.language === 'German' ? 'de-DE' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
      onConsume();
    } catch (error) {
      console.error(error);
      updateMessages([...currentMessages, { id: Date.now().toString(), role: 'assistant', content: t.chat.error, timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderContent = (content: string) => {
    // Check if content is a markdown image
    const imgRegex = /!\[.*?\]\((data:image\/.*?;base64,.*?)\)/;
    const match = content.match(imgRegex);

    if (match && match[1]) {
      const base64Data = match[1];
      return (
        <div className="flex flex-col gap-3">
          <div className="relative group overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <img src={base64Data} className="w-full h-auto max-w-sm rounded-lg" alt="Stacy Generated" />
            <a 
              href={base64Data} 
              download="stacy-gen.png" 
              className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download size={16} />
            </a>
          </div>
          <p className="text-[10px] text-slate-500 italic">Image générée par Stacy IA</p>
        </div>
      );
    }

    return <div className="whitespace-pre-wrap break-words">{content}</div>;
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-0 text-slate-500 animate-in fade-in duration-700 px-4">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-indigo-500/5 flex items-center justify-center mb-6">
          <Sparkles className="text-indigo-500 opacity-40 w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-300 mb-2 text-center">{t.chat.readyToHelp}</h2>
        <p className="text-xs md:text-sm max-w-xs text-center opacity-60">{t.chat.selectChat}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-4xl mx-auto overflow-hidden bg-transparent">
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 md:px-6 pt-4 md:pt-6 pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent min-h-0"
      >
        {session.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full opacity-60 space-y-6 md:space-y-8 py-10 px-4">
             <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 rounded-full"></div>
                <img src={avatar} className="relative w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] object-cover shadow-2xl border border-slate-700/50" />
             </div>
             <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-slate-200">{t.chat.welcome}</h3>
                <p className="text-sm md:text-base text-slate-400 mt-1 md:mt-2">{t.chat.howHelp}</p>
             </div>
             <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl">
                <QuickPrompt icon={<ImageIcon size={14}/>} text="Génère une image" onClick={() => setInput('/image ')} />
                <QuickPrompt icon={<Sparkles size={14}/>} text={t.chat.prompts.story} onClick={() => setInput(t.chat.prompts.story)} />
                <QuickPrompt icon={<User size={14}/>} text={t.chat.prompts.complex} onClick={() => setInput(t.chat.prompts.complex)} />
                <QuickPrompt icon={<Download size={14}/>} text={t.chat.prompts.code} onClick={() => setInput(t.chat.prompts.code)} />
             </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {session.messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl overflow-hidden shrink-0 mt-1 shadow-lg border border-slate-700">
                    <img src={avatar} alt="Stacy" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className={`
                  max-w-[88%] xs:max-w-[85%] md:max-w-[80%] px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl leading-relaxed shadow-sm text-[14px] md:text-[15px]
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800/60 border border-slate-700/40 text-slate-100 rounded-tl-none'}
                `}>
                  {renderContent(msg.content) || (isTyping && msg.role === 'assistant' ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    </div>
                  ) : null)}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                    <User size={14} className="text-indigo-400" />
                  </div>
                )}
              </div>
            ))}
            <div className="h-4" />
          </div>
        )}
      </div>

      <div className="w-full bg-transparent px-3 md:px-6 pt-2 pb-6 md:pb-10 shrink-0 z-20">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
          <div className="relative flex items-end gap-2 bg-slate-800/60 backdrop-blur-xl border border-slate-700/80 rounded-2xl md:rounded-[2rem] p-2 md:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:border-indigo-500/50 focus-within:bg-slate-800/80 transition-all duration-300">
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={t.chat.placeholder}
              className="flex-1 bg-transparent border-none outline-none px-3 py-2 md:px-4 text-slate-100 placeholder:text-slate-600 resize-none max-h-[200px] text-[15px] md:text-[16px] leading-relaxed"
              disabled={isTyping}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all flex items-center justify-center mb-1 shadow-lg ${!input.trim() || isTyping ? 'bg-slate-700/50 text-slate-500 opacity-20 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95'}`}
            >
              {isTyping ? <Loader2 size={22} className="animate-spin" /> : <ArrowUpCircle size={22} fill="currentColor" />}
            </button>
          </div>
          <p className="text-[9px] text-center text-slate-600 mt-2 font-black tracking-[0.2em] uppercase opacity-30">{t.chat.engineInfo}</p>
        </form>
      </div>
    </div>
  );
};

const QuickPrompt: React.FC<{ icon: React.ReactNode, text: string; onClick: () => void }> = ({ icon, text, onClick }) => (
  <button 
    onClick={onClick}
    className="px-3 py-2.5 md:px-4 md:py-3 bg-slate-800/30 border border-slate-700/40 rounded-xl md:rounded-2xl text-left text-[12px] md:text-[13px] text-slate-300 hover:bg-slate-800/60 hover:border-indigo-500/40 transition-all shadow-md group flex items-center gap-2"
  >
    <span className="text-indigo-400 group-hover:scale-110 transition-transform">{icon}</span>
    <span className="truncate font-medium flex-1">{text}</span>
  </button>
);

export default ChatView;
