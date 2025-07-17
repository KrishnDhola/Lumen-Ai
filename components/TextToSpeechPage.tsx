import React, { useState, useMemo, useEffect } from 'react';
import { ttsVoices } from '../data/ttsVoices.ts';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';

interface TextToSpeechPageProps {
  onClose: () => void;
}

export const TextToSpeechPage: React.FC<TextToSpeechPageProps> = ({ onClose }) => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(ttsVoices[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maleVoices = ttsVoices.filter(v => v.gender === 'male');
  const femaleVoices = ttsVoices.filter(v => v.gender === 'female');

  const { charCount, estimatedDuration } = useMemo(() => {
    const trimmedText = text.trim();
    const words = trimmedText.split(/\s+/).filter(Boolean).length;
    const wordsPerMinute = 150;
    const seconds = Math.floor((words / wordsPerMinute) * 60);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const duration = words > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : '0:00';
    
    return {
      charCount: text.length,
      estimatedDuration: duration,
    };
  }, [text]);
  
  // Cleanup blob URL on component unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerate = async () => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    if(audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
    }

    try {
      const apiUrl = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${selectedVoice}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('This feature may require a paid subscription to the API provider.');
        }
        throw new Error(`Failed to generate audio. Status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const newAudioUrl = URL.createObjectURL(blob);
      setAudioUrl(newAudioUrl);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error("Error generating speech:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-base-200/50">
      <header className="p-4 border-b-2 border-neutral bg-base-100/80 backdrop-blur-sm z-10 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-serif text-base-content">Text to Speech</h1>
        <button 
            onClick={onClose}
            className="btn bg-base-200 border-2 border-neutral hover:border-primary-focus hover:bg-base-300 text-base-content font-bold"
        >
            Back to Chat
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="card bg-base-100 border-2 border-neutral p-6 rounded-[0.625rem]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-4">
                    <h2 className="text-xl font-bold font-serif text-base-content">Your Text</h2>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type or paste your text here..."
                        className="input w-full bg-base-200 border-2 border-neutral rounded-[0.625rem] focus:border-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[200px] py-2 flex-1"
                        disabled={isLoading}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold font-serif text-base-content">Settings</h2>
                    <div>
                        <label htmlFor="voice-select" className="block text-sm font-bold text-base-content/80 mb-2">Voice</label>
                        <select
                            id="voice-select"
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full input bg-base-200 border-2 border-neutral rounded-[0.625rem] focus:border-primary-focus focus:outline-none focus:ring-2 focus:ring-primary/50"
                            disabled={isLoading}
                        >
                            <optgroup label="Female Voices">
                                {femaleVoices.map(voice => (
                                    <option key={voice.id} value={voice.id}>{voice.name} - {voice.description}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Male Voices">
                                {maleVoices.map(voice => (
                                    <option key={voice.id} value={voice.id}>{voice.name} - {voice.description}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                    <div className="flex-1 flex flex-col justify-end gap-2 text-sm">
                        <div className="flex justify-between font-medium text-base-content/80">
                            <span>Characters:</span>
                            <span className="font-bold text-base-content">{charCount}</span>
                        </div>
                         <div className="flex justify-between font-medium text-base-content/80">
                            <span>Est. Duration:</span>
                            <span className="font-bold text-base-content">{estimatedDuration}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-6 mt-6 border-t-2 border-neutral">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !text.trim()}
                    className="btn w-full bg-primary text-primary-content border-2 border-primary-focus shadow-primary disabled:bg-neutral disabled:text-neutral-content disabled:shadow-none"
                >
                    {isLoading ? <SpinnerIcon className="w-6 h-6"/> : 'Generate Audio'}
                </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-error/20 border-2 border-error text-error font-bold text-center p-4 rounded-[0.625rem]">
              <p>{error}</p>
            </div>
          )}

          {audioUrl && !isLoading && (
            <div className="card bg-base-100 border-2 border-neutral p-6 rounded-[0.625rem] flex flex-col sm:flex-row items-center gap-4">
                <audio controls src={audioUrl} className="flex-1 w-full sm:w-auto">
                    Your browser does not support the audio element.
                </audio>
                <a
                    href={audioUrl}
                    download="lumen_ai_speech.mp3"
                    className="btn bg-base-200 border-2 border-neutral hover:border-primary-focus hover:bg-base-300 text-base-content font-bold w-full sm:w-auto flex-shrink-0"
                >
                    <DownloadIcon className="w-5 h-5"/>
                    Download MP3
                </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};