import { useState, useEffect } from 'preact/hooks';
import useAuth from './useAuth';

export default function usePrompts() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPrompts();
    } else {
      setPrompts([]);
      setLoading(false);
    }
  }, [user]);

  const loadPrompts = () => {
    setLoading(true);
    // For MVP: Load from localStorage
    const storedPrompts = localStorage.getItem('prompts');
    if (storedPrompts) {
      const parsedPrompts = JSON.parse(storedPrompts);
      // Filter by user
      setPrompts(parsedPrompts.filter((prompt) => prompt.userId === user.id));
    }
    setLoading(false);
  };

  const getPrompt = (id) => {
    const storedPrompts = localStorage.getItem('prompts');
    if (storedPrompts) {
      const parsedPrompts = JSON.parse(storedPrompts);
      return parsedPrompts.find((prompt) => prompt.id === id);
    }
    return null;
  };

  const createPrompt = (promptData) => {
    const newPrompt = {
      ...promptData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const storedPrompts = localStorage.getItem('prompts');
    let updatedPrompts = [];
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

  const updatePrompt = (id, promptData) => {
    const storedPrompts = localStorage.getItem('prompts');
    if (!storedPrompts) return false;

    const parsedPrompts = JSON.parse(storedPrompts);
    const promptIndex = parsedPrompts.findIndex((p) => p.id === id);

    if (promptIndex === -1) return false;

    const updatedPrompt = {
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

  const deletePrompt = (id) => {
    const storedPrompts = localStorage.getItem('prompts');
    if (!storedPrompts) return false;

    const parsedPrompts = JSON.parse(storedPrompts);
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
