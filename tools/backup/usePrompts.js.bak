import { useState, useEffect } from 'preact/hooks';
import { promptsAPI } from '../utils/api';
import { STORAGE_KEYS } from '@shared/constants';
import useAuth from './useAuth';

export default function usePrompts() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadPrompts();
    } else {
      setPrompts([]);
      setLoading(false);
    }
  }, [user]);

  const loadPrompts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load from API first
      const apiPrompts = await promptsAPI.getPrompts();
      setPrompts(apiPrompts);
      setLoading(false);
    } catch (err) {
      console.error("API prompts fetch failed, falling back to localStorage:", err);
      
      // Fall back to localStorage if API fails
      fallbackToLocalStorage();
    }
  };

  const fallbackToLocalStorage = () => {
    // For backward compatibility: Load from localStorage
    const storedPrompts = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    if (storedPrompts) {
      const parsedPrompts = JSON.parse(storedPrompts);
      // Filter by user
      setPrompts(parsedPrompts.filter(prompt => prompt.userId === user.id));
    }
    setLoading(false);
  };

  const getPrompt = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get from API first
      const prompt = await promptsAPI.getPrompt(id);
      setLoading(false);
      return prompt;
    } catch (err) {
      console.error("API prompt fetch failed, falling back to localStorage:", err);
      
      // Fall back to localStorage if API fails
      const storedPrompts = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      if (storedPrompts) {
        const parsedPrompts = JSON.parse(storedPrompts);
        const prompt = parsedPrompts.find(p => p.id === id);
        setLoading(false);
        return prompt;
      }
      
      setLoading(false);
      return null;
    }
  };

  const createPrompt = async (promptData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to create via API first
      const result = await promptsAPI.createPrompt(promptData);
      
      // Refresh prompts list after creation
      await loadPrompts();
      
      setLoading(false);
      return result;
    } catch (err) {
      console.error("API prompt creation failed, falling back to localStorage:", err);
      setError(err.message);
      
      // Fall back to localStorage if API fails
      const newPrompt = {
        ...promptData,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const storedPrompts = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      let updatedPrompts = [];
      if (storedPrompts) {
        updatedPrompts = [...JSON.parse(storedPrompts), newPrompt];
      } else {
        updatedPrompts = [newPrompt];
      }
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updatedPrompts));
      
      // Update state
      setPrompts(prev => [...prev, newPrompt]);
      
      setLoading(false);
      return newPrompt;
    }
  };

  const updatePrompt = async (id, promptData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to update via API first
      const result = await promptsAPI.updatePrompt(id, promptData);
      
      // Refresh prompts list after update
      await loadPrompts();
      
      setLoading(false);
      return result;
    } catch (err) {
      console.error("API prompt update failed, falling back to localStorage:", err);
      setError(err.message);
      
      // Fall back to localStorage if API fails
      const storedPrompts = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      if (!storedPrompts) {
        setLoading(false);
        return false;
      }
      
      const parsedPrompts = JSON.parse(storedPrompts);
      const promptIndex = parsedPrompts.findIndex(p => p.id === id);
      
      if (promptIndex === -1) {
        setLoading(false);
        return false;
      }
      
      const updatedPrompt = {
        ...parsedPrompts[promptIndex],
        ...promptData,
        updatedAt: new Date().toISOString()
      };
      
      parsedPrompts[promptIndex] = updatedPrompt;
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(parsedPrompts));
      
      // Update state
      setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p));
      
      setLoading(false);
      return updatedPrompt;
    }
  };

  const deletePrompt = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to delete via API first
      await promptsAPI.deletePrompt(id);
      
      // Update state after successful deletion
      setPrompts(prev => prev.filter(p => p.id !== id));
      setLoading(false);
      return true;
    } catch (err) {
      console.error("API prompt deletion failed, falling back to localStorage:", err);
      setError(err.message);
      
      // Fall back to localStorage if API fails
      const storedPrompts = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      if (!storedPrompts) {
        setLoading(false);
        return false;
      }
      
      const parsedPrompts = JSON.parse(storedPrompts);
      const filteredPrompts = parsedPrompts.filter(p => p.id !== id);
      
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(filteredPrompts));
      
      // Update state
      setPrompts(prev => prev.filter(p => p.id !== id));
      
      setLoading(false);
      return true;
    }
  };

  return {
    prompts,
    loading,
    error,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    refresh: loadPrompts
  };
}