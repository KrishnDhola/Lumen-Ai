import React from 'react';
import { BotIcon } from './icons/BotIcon.tsx';
import { ChatSession } from '../types.ts';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { XIcon } from './icons/XIcon.tsx';

interface SidebarProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onNavigateToAssistants: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sessions, activeSessionId, onNewChat, onSelectSession, onDeleteSession, isOpen, onClose, onNavigateToAssistants }) => {
  return (
    <aside 
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-base-100 p-4 flex flex-col gap-4 border-r-2 border-neutral h-full transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <BotIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-base-content">Lumen AI</h1>
        </div>
        <button onClick={onClose} className="p-2 md:hidden text-neutral-content hover:text-base-content">
            <XIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex flex-col gap-2">
        <button 
          onClick={onNewChat}
          className="btn w-full justify-center bg-base-200 border-2 border-neutral hover:border-primary-focus hover:bg-base-300 text-base-content font-bold"
        >
          New Chat
        </button>

        <button
          onClick={onNavigateToAssistants}
          className="btn w-full justify-center bg-base-200 border-2 border-neutral hover:border-primary-focus hover:bg-base-300 text-base-content font-bold"
        >
          Assistants
        </button>
      </div>

      <h2 className="text-lg font-serif font-bold text-base-content/80 mt-2 px-2">History</h2>
      <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-2">
        {sessions.map(session => (
            <div key={session.id} className="relative group">
                <button
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full text-left p-3 rounded-[0.625rem] font-semibold truncate transition-colors duration-200 ${
                        session.id === activeSessionId
                        ? 'bg-primary/30 text-primary-content'
                        : 'text-base-content/80 hover:bg-base-200'
                    }`}
                >
                    {session.title}
                </button>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-neutral-content opacity-0 group-hover:opacity-100 hover:bg-error/20 hover:text-error transition-opacity"
                    aria-label="Delete chat"
                >
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
        ))}
      </div>
    </aside>
  );
};