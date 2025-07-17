import React, { useState, useEffect } from 'react';
import { CustomAssistant } from '../types.ts';
import { PROVIDERS } from '../constants.ts';
import { XIcon } from './icons/XIcon.tsx';

interface AssistantEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assistantData: Omit<CustomAssistant, 'id'> & { id?: string }) => void;
  assistantToEdit: CustomAssistant | null;
}

const allModels = PROVIDERS.flatMap(p => p.models);

export const AssistantEditorModal: React.FC<AssistantEditorModalProps> = ({ isOpen, onClose, onSave, assistantToEdit }) => {
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [baseModelId, setBaseModelId] = useState('auto');

  useEffect(() => {
    if (assistantToEdit) {
      setName(assistantToEdit.name);
      setSystemPrompt(assistantToEdit.systemPrompt);
      setBaseModelId(assistantToEdit.baseModelId);
    } else {
      setName('');
      setSystemPrompt('');
      setBaseModelId('auto');
    }
  }, [assistantToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) {
        alert('Please fill out all fields.');
        return;
    }
    onSave({
      id: assistantToEdit?.id,
      name,
      systemPrompt,
      baseModelId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-base-100 rounded-[0.625rem] border-2 border-neutral shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-serif text-base-content">
                {assistantToEdit ? 'Edit Assistant' : 'Create Assistant'}
            </h2>
            <button onClick={onClose} className="p-2 text-neutral-content hover:text-base-content">
                <XIcon className="w-6 h-6"/>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 -mr-2">
            <div>
                <label htmlFor="assistant-name" className="block text-sm font-bold text-base-content/80 mb-2">Name</label>
                <input
                    id="assistant-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Python Expert"
                    className="input w-full bg-base-200 border-2 border-neutral rounded-[0.625rem] focus:border-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                />
            </div>
            <div>
                <label htmlFor="system-prompt" className="block text-sm font-bold text-base-content/80 mb-2">System Prompt</label>
                <textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant that specializes in..."
                    className="input w-full bg-base-200 border-2 border-neutral rounded-[0.625rem] focus:border-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[150px] py-2"
                    required
                />
            </div>
            <div>
                <label htmlFor="base-model" className="block text-sm font-bold text-base-content/80 mb-2">Base Model</label>
                <select
                    id="base-model"
                    value={baseModelId}
                    onChange={(e) => setBaseModelId(e.target.value)}
                    className="w-full input bg-base-200 border-2 border-neutral rounded-[0.625rem] focus:border-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="auto">Auto (Recommended)</option>
                    {PROVIDERS.map(provider => (
                        <optgroup label={provider.name} key={provider.id}>
                            {provider.models.map(model => (
                                <option key={model.id} value={model.id}>{model.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>
        </form>
        
        <div className="flex justify-end gap-3 pt-4 border-t-2 border-neutral">
            <button onClick={onClose} className="btn bg-base-200 border-neutral">Cancel</button>
            <button onClick={handleSubmit} className="btn bg-primary text-primary-content border-primary-focus shadow-primary">Save Assistant</button>
        </div>
      </div>
    </div>
  );
};