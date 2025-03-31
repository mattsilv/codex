import { useState, useEffect } from 'preact/hooks';
import useAuth from './useAuth';

export default function useResponses(promptId) {
  const { user } = useAuth();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (promptId) {
      loadResponses();
    } else {
      setResponses([]);
      setLoading(false);
    }
  }, [promptId]);

  const loadResponses = () => {
    setLoading(true);
    // For MVP: Load from localStorage
    const storedResponses = localStorage.getItem('responses');
    if (storedResponses) {
      const parsedResponses = JSON.parse(storedResponses);
      // Filter by promptId
      setResponses(parsedResponses.filter(response => response.promptId === promptId));
    }
    setLoading(false);
  };

  const getResponse = (id) => {
    const storedResponses = localStorage.getItem('responses');
    if (storedResponses) {
      const parsedResponses = JSON.parse(storedResponses);
      return parsedResponses.find(response => response.id === id);
    }
    return null;
  };

  const modelExists = (modelName) => {
    // Check if a response with this model name already exists for this prompt
    return responses.some(response => response.modelName.toLowerCase() === modelName.toLowerCase());
  };

  const createResponse = (responseData) => {
    // Check if a response with this model already exists
    if (modelExists(responseData.modelName)) {
      throw new Error(`A response with the model "${responseData.modelName}" already exists for this prompt.`);
    }

    const newResponse = {
      ...responseData,
      id: crypto.randomUUID(),
      promptId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    const storedResponses = localStorage.getItem('responses');
    let updatedResponses = [];
    if (storedResponses) {
      updatedResponses = [...JSON.parse(storedResponses), newResponse];
    } else {
      updatedResponses = [newResponse];
    }
    localStorage.setItem('responses', JSON.stringify(updatedResponses));
    
    // Update state
    setResponses(prev => [...prev, newResponse]);
    
    return newResponse;
  };

  const updateResponse = (id, responseData) => {
    const storedResponses = localStorage.getItem('responses');
    if (!storedResponses) return false;
    
    const parsedResponses = JSON.parse(storedResponses);
    const responseIndex = parsedResponses.findIndex(r => r.id === id);
    
    if (responseIndex === -1) return false;
    
    const updatedResponse = {
      ...parsedResponses[responseIndex],
      ...responseData,
      updatedAt: new Date().toISOString()
    };
    
    parsedResponses[responseIndex] = updatedResponse;
    localStorage.setItem('responses', JSON.stringify(parsedResponses));
    
    // Update state
    setResponses(prev => prev.map(r => r.id === id ? updatedResponse : r));
    
    return updatedResponse;
  };

  const deleteResponse = (id) => {
    const storedResponses = localStorage.getItem('responses');
    if (!storedResponses) return false;
    
    const parsedResponses = JSON.parse(storedResponses);
    const filteredResponses = parsedResponses.filter(r => r.id !== id);
    
    localStorage.setItem('responses', JSON.stringify(filteredResponses));
    
    // Update state
    setResponses(prev => prev.filter(r => r.id !== id));
    
    return true;
  };

  return {
    responses,
    loading,
    getResponse,
    createResponse,
    updateResponse,
    deleteResponse,
    refresh: loadResponses
  };
}