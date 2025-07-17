


export interface Model {
  id: string;
  name: string;
  provider: ProviderID;
  apiSubtype?: 'chat' | 'textgen';
  group?: string;
}

export enum ProviderID {
  POLLINATIONS = 'pollinations',
  GOOGLE_GEMINI = 'google_gemini',
  DEEPSEEK = 'deepseek',
  GROQ = 'groq',
  OPENROUTER = 'openrouter',
}

export interface Provider {
  id: ProviderID;
  name: string;
  apiUrl: string;
  models: Model[];
  apiType?: 'openai' | 'google_gemini';
}

export interface Message {
  id:string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  aspectRatio?: string;
  attachment?: {
    name: string;
    type: string; // MIME type
    data: string; // base64 data URL
  };
}

export interface CustomAssistant {
  id:string;
  name: string;
  systemPrompt: string;
  baseModelId: string;
}

export interface PrebuiltAssistant {
  name: string;
  description: string;
  systemPrompt: string;
  baseModelId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  modelId: string; // Can be a standard model ID or a CustomAssistant ID
}

export interface TTSVoice {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
}