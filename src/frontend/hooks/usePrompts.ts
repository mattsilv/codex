import { useState, useEffect } from 'preact/hooks';
import useAuth from './useAuth';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // For any additional properties
}

export interface PromptInput {
  title: string;
  content: string;
  isPublic: boolean;
  [key: string]: any;
}

export interface UsePromptsReturn {
  prompts: Prompt[];
  loading: boolean;
  getPrompt: (id: string) => Prompt | null;
  createPrompt: (promptData: PromptInput) => Prompt;
  updatePrompt: (
    id: string,
    promptData: Partial<PromptInput>
  ) => Prompt | false;
  deletePrompt: (id: string) => boolean;
  refresh: () => void;
}

export default function usePrompts(): UsePromptsReturn {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      loadPrompts();
    } else {
      setPrompts([]);
      setLoading(false);
    }
  }, [user]);

  const loadPrompts = (): void => {
    setLoading(true);
    // For MVP: Load from localStorage
    const storedPrompts = localStorage.getItem('prompts');
    if (storedPrompts) {
      const parsedPrompts: Prompt[] = JSON.parse(storedPrompts);
      // Filter by user
      setPrompts(parsedPrompts.filter((prompt) => prompt.userId === user?.id));
    }
    setLoading(false);
  };

  const getPrompt = (id: string): Prompt | null => {
    const storedPrompts = localStorage.getItem('prompts');
    if (storedPrompts) {
      const parsedPrompts: Prompt[] = JSON.parse(storedPrompts);
      return parsedPrompts.find((prompt) => prompt.id === id) || null;
    }
    return null;
  };

  const createPrompt = (promptData: PromptInput): Prompt => {
    if (!user) {
      throw new Error('User must be logged in to create prompts');
    }

    const newPrompt: Prompt = {
      ...promptData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const storedPrompts = localStorage.getItem('prompts');
    let updatedPrompts: Prompt[] = [];
    if (storedPrompts) {
      updatedPrompts = [...JSON.parse(storedPrompts), newPrompt];
    } else {
      updatedPrompts = [newPrompt];
    }
    localStorage.setItem('prompts', JSON.stringify(updatedPrompts));

    // Update state
    setPrompts((prev) => [...prev, newPrompt]);

    return newPrompt;
  };

  const updatePrompt = (
    id: string,
    promptData: Partial<PromptInput>
  ): Prompt | false => {
    const storedPrompts = localStorage.getItem('prompts');
    if (!storedPrompts) return false;

    const parsedPrompts: Prompt[] = JSON.parse(storedPrompts);
    const promptIndex = parsedPrompts.findIndex((p) => p.id === id);

    if (promptIndex === -1) return false;

    const updatedPrompt: Prompt = {
      ...parsedPrompts[promptIndex],
      ...promptData,
      updatedAt: new Date().toISOString(),
    };

    parsedPrompts[promptIndex] = updatedPrompt;
    localStorage.setItem('prompts', JSON.stringify(parsedPrompts));

    // Update state
    setPrompts((prev) => prev.map((p) => (p.id === id ? updatedPrompt : p)));

    return updatedPrompt;
  };

  const deletePrompt = (id: string): boolean => {
    const storedPrompts = localStorage.getItem('prompts');
    if (!storedPrompts) return false;

    const parsedPrompts: Prompt[] = JSON.parse(storedPrompts);
    const filteredPrompts = parsedPrompts.filter((p) => p.id !== id);

    localStorage.setItem('prompts', JSON.stringify(filteredPrompts));

    // Update state
    setPrompts((prev) => prev.filter((p) => p.id !== id));

    return true;
  };

  return {
    prompts,
    loading,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    refresh: loadPrompts,
  };
}
