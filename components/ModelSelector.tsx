import React, { useState, useRef, useEffect } from 'react';
import { CustomAssistant, Model } from '../types.ts';
import { PROVIDERS } from '../constants.ts';

interface ModelSelectorProps {
  activeModelId: string | null;
  onModelSelect: (modelId: string) => void;
  customAssistants: CustomAssistant[];
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ activeModelId, onModelSelect, customAssistants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const allModels = PROVIDERS.flatMap(p => p.models);
  const allItems = [...customAssistants, ...allModels];
  const selectedItem = activeModelId === 'auto' 
    ? { name: 'Auto (Default)' } 
    : allItems.find(item => item.id === activeModelId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (id: string) => {
    onModelSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-56" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input h-12 px-3 flex items-center justify-between bg-base-200 border-2 border-neutral rounded-[0.625rem] focus:border-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-left"
      >
        <span className="font-bold text-base-content truncate">{selectedItem?.name || 'Select a model'}</span>
        <svg className={`w-5 h-5 text-neutral-content transition-transform duration-200 ml-2 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full bg-base-100 border-2 border-neutral rounded-[0.625rem] shadow-lg z-20 max-h-72 overflow-y-auto">
          <div className="border-b border-neutral/50">
             <button
                key="auto"
                onClick={() => handleSelect('auto')}
                className="w-full text-left px-4 py-2 text-base-content hover:bg-base-200"
              >
                <span className="font-bold">Auto (Default)</span>
              </button>
          </div>
          {customAssistants.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-bold text-base-content/60 border-t border-neutral/50">Custom Assistants</div>
              {customAssistants.map(assistant => (
                <button
                  key={assistant.id}
                  onClick={() => handleSelect(assistant.id)}
                  className="w-full text-left px-4 py-2 hover:bg-base-200"
                >
                  <span className="font-medium">{assistant.name}</span>
                </button>
              ))}
            </div>
          )}
          {PROVIDERS.map(provider => {
            const modelsByGroup = provider.models.reduce((acc, model) => {
              const groupName = model.group || ' ';
              if (!acc[groupName]) {
                acc[groupName] = [];
              }
              acc[groupName].push(model);
              return acc;
            }, {} as Record<string, Model[]>);

            const groupOrder = ['ChatGPT', 'Chat Models', 'Meta (Llama)', 'Mistral AI', 'DeepSeek', 'Microsoft (Phi)', 'Alibaba Cloud (Qwen)', 'Community Models', ' '];
            const sortedGroupNames = Object.keys(modelsByGroup).sort((a, b) => {
                const indexA = groupOrder.indexOf(a);
                const indexB = groupOrder.indexOf(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });

            return (
              <div key={provider.id}>
                {provider.name && <div className="px-4 py-2 text-sm font-bold text-base-content/60 border-t border-neutral/50">{provider.name}</div>}
                
                {sortedGroupNames.map(groupName => (
                  <React.Fragment key={groupName}>
                    {groupName.trim() && (
                      <div className="px-4 pt-2 pb-1 text-xs font-semibold text-base-content/50 uppercase tracking-wider">{groupName}</div>
                    )}
                    {modelsByGroup[groupName].map(model => (
                      <button
                        key={model.id}
                        onClick={() => handleSelect(model.id)}
                        className="w-full text-left px-4 py-2 text-base-content hover:bg-base-200"
                      >
                        <span className="font-medium">{model.name}</span>
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};