
import { GoogleGenAI, GenerateContentResponse, Content, Part } from "@google/genai";
import { Message } from '../types.ts';

// API Key is provided via environment variables, which is handled by the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64Data: string, mimeType: string): Part => {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType
    },
  };
};

export const sendMessageWithGemini = async (
  history: Message[],
  newMessage: string,
  systemInstruction: string | undefined,
  attachment?: { name: string; type: string; data: string }
): Promise<GenerateContentResponse> => {
  
  const geminiHistory: Content[] = history
    .filter(m => m.id !== 'initial-message' && m.type !== 'image')
    .map(msg => {
      const parts: Part[] = [];
      if (msg.attachment && msg.attachment.data) {
        parts.push(fileToGenerativePart(msg.attachment.data, msg.attachment.type));
      }
      if (msg.content) {
          parts.push({ text: msg.content });
      }
      
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: parts.length > 0 ? parts : [{ text: '' }], // Ensure parts is not empty
      };
    });

  const userMessageParts: Part[] = [];
  if (attachment) {
    userMessageParts.push(fileToGenerativePart(attachment.data, attachment.type));
  }
  if (newMessage.trim()) {
    userMessageParts.push({ text: newMessage });
  }

  const contents: Content[] = [...geminiHistory, { role: 'user', parts: userMessageParts }];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
        ...(systemInstruction && { systemInstruction }),
    }
  });

  return response;
};
