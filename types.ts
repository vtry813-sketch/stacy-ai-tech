
export enum Page {
  Home = 'home',
  Chat = 'chat',
  Dashboard = 'dashboard',
  Settings = 'settings',
  Documentation = 'documentation'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface UserSettings {
  userName: string;
  apiKey: string | null;
  theme: 'dark' | 'light';
  personality: string;
  language: string;
  temperature: number;
  voiceEnabled: boolean;
  usage: number; // Nombre de messages envoyés
  quota: number; // Limite totale autorisée
}
