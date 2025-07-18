import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { ChatWindow } from './components/ChatWindow.tsx';
import { Message, Model, ChatSession, CustomAssistant, PrebuiltAssistant, ProviderID } from './types.ts';
import { sendMessage as sendChatMessage, generateImage } from './services/chatService.ts';
import { sendMessageWithGemini } from './services/geminiService.ts';
import { PROVIDERS, MODEL_CATEGORIES } from './constants.ts';
import { AssistantsGallery } from './components/AssistantsGallery.tsx';
import { AssistantEditorModal } from './components/AssistantEditorModal.tsx';

const allModels = PROVIDERS.flatMap(p => p.models);
const geminiModel = allModels.find(m => m.provider === 'google_gemini');
const defaultModelId = 'auto';

const getInitialState = () => {
  let savedSessions: ChatSession[] = [];
  let savedAssistants: CustomAssistant[] = [];

  try {
    const sessionsData = localStorage.getItem('chatSessions');
    if (sessionsData) {
      const parsedSessions = JSON.parse(sessionsData);
      if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
        savedSessions = parsedSessions;
      }
    }
  } catch (error) {
    console.error("Failed to load sessions from localStorage", error);
    localStorage.removeItem('chatSessions');
  }

  try {
    const assistantsData = localStorage.getItem('customAssistants');
    if (assistantsData) {
      savedAssistants = JSON.parse(assistantsData);
    }
  } catch (error) {
    console.error("Failed to load custom assistants from localStorage", error);
    localStorage.removeItem('customAssistants');
  }

  if (savedSessions.length === 0) {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      messages: [{
        id: 'initial-message',
        role: 'assistant',
        content: "Welcome to Lumen AI Chat! You can now attach files with Gemini. Select a model and send a message to begin.",
        type: 'text',
      }],
      timestamp: Date.now(),
      modelId: defaultModelId,
    };
    savedSessions.push(newSession);
  }

  const activeSessionId = savedSessions[0]?.id || null;

  return {
    sessions: savedSessions,
    customAssistants: savedAssistants,
    activeSessionId: activeSessionId,
  };
};


export const App = () => {
  const [initialState] = useState(getInitialState);
  
  const [sessions, setSessions] = useState<ChatSession[]>(initialState.sessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialState.activeSessionId);
  const [customAssistants, setCustomAssistants] = useState<CustomAssistant[]>(initialState.customAssistants);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'assistants'>('chat');
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [assistantToEdit, setAssistantToEdit] = useState<CustomAssistant | null>(null);

  // Save to localStorage
  useEffect(() => {
    const saveData = (key: string, data: any) => {
      try {
        if (Object.keys(data).length > 0 || (Array.isArray(data) && data.length > 0)) {
          localStorage.setItem(key, JSON.stringify(data));
        } else {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage`, error);
      }
    };
    saveData('customAssistants', customAssistants);
    saveData('chatSessions', sessions);
  }, [sessions, customAssistants]);

  const handleNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      messages: [{
        id: 'initial-message',
        role: 'assistant',
        content: "Welcome to Lumen AI Chat! You can now attach files with Gemini. Select a model and send a message to begin.",
        type: 'text',
      }],
      timestamp: Date.now(),
      modelId: defaultModelId,
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
    setView('chat'); // Switch back to chat view on new chat
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setIsSidebarOpen(false);
    setView('chat'); // Switch back to chat view
  }, []);

  const handleDeleteSession = useCallback((idToDelete: string) => {
    setSessions(prev => {
      const remainingSessions = prev.filter(s => s.id !== idToDelete);
      if (activeSessionId === idToDelete) {
        if (remainingSessions.length > 0) {
          setActiveSessionId(remainingSessions[0].id);
        } else {
          // If all sessions are deleted, create a new one
          const newSession: ChatSession = {
            id: `session-${Date.now()}`,
            title: 'New Chat',
            messages: [{ id: 'initial-message', role: 'assistant', content: "Welcome back!", type: 'text' }],
            timestamp: Date.now(),
            modelId: defaultModelId,
          };
          setActiveSessionId(newSession.id);
          return [newSession];
        }
      }
      return remainingSessions;
    });
  }, [activeSessionId]);

  const handleModelSelect = useCallback((modelId: string) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId ? { ...s, modelId } : s
    ));
  }, [activeSessionId]);
  
  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSendMessage = useCallback(async (
    input: string,
    mode: 'text' | 'image',
    aspectRatio: string,
    isWebSearchEnabled: boolean,
    imageModel: string,
    attachment: File | null
  ) => {
    if ((!input.trim() && !attachment) || !activeSessionId) return;

    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (!currentSession) return;

    setIsLoading(true);

    let attachmentData: Message['attachment'];
    if (attachment) {
        try {
            attachmentData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    name: attachment.name,
                    type: attachment.type,
                    data: reader.result as string,
                });
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(attachment);
            });
        } catch (error) {
            const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: 'Error reading attached file.', type: 'text' };
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMessage] } : s));
            setIsLoading(false);
            return;
        }
    }

    const isNewChat = currentSession.messages.length <= 1 && currentSession.messages[0]?.id === 'initial-message';
    const historyForAPI = currentSession.messages.filter(m => m.id !== 'initial-message');
    const newUserMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: input, type: 'text', attachment: attachmentData };

    const updatedSessionWithUserMessage = {
      ...currentSession,
      messages: [...historyForAPI, newUserMessage],
      timestamp: Date.now(),
      title: isNewChat ? ((input || attachmentData?.name)?.substring(0, 40) + '...') : currentSession.title,
    };
    
    setSessions(prevSessions => [updatedSessionWithUserMessage, ...prevSessions.filter(s => s.id !== activeSessionId)]);
    
    const addBotMessage = (message: Message) => {
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, message] } : s));
    };

    try {
        if (mode === 'image' && !attachmentData) {
            const imageUrl = generateImage(input, aspectRatio, imageModel);
            addBotMessage({
                id: `bot-${Date.now()}`,
                role: 'assistant',
                content: imageUrl,
                type: 'image',
                aspectRatio: aspectRatio,
            });
            return;
        }
        
        // --- Model Selection Logic ---
        let finalModelId = currentSession.modelId;
        let systemPrompt: string | undefined = undefined;

        const customAssistant = customAssistants.find(a => a.id === finalModelId);
        if (customAssistant) {
            systemPrompt = customAssistant.systemPrompt;
            finalModelId = customAssistant.baseModelId;
        }

        if (finalModelId === 'auto') {
            let newlySelectedModelId: string;
            if (attachmentData) {
                newlySelectedModelId = geminiModel?.id || 'gemini-2.5-flash';
            } else {
                const routerModel = allModels.find(m => m.id === 'llama3-8b-8192'); // Fast model for routing
                if (!routerModel) {
                    console.error("Router model not found, using default general model.");
                    newlySelectedModelId = MODEL_CATEGORIES.GENERAL[0] || 'gemini-2.5-flash';
                } else {
                    const routerSystemPrompt = `You are an expert prompt routing AI. Your job is to classify the user's prompt into one of three categories: 'CODING', 'CREATIVE', or 'GENERAL'.
- 'CODING': for prompts related to writing, debugging, explaining, or optimizing code.
- 'CREATIVE': for prompts related to writing stories, poems, scripts, or other artistic and imaginative tasks.
- 'GENERAL': for all other prompts, including questions, summaries, translations, and general conversation.
Respond with ONLY one of these three words: CODING, CREATIVE, or GENERAL. Do not add any other text or explanation.`;
                    try {
                        const categoryResponse = await sendChatMessage(routerModel, [], input, routerSystemPrompt, false);
                        const category = categoryResponse.trim().toUpperCase();

                        if (category === 'CODING' && MODEL_CATEGORIES.CODING.length > 0) {
                            newlySelectedModelId = MODEL_CATEGORIES.CODING[0];
                        } else if (category === 'CREATIVE' && MODEL_CATEGORIES.CREATIVE.length > 0) {
                            newlySelectedModelId = MODEL_CATEGORIES.CREATIVE[0];
                        } else {
                            newlySelectedModelId = MODEL_CATEGORIES.GENERAL[0] || 'gemini-2.5-flash';
                        }
                    } catch (e) {
                        console.error("Auto-routing failed, using default general model.", e);
                        newlySelectedModelId = MODEL_CATEGORIES.GENERAL[0] || 'gemini-2.5-flash';
                    }
                }
            }
            
            // This is the key part. Update finalModelId for the current execution
            // AND update the session state for future executions.
            finalModelId = newlySelectedModelId;
            setSessions(prev => prev.map(s => 
                s.id === activeSessionId ? { ...s, modelId: finalModelId } : s
            ));
            
            const selectedModelForNotification = allModels.find(m => m.id === finalModelId);
            addBotMessage({
                id: `info-${Date.now()}`,
                role: 'assistant',
                content: `> Auto-selected **${selectedModelForNotification?.name || 'a suitable model'}**. Model locked for this session.`,
                type: 'text',
            });
        }
        
        let modelToUse = allModels.find(m => m.id === finalModelId);
        if (!modelToUse) {
            console.error(`Could not find model with id: ${finalModelId}. Falling back to Gemini.`);
            modelToUse = geminiModel || allModels.find(m => m.provider === ProviderID.GOOGLE_GEMINI)!;
        }
        
        if (attachmentData && modelToUse.provider !== ProviderID.GOOGLE_GEMINI) {
            addBotMessage({ id: `error-gemini-${Date.now()}`, role: 'assistant', content: `File attachments are only supported by Gemini models. Switching to Gemini for this response.`, type: 'text' });
            modelToUse = geminiModel || allModels.find(m => m.provider === ProviderID.GOOGLE_GEMINI)!;
        }

        if (modelToUse.provider === ProviderID.GOOGLE_GEMINI) {
            let finalSystemPrompt = systemPrompt;
            if (attachmentData?.type.startsWith('image/')) {
                const imageGenInstruction = `When a user provides an image and asks to generate a new image based on it (e.g., "make this a cartoon," "put a hat on the person," "change the background"), your ONLY response must be a detailed prompt for a text-to-image model. This prompt MUST start with the prefix "IMAGE_PROMPT::". Do not add any other text or explanation. For any other request, like asking a question about the image, respond normally.`;
                finalSystemPrompt = systemPrompt
                    ? `${imageGenInstruction}\n\nYour primary persona instruction: ${systemPrompt}`
                    : imageGenInstruction;
            }

            const response = await sendMessageWithGemini(historyForAPI, input, finalSystemPrompt, attachmentData);
            const responseText = response.text;

            const imagePromptPrefix = 'IMAGE_PROMPT::';
            if (responseText.startsWith(imagePromptPrefix)) {
                const imageDescription = responseText.substring(imagePromptPrefix.length).trim();
                const imageUrl = generateImage(imageDescription, aspectRatio, imageModel);
                addBotMessage({
                    id: `bot-${Date.now()}`,
                    role: 'assistant',
                    content: imageUrl,
                    type: 'image',
                    aspectRatio: aspectRatio,
                });
            } else {
                addBotMessage({ id: `bot-${Date.now()}`, role: 'assistant', content: responseText, type: 'text' });
            }

        } else { // OpenAI-compatible models
            const botResponse = await sendChatMessage(modelToUse, historyForAPI, input, systemPrompt, isWebSearchEnabled);
            addBotMessage({ id: `bot-${Date.now()}`, role: 'assistant', content: botResponse, type: 'text' });
        }
    } catch (error) {
        const errorMessageContent = error instanceof Error ? error.message : "Sorry, something went wrong.";
        addBotMessage({ id: `error-${Date.now()}`, role: 'assistant', content: errorMessageContent, type: 'text' });
    } finally {
        setIsLoading(false);
    }
  }, [activeSessionId, sessions, customAssistants]);

  const handleAddPrebuiltAssistant = useCallback((assistant: PrebuiltAssistant) => {
    const newAssistant: CustomAssistant = {
      id: `assistant-${Date.now()}-${assistant.name.replace(/\s+/g, '-')}`,
      name: assistant.name,
      systemPrompt: assistant.systemPrompt,
      baseModelId: assistant.baseModelId,
    };
    setCustomAssistants(prev => [newAssistant, ...prev]);
  }, []);

  const handleSaveAssistant = useCallback((assistantData: Omit<CustomAssistant, 'id'> & { id?: string }) => {
    if (assistantData.id) { // Editing existing
      setCustomAssistants(prev => prev.map(a => a.id === assistantData.id ? { ...a, ...assistantData } : a));
    } else { // Creating new
      const newAssistant: CustomAssistant = {
        ...assistantData,
        id: `assistant-${Date.now()}-${assistantData.name.replace(/\s+/g, '-')}`
      };
      setCustomAssistants(prev => [newAssistant, ...prev]);
    }
    setIsEditorModalOpen(false);
    setAssistantToEdit(null);
  }, []);
  
  const handleDeleteAssistant = useCallback((assistantId: string) => {
    if (activeSession?.modelId === assistantId) {
      handleModelSelect(defaultModelId);
    }
    setCustomAssistants(prev => prev.filter(a => a.id !== assistantId));
  }, [activeSession, handleModelSelect]);

  const openEditorForNew = () => {
    setAssistantToEdit(null);
    setIsEditorModalOpen(true);
  };

  const openEditorForEdit = (assistant: CustomAssistant) => {
    setAssistantToEdit(assistant);
    setIsEditorModalOpen(true);
  };

  const messages = activeSession?.messages || [];
  const activeModelId = activeSession?.modelId || defaultModelId;

  return (
    <div className="font-sans bg-base-100 text-base-content min-h-screen">
      <div className="relative flex h-screen overflow-hidden">
        {isSidebarOpen && view === 'chat' && (
            <div 
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
            ></div>
        )}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigateToAssistants={() => {
            setView('assistants');
            setIsSidebarOpen(false);
          }}
        />
        <main className="flex-1 flex flex-col h-screen bg-base-200/50">
          {view === 'chat' ? (
            <ChatWindow 
              messages={messages} 
              isLoading={isLoading} 
              onSendMessage={handleSendMessage}
              activeModelId={activeModelId}
              onModelSelect={handleModelSelect}
              customAssistants={customAssistants}
              onMenuClick={() => setIsSidebarOpen(true)}
              key={activeSessionId} // Force re-render on session change
            />
          ) : (
            <AssistantsGallery 
              onClose={() => setView('chat')}
              onAddAssistant={handleAddPrebuiltAssistant}
              myAssistants={customAssistants}
              onDeleteAssistant={handleDeleteAssistant}
              onEditAssistant={openEditorForEdit}
              onCreateAssistant={openEditorForNew}
            />
          )}
        </main>
        {isEditorModalOpen && (
          <AssistantEditorModal 
            isOpen={isEditorModalOpen}
            onClose={() => {
              setIsEditorModalOpen(false);
              setAssistantToEdit(null);
            }}
            onSave={handleSaveAssistant}
            assistantToEdit={assistantToEdit}
          />
        )}
      </div>
    </div>
  );
};