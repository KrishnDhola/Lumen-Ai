import React from 'react';
import { prebuiltAssistants } from '../data/prebuiltAssistants.ts';
import { CustomAssistant, PrebuiltAssistant } from '../types.ts';
import { BotIcon } from './icons/BotIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { CreativeWriterIcon } from './icons/assistants/CreativeWriterIcon.tsx';
import { CodeOptimizerIcon } from './icons/assistants/CodeOptimizerIcon.tsx';
import { SocraticTutorIcon } from './icons/assistants/SocraticTutorIcon.tsx';
import { EmailPolisherIcon } from './icons/assistants/EmailPolisherIcon.tsx';
import { ELI5BotIcon } from './icons/assistants/ELI5BotIcon.tsx';
import { HaikuPoetIcon } from './icons/assistants/HaikuPoetIcon.tsx';
import { TechNewsSummarizerIcon } from './icons/assistants/TechNewsSummarizerIcon.tsx';
import { YouTubeIcon } from './icons/assistants/YouTubeIcon.tsx';

interface AssistantsGalleryProps {
    onClose: () => void;
    onAddAssistant: (assistant: PrebuiltAssistant) => void;
    myAssistants: CustomAssistant[];
    onDeleteAssistant: (assistantId: string) => void;
    onEditAssistant: (assistant: CustomAssistant) => void;
    onCreateAssistant: () => void;
}

const assistantIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  'Creative Writer': CreativeWriterIcon,
  'Code Optimizer': CodeOptimizerIcon,
  'Socratic Tutor': SocraticTutorIcon,
  'Email Polisher': EmailPolisherIcon,
  'ELI5 Bot': ELI5BotIcon,
  'Haiku Poet': HaikuPoetIcon,
  'Tech News Summarizer': TechNewsSummarizerIcon,
  'YouTube SEO Expert': YouTubeIcon,
};

const AssistantCard: React.FC<{
    assistant: CustomAssistant | PrebuiltAssistant,
    icon: React.ReactNode,
    isAdded?: boolean,
    onAdd?: () => void,
    onEdit?: () => void,
    onDelete?: () => void,
}> = ({ assistant, icon, isAdded, onAdd, onEdit, onDelete }) => {

    const getDescription = () => {
        // Pre-built assistants have a dedicated description field.
        if ('description' in assistant && assistant.description) {
            return assistant.description;
        }
        // Custom assistants use their system prompt. We truncate it for the card view.
        const prompt = assistant.systemPrompt;
        if (prompt.length > 120) {
            return prompt.substring(0, 120) + '...';
        }
        return prompt;
    };

    return (
        <div className="card bg-base-100 border-2 border-neutral p-6 flex flex-col gap-4 rounded-[0.625rem] transition-shadow hover:shadow-xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center flex-shrink-0 border-2 border-neutral">
                    {icon}
                </div>
                <h3 className="text-xl font-bold font-serif text-base-content">{assistant.name}</h3>
            </div>
            <p className="text-base-content/80 font-medium flex-1">
                {getDescription()}
            </p>
            <div className="flex items-center gap-2 mt-2">
                {onAdd && (
                    <button
                        onClick={onAdd}
                        disabled={isAdded}
                        className="btn flex-1 bg-primary text-primary-content border-2 border-primary-focus shadow-primary disabled:bg-base-300 disabled:text-base-content/60 disabled:shadow-none disabled:border-neutral"
                    >
                        {isAdded ? 'Added' : 'Add to My List'}
                    </button>
                )}
                {onEdit && (
                     <button onClick={onEdit} className="btn p-0 h-11 w-11 flex-shrink-0 bg-base-200 border-2 border-neutral hover:border-primary-focus">
                        <EditIcon className="w-5 h-5"/>
                    </button>
                )}
                {onDelete && (
                    <button onClick={onDelete} className="btn p-0 h-11 w-11 flex-shrink-0 bg-base-200 border-2 border-neutral hover:border-error/80 hover:bg-error/10">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                )}
            </div>
        </div>
    );
}

export const AssistantsGallery: React.FC<AssistantsGalleryProps> = ({ 
    onClose, 
    onAddAssistant, 
    myAssistants,
    onDeleteAssistant,
    onEditAssistant,
    onCreateAssistant
}) => {
    
    const existingAssistantNames = new Set(myAssistants.map(a => a.name));

    return (
        <div className="flex-1 flex flex-col h-full bg-base-200/50">
            <header className="p-4 border-b-2 border-neutral bg-base-100/80 backdrop-blur-sm z-10 flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold font-serif text-base-content">Assistants</h1>
                <button 
                    onClick={onClose}
                    className="btn bg-base-200 border-2 border-neutral hover:border-primary-focus hover:bg-base-300 text-base-content font-bold"
                >
                    Back to Chat
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                
                {/* My Assistants Section */}
                <div className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-bold font-serif text-base-content">My Assistants</h2>
                        <button 
                            onClick={onCreateAssistant}
                            className="btn bg-primary text-primary-content border-primary-focus shadow-primary"
                        >
                            Create New Assistant
                        </button>
                    </div>
                     {myAssistants.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myAssistants.map((assistant) => (
                                <AssistantCard 
                                    key={assistant.id}
                                    assistant={assistant}
                                    icon={<BotIcon className="w-6 h-6 text-primary" />}
                                    onEdit={() => onEditAssistant(assistant)}
                                    onDelete={() => onDeleteAssistant(assistant.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-4 rounded-lg bg-base-100 border-2 border-dashed border-neutral">
                            <p className="font-medium text-base-content/80">You haven't added any assistants yet.</p>
                            <p className="text-sm text-base-content/60">Create one or add one from the gallery below.</p>
                        </div>
                    )}
                </div>

                {/* Discover Section */}
                <div>
                    <h2 className="text-2xl font-bold font-serif text-base-content mb-6">Discover</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {prebuiltAssistants.map((assistant) => {
                            const IconComponent = assistantIcons[assistant.name] || BotIcon;
                            return (
                                <AssistantCard
                                    key={assistant.name}
                                    assistant={assistant}
                                    icon={<IconComponent className="w-6 h-6 text-primary" />}
                                    isAdded={existingAssistantNames.has(assistant.name)}
                                    onAdd={() => onAddAssistant(assistant)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};