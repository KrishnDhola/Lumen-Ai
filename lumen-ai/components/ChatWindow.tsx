


import React, { useEffect, useRef } from 'react';
import { Message, CustomAssistant } from '../types.ts';
import { Message as MessageComponent } from './Message.tsx';
import { ChatInput } from './ChatInput.tsx';
import { ModelSelector } from './ModelSelector.tsx';
import { MenuIcon } from './icons/MenuIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (input: string, mode: 'text' | 'image', aspectRatio: string, isWebSearchEnabled: boolean, imageModel: string, attachment: File | null) => void;
  activeModelId: string | null;
  onModelSelect: (modelId: string) => void;
  customAssistants: CustomAssistant[];
  onMenuClick: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, activeModelId, onModelSelect, customAssistants, onMenuClick }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-base-200/50">
      <header className="p-4 border-b-2 border-neutral bg-base-100/80 backdrop-blur-sm z-10 flex items-center justify-between gap-4">
        <div className='flex items-center gap-4 flex-1 min-w-0'>
            <button onClick={onMenuClick} className="p-2 md:hidden text-base-content hover:bg-base-200 rounded-md">
                <MenuIcon className="w-6 h-6" />
            </button>
            <ModelSelector 
              activeModelId={activeModelId} 
              onModelSelect={onModelSelect} 
              customAssistants={customAssistants}
            />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageComponent key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="group flex items-start gap-3 justify-start">
              <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center flex-shrink-0 border-2 border-neutral">
                <BotIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="p-4 rounded-[0.625rem] border-2 bg-base-100 text-base-content border-neutral font-medium flex items-center gap-3">
                <SpinnerIcon className="w-5 h-5" />
                <span className="font-bold">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 md:p-6 border-t-2 border-neutral bg-base-100/80 backdrop-blur-sm">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};