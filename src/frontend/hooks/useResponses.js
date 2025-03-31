import { useState, useEffect } from 'preact/hooks';
import { responsesAPI } from '../utils/api';
import { STORAGE_KEYS } from '@shared/constants';
import useAuth from './useAuth';

export default function useResponses(promptId) {
  const { user } = useAuth();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (promptId) {
      loadResponses();
    } else {
      setResponses([]);
      setLoading(false);
    }
  }, [promptId]);

  const loadResponses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load from API first
      const apiResponses = await responsesAPI.getResponses(promptId);
      setResponses(apiResponses);
      setLoading(false);
    } catch (err) {
      console.error("API responses fetch failed, falling back to localStorage:", err);
      
      // Fall back to localStorage if API fails
      fallbackToLocalStorage();
    }
  };

  const fallbackToLocalStorage = () => {
    // For backward compatibility: Load from localStorage
    const storedResponses = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    if (storedResponses) {
      const parsedResponses = JSON.parse(storedResponses);
      // Filter by promptId
      setResponses(parsedResponses.filter(response => response.promptId === promptId));
    }
    setLoading(false);
  };

  const getResponse = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get from API first
      const response = await responsesAPI.getResponse(promptId, id);
      setLoading(false);
      return response;
    } catch (err) {
      console.error("API response fetch failed, falling back to localStorage:", err);
      
      // Fall back to localStorage if API fails
      const storedResponses = localStorage.getItem(STORAGE_KEYS.RESPONSES);
      if (storedResponses) {
        const parsedResponses = JSON.parse(storedResponses);
        const response = parsedResponses.find(r => r.id === id);
        setLoading(false);
        return response;
      }
      
      setLoading(false);
      return null;
    }
  };

  const modelExists = (modelName) => {
    // Check if a response with this model name already exists for this prompt
    return responses.some(response => 
      response.modelName.toLowerCase() === modelName.toLowerCase()
    );
  };

  const createResponse = async (responseData) => {
    if (!promptId) {
      throw new Error("Prompt ID is required");
    }
    
    // Check if a response with this model already exists
    if (modelExists(responseData.modelName)) {
      throw new Error(`A response with the model "${responseData.modelName}" already exists for this prompt.`);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to create via API first
      const result = await responsesAPI.createResponse(promptId, responseData);
      
      // Refresh responses list after creation
      await loadResponses();
      
      setLoading(false);
      return result;
    } catch (err) {
      console.error("API response creation failed, falling back to localStorage:", err);
      setError(err.message);
      
      // Fall back to localStorage if API fails
      const newResponse = {
        ...responseData,
        id: crypto.randomUUID(),
        promptId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const storedResponses = localStorage.getItem(STORAGE_KEYS.RESPONSES);
      let updatedResponses = [];
      if (storedResponses) {
        updatedResponses = [...JSON.parse(storedResponses), newResponse];
      } else {
        updatedResponses = [newResponse];
      }
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(updatedResponses));
      
      // Update state
      setResponses(prev => [...prev, newResponse]);
      
      setLoading(false);
      return newResponse;
    }
  };

  const updateResponse = async (id, responseData) => {
    if (!promptId) {
      throw new Error("Prompt ID is required");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to update via API first
      const result = await responsesAPI.updateResponse(promptId, id, responseData);
      
      // Refresh responses list after update
      await loadResponses();
      
      setLoading(false);
      return result;
    } catch (err) {
      console.error("API response update failed, falling back to localStorage:", err);
      setError(err.message);
      
      // Fall back to localStorage if API fails
      const storedResponses = localStorage.getItem(STORAGE_KEYS.RESPONSES);
      if (!storedResponses) {
        setLoading(false);
        return false;
      }
      
      const parsedResponses = JSON.parse(storedResponses);
      const responseIndex = parsedResponses.findIndex(r => r.id === id);
      
      if (responseIndex === -1) {
        setLoading(false);
        return false;
      }
      
      const updatedResponse = {
        ...parsedResponses[responseIndex],
        ...responseData,
        updatedAt: new Date().toISOString()
      };
      
      parsedResponses[responseIndex] = updatedResponse;
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(parsedResponses));
      
      // Update state
      setResponses(prev => prev.map(r => r.id === id ? updatedResponse : r));
      
      setLoading(false);
      return updatedResponse;
    }
  };

  const deleteResponse = async (id) => {
    if (!promptId) {
      throw new Error("Prompt ID is required");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to delete via API first
      await responsesAPI.deleteResponse(promptId, id);
      
      // Update state after successful deletion
      setResponses(prev => prev.filter(r => r.id !== id));
      setLoading(false);
      return true;
    } catch (err) {
      console.error("API response deletion failed, falling back to localStorage:", err);
      setError(err.message);
      
      // Fall back to localStorage if API fails
      const storedResponses = localStorage.getItem(STORAGE_KEYS.RESPONSES);
      if (!storedResponses) {
        setLoading(false);
        return false;
      }
      
      const parsedResponses = JSON.parse(storedResponses);
      const filteredResponses = parsedResponses.filter(r => r.id !== id);
      
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(filteredResponses));
      
      // Update state
      setResponses(prev => prev.filter(r => r.id !== id));
      
      setLoading(false);
      return true;
    }
  };

  return {
    responses,
    loading,
    error,
    getResponse,
    createResponse,
    updateResponse,
    deleteResponse,
    modelExists,
    refresh: loadResponses
  };
}