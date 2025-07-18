

import { PROVIDERS } from '../constants.ts';
import { Model, Message, ProviderID } from '../types.ts';

const HARDCODED_API_KEYS = {
  [ProviderID.POLLINATIONS]: '', // Public models may not require a key
  [ProviderID.DEEPSEEK]: 'sk-4eb89c8260594eee9ef860f4924980fb',
  [ProviderID.GROQ]: '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',
  [ProviderID.OPENROUTER]: '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',
};

export const sendMessage = async (
  model: Model,
  history: Message[],
  newMessage: string,
  systemPrompt?: string,
  isWebSearchEnabled?: boolean
): Promise<string> => {
  const provider = PROVIDERS.find(p => p.id === model.provider);
  if (!provider) {
    throw new Error('Invalid provider selected');
  }

  // Handle Pollinations textgen models which have a different API structure
  if (model.provider === ProviderID.POLLINATIONS && model.apiSubtype === 'textgen') {
    // These models don't support system prompts or history directly.
    // We combine the history and new message into a single prompt for context.
    const filteredHistory = history.filter(m => m.id !== 'initial-message' && m.type !== 'image');

    const fullPrompt = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...filteredHistory, 
        { role: 'user', content: newMessage }
    ]
    .map(m => `${m.role}: ${m.content}`)
    .join('\n\n');

    const encodedPrompt = encodeURIComponent(fullPrompt);
    const url = `https://text.pollinations.ai/${encodedPrompt}?model=${model.id}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText || 'Unknown error'}`);
        }
        return await response.text();
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Network or API call failed: ${error.message}`);
        }
        throw new Error('An unknown error occurred during the API call.');
    }
  }

  // --- OpenAI-compatible API logic ---
  const apiKey = HARDCODED_API_KEYS[model.provider as keyof typeof HARDCODED_API_KEYS];
  if (apiKey === undefined) {
    throw new Error(`API key for ${model.provider} is missing.`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  if(model.provider === ProviderID.OPENROUTER) {
      headers['HTTP-Referer'] = 'http://localhost:3000'; // Or your app's URL
      headers['X-Title'] = 'Lumen AI';
  }

  const formattedHistory = history.map(msg => {
    if (msg.type === 'image') {
      return {
        role: msg.role,
        content: "[An image was generated here in response to the user's prompt.]",
      };
    }
    return { role: msg.role, content: msg.content };
  });

  const userMessageContent = isWebSearchEnabled
    ? `Please perform a web search to find the most current and relevant information to answer the following user query. After your search, synthesize the findings to provide a comprehensive answer. At the end of your response, you MUST list all the source URLs you used under a heading 'Sources:'.\n\nUser Query: "${newMessage}"`
    : newMessage;

  const messagesForAPI = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...formattedHistory,
    { role: 'user', content: userMessageContent },
  ];

  const body = JSON.stringify({
    model: model.id,
    messages: messagesForAPI,
    max_tokens: 4096,
    stream: false,
  });

  try {
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't get a response.";

  } catch (error) {
    if (error instanceof Error) {
        throw new Error(`Network or API call failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during the API call.');
  }
};

export const generateImage = (
  prompt: string,
  aspectRatio: string,
  model: string
): string => {
  const [w, h] = aspectRatio.split(':').map(Number);
  const baseSize = 1024;
  let width, height;

  if (w > h) {
    width = baseSize;
    height = Math.round((baseSize * h) / w);
  } else {
    height = baseSize;
    width = Math.round((baseSize * w) / h);
  }

  // Ensure dimensions are divisible by 8 for compatibility with some models
  width = Math.round(width / 8) * 8;
  height = Math.round(height / 8) * 8;

  const seed = Math.floor(Math.random() * 100000);
  const encodedPrompt = encodeURIComponent(prompt);
  
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;

  return imageUrl;
};
