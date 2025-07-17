



import React, { useState, useRef } from 'react';
import { SendIcon } from './icons/SendIcon.tsx';
import { ImageIcon } from './icons/ImageIcon.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { ToggleSwitch } from './ToggleSwitch.tsx';
import { AspectRatio1x1Icon } from './icons/aspect-ratio/AspectRatio1x1Icon.tsx';
import { AspectRatio16x9Icon } from './icons/aspect-ratio/AspectRatio16x9Icon.tsx';
import { AspectRatio9x16Icon } from './icons/aspect-ratio/AspectRatio9x16Icon.tsx';
import { AspectRatio4x3Icon } from './icons/aspect-ratio/AspectRatio4x3Icon.tsx';
import { AspectRatio3x4Icon } from './icons/aspect-ratio/AspectRatio3x4Icon.tsx';
import { ClipIcon } from './icons/ClipIcon.tsx';
import { XIcon } from './icons/XIcon.tsx';
import { FileIcon } from './icons/FileIcon.tsx';

interface ChatInputProps {
  onSendMessage: (input: string, mode: 'text' | 'image', aspectRatio: string, isWebSearchEnabled: boolean, imageModel: string, attachment: File | null) => void;
  isLoading: boolean;
}

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const IMAGE_MODELS = ['flux', 'turbo', 'gptimage'];

const ASPECT_RATIO_ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  '1:1': AspectRatio1x1Icon,
  '16:9': AspectRatio16x9Icon,
  '9:16': AspectRatio9x16Icon,
  '4:3': AspectRatio4x3Icon,
  '3:4': AspectRatio3x4Icon,
};

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageModel, setImageModel] = useState(IMAGE_MODELS[0]);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      setMode('text');
    }
    if (e.target) e.target.value = '';
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachedFile) && !isLoading) {
      onSendMessage(input, mode, aspectRatio, isWebSearchEnabled, imageModel, attachedFile);
      setInput('');
      handleRemoveFile();
    }
  };

  return (
    <div>
      {attachedFile && (
        <div className="mb-3 p-2 bg-base-300/50 border-2 border-neutral rounded-lg flex items-center gap-3">
            {filePreview ? (
                <img src={filePreview} alt="Preview" className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
            ) : (
                <div className="w-12 h-12 rounded-md bg-base-200 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-8 h-8 text-neutral-content" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-base-content truncate">{attachedFile.name}</p>
                <p className="text-sm text-neutral-content">{Math.round(attachedFile.size / 1024)} KB</p>
            </div>
            <button type="button" onClick={handleRemoveFile} className="p-1.5 text-neutral-content hover:text-error hover:bg-error/10 rounded-md">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
      )}
      {mode === 'image' && !attachedFile && (
        <div className="mb-3 space-y-3">
          <div>
            <label className="block text-sm font-bold text-base-content/80 mb-2 text-center">Aspect Ratio</label>
            <div className="flex justify-center flex-wrap gap-2">
                {ASPECT_RATIOS.map(ratio => {
                    const Icon = ASPECT_RATIO_ICONS[ratio];
                    return (
                        <button
                            key={ratio}
                            type="button"
                            onClick={() => setAspectRatio(ratio)}
                            className={`btn h-auto min-h-0 py-2 px-3 flex flex-col items-center gap-1 rounded-md border-2 transition-colors w-[68px] ${
                                aspectRatio === ratio
                                ? 'bg-primary/30 text-primary-content border-primary-focus'
                                : 'bg-base-200 border-neutral hover:border-primary-focus'
                            }`}
                        >
                            <Icon className="w-8 h-8"/>
                            <span className="text-xs font-bold">{ratio}</span>
                        </button>
                    )
                })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-base-content/80 mb-2 text-center">Image Model</label>
            <div className="flex justify-center flex-wrap gap-2">
              {IMAGE_MODELS.map(model => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setImageModel(model)}
                  className={`btn btn-sm h-auto min-h-0 py-1.5 px-4 text-sm rounded-md border-2 transition-colors capitalize ${
                    imageModel === model
                      ? 'bg-primary/30 text-primary-content border-primary-focus'
                      : 'bg-base-200 border-neutral hover:border-primary-focus'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
        <button
          type="button"
          onClick={handleAttachClick}
          className="btn p-0 h-12 w-12 flex items-center justify-center rounded-[0.625rem] border-2 bg-base-200 border-neutral hover:border-primary-focus"
          aria-label="Attach file"
        >
          <ClipIcon className="w-6 h-6" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'text' ? (attachedFile ? "Ask something about the file..." : "Type your message here...") : "Describe the image you want to generate..."}
          disabled={isLoading}
          className="input h-12 w-full flex-1 bg-base-100 border-2 border-neutral rounded-[0.625rem] focus:border-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium placeholder:text-neutral-content"
        />
        <button
          type="button"
          onClick={() => {
              if (attachedFile) handleRemoveFile();
              setMode(m => m === 'text' ? 'image' : 'text');
          }}
          className={`btn p-0 h-12 w-12 flex items-center justify-center rounded-[0.625rem] border-2 transition-colors ${
            mode === 'image' && !attachedFile
            ? 'bg-primary/30 text-primary-content border-primary-focus' 
            : 'bg-base-200 border-neutral hover:border-primary-focus'
          }`}
          aria-label="Toggle image generation mode"
        >
          <ImageIcon className="w-6 h-6" />
        </button>
        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !attachedFile)}
          className="btn bg-primary text-primary-content border-2 border-primary-focus rounded-[0.625rem] p-3 h-12 w-12 flex items-center justify-center shadow-primary transition-all hover:translate-y-[-2px] active:translate-y-0 active:shadow-none disabled:bg-neutral disabled:text-neutral-content disabled:border-neutral/50 disabled:shadow-none"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>

      {mode === 'text' && !attachedFile && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <SearchIcon className="w-5 h-5 text-neutral-content" />
          <span className="text-sm font-bold text-base-content/80">Web Search</span>
          <ToggleSwitch 
            enabled={isWebSearchEnabled}
            setEnabled={setIsWebSearchEnabled}
            disabled={isLoading}
          />
        </div>
      )}

      <p className="text-xs text-center text-neutral-content pt-2 font-medium">
          Lumen AI can make mistakes, so double-check it
      </p>
    </div>
  );
};