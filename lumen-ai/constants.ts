import { Provider, ProviderID } from './types.ts';

export const PROVIDERS: Provider[] = [
  {
    id: ProviderID.GOOGLE_GEMINI,
    name: 'Google Gemini',
    apiUrl: '', // Not used for SDK
    apiType: 'google_gemini',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: ProviderID.GOOGLE_GEMINI },
    ],
  },
  {
    id: ProviderID.POLLINATIONS,
    name: '', // Name is empty to hide the main provider heading
    apiUrl: 'https://api.pollinations.ai/v1/chat/completions',
    apiType: 'openai',
    models: [
      { id: 'openai', name: 'OpenAI', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'ChatGPT' },
      { id: 'openai-fast', name: 'OpenAI Fast', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'ChatGPT' },
      
      { id: 'llama-fast-roblox', name: 'Llama Fast (Roblox)', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'Meta (Llama)' },
      { id: 'llama-roblox', name: 'Llama (Roblox)', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'Meta (Llama)' },
      { id: 'llamascout', name: 'Llama Scout', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'Meta (Llama)' },
      
      { id: 'mistral', name: 'Mistral', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'Mistral AI' },
      { id: 'mistral-roblox', name: 'Mistral (Roblox)', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'Mistral AI' },
            
      { id: 'phi', name: 'Microsoft Phi', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'Microsoft (Phi)' },
      
      { id: 'qwen-coder', name: 'Qwen Coder', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'Alibaba Cloud (Qwen)' },
      
      { id: 'bidara', name: 'Bidara', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'Community Models' },
      { id: 'midijourney', name: 'Midijourney', provider: ProviderID.POLLINATIONS, apiSubtype: 'textgen', group: 'Community Models' },
    ],
  },
  {
    id: ProviderID.DEEPSEEK,
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    apiType: 'openai',
    models: [
      { id: 'deepseek-chat', name: 'Chat', provider: ProviderID.DEEPSEEK },
      { id: 'deepseek-coder', name: 'Coder', provider: ProviderID.DEEPSEEK },
    ],
  },
  {
    id: ProviderID.GROQ,
    name: 'Groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiType: 'openai',
    models: [
      { id: 'llama3-8b-8192', name: 'LLaMA3 8b', provider: ProviderID.GROQ },
      { id: 'llama3-70b-8192', name: 'LLaMA3 70b', provider: ProviderID.GROQ },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7b', provider: ProviderID.GROQ },
    ],
  },
];

export const MODEL_CATEGORIES = {
  CODING: ['deepseek-coder', 'qwen-coder'],
  CREATIVE: ['deepseek-chat'],
  GENERAL: ['llama3-70b-8192', 'mixtral-8x7b-32768'],
};