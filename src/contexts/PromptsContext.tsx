import React, { createContext, useContext, useState, useCallback } from 'react';
import type { GeneratedPrompt, PromptConfig } from '../types';
import { generatePrompt, generateTitle, suggestTags } from '../services/gemini';
import { savePrompt, getUserPrompts, toggleFavorite, deletePrompt } from '../services/supabase';
import { useAuth } from './AuthContext';

interface PromptsContextValue {
  prompts: GeneratedPrompt[];
  currentPrompt: string | null;
  isGenerating: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  generate: (config: PromptConfig) => Promise<void>;
  save: (config: PromptConfig) => Promise<void>;
  loadUserPrompts: () => Promise<void>;
  toggleFav: (id: string, current: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

const PromptsContext = createContext<PromptsContextValue | null>(null);

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<PromptConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (config: PromptConfig) => {
    setIsGenerating(true);
    setError(null);
    setCurrentConfig(config);
    try {
      const result = await generatePrompt(config);
      setCurrentPrompt(result);
    } catch (e: any) {
      setError(e.message || 'Erro ao gerar prompt. Verifique sua chave de API.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const save = useCallback(async (config: PromptConfig) => {
    if (!user || !currentPrompt) return;
    setIsSaving(true);
    setError(null);
    try {
      const [title, tags] = await Promise.all([
        generateTitle(config.description, currentPrompt),
        suggestTags(config.description, config.category),
      ]);
      const id = await savePrompt(user.uid, title, currentPrompt, config, tags);
      const newEntry: GeneratedPrompt = {
        id,
        title,
        prompt: currentPrompt,
        config,
        tags,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        isFavorite: false,
      };
      setPrompts(prev => [newEntry, ...prev]);
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar prompt.');
    } finally {
      setIsSaving(false);
    }
  }, [user, currentPrompt]);

  const loadUserPrompts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getUserPrompts(user.uid);
      setPrompts(data);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar prompts.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const toggleFav = useCallback(async (id: string, current: boolean) => {
    try {
      await toggleFavorite(id, current);
      setPrompts(prev =>
        prev.map(p => p.id === id ? { ...p, isFavorite: !current } : p)
      );
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deletePrompt(id);
      setPrompts(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const clearCurrent = useCallback(() => {
    setCurrentPrompt(null);
    setCurrentConfig(null);
  }, []);

  return (
    <PromptsContext.Provider value={{
      prompts, currentPrompt, isGenerating, isSaving, isLoading, error,
      generate, save, loadUserPrompts, toggleFav, remove, clearCurrent,
    }}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePrompts() {
  const ctx = useContext(PromptsContext);
  if (!ctx) throw new Error('usePrompts must be used within PromptsProvider');
  return ctx;
}
