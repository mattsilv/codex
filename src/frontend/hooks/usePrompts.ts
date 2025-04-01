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
  getPrompt: (id: string) => Promise<Prompt | null>;
  createPrompt: (promptData: PromptInput) => Promise<Prompt>;
  updatePrompt: (
    id: string,
    promptData: Partial<PromptInput>
  ) => Promise<Prompt | false>;
  deletePrompt: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export default function usePrompts(): UsePromptsReturn {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      loadPrompts().catch(error => {
        console.error('Error in loadPrompts effect:', error);
        setPrompts([]);
        setLoading(false);
      });
    } else {
      setPrompts([]);
      setLoading(false);
    }
  }, [user]);

  const loadPrompts = async (): Promise<void> => {
    setLoading(true);
    try {
      // Use API to fetch prompts
      const response = await fetch(`http://localhost:8787/api/prompts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.data || []);
      } else {
        console.error('Failed to load prompts:', response.status);
        setPrompts([]);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const getPrompt = async (id: string): Promise<Prompt | null> => {
    try {
      const response = await fetch(`http://localhost:8787/api/prompts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get prompt: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error getting prompt:', error);
      return null;
    }
  };

  const createPrompt = async (promptData: PromptInput): Promise<Prompt> => {
    if (!user) {
      throw new Error('User must be logged in to create prompts');
    }

    try {
      const response = await fetch(`http://localhost:8787/api/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(promptData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create prompt: ${response.status}`);
      }

      const data = await response.json();
      const newPrompt = data.data;

      // Update local state
      setPrompts(prev => [...prev, newPrompt]);

      return newPrompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  };

  const updatePrompt = async (
    id: string,
    promptData: Partial<PromptInput>
  ): Promise<Prompt | false> => {
    try {
      const response = await fetch(`http://localhost:8787/api/prompts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(promptData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update prompt: ${response.status}`);
      }

      const data = await response.json();
      const updatedPrompt = data.data;

      // Update local state
      setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p));

      return updatedPrompt;
    } catch (error) {
      console.error('Error updating prompt:', error);
      return false;
    }
  };

  const deletePrompt = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:8787/api/prompts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete prompt: ${response.status}`);
      }

      // Update local state
      setPrompts(prev => prev.filter(p => p.id !== id));

      return true;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      return false;
    }
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
