import { useState, useEffect } from 'preact/hooks';
import useAuth from './useAuth';

export interface Response {
  id: string;
  promptId: string;
  modelName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // For any additional properties
}

export interface ResponseInput {
  modelName: string;
  content: string;
  [key: string]: any;
}

export interface UseResponsesReturn {
  responses: Response[];
  loading: boolean;
  getResponse: (id: string) => Response | null;
  createResponse: (responseData: ResponseInput) => Response;
  updateResponse: (
    id: string,
    responseData: Partial<ResponseInput>
  ) => Response | false;
  deleteResponse: (id: string) => boolean;
  refresh: () => void;
}

export default function useResponses(promptId: string): UseResponsesReturn {
  const { user } = useAuth();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (promptId) {
      loadResponses();
    } else {
      setResponses([]);
      setLoading(false);
    }
  }, [promptId]);

  const loadResponses = (): void => {
    setLoading(true);
    // For MVP: Load from localStorage
    const storedResponses = localStorage.getItem('responses');
    if (storedResponses) {
      const parsedResponses: Response[] = JSON.parse(storedResponses);
      // Filter by promptId
      setResponses(
        parsedResponses.filter((response) => response.promptId === promptId)
      );
    }
    setLoading(false);
  };

  const getResponse = (id: string): Response | null => {
    const storedResponses = localStorage.getItem('responses');
    if (storedResponses) {
      const parsedResponses: Response[] = JSON.parse(storedResponses);
      return parsedResponses.find((response) => response.id === id) || null;
    }
    return null;
  };

  const modelExists = (modelName: string): boolean => {
    // Check if a response with this model name already exists for this prompt
    return responses.some(
      (response) => response.modelName.toLowerCase() === modelName.toLowerCase()
    );
  };

  const createResponse = (responseData: ResponseInput): Response => {
    // Check if a response with this model already exists
    if (modelExists(responseData.modelName)) {
      throw new Error(
        `A response with the model "${responseData.modelName}" already exists for this prompt.`
      );
    }

    const newResponse: Response = {
      ...responseData,
      id: crypto.randomUUID(),
      promptId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const storedResponses = localStorage.getItem('responses');
    let updatedResponses: Response[] = [];
    if (storedResponses) {
      updatedResponses = [...JSON.parse(storedResponses), newResponse];
    } else {
      updatedResponses = [newResponse];
    }
    localStorage.setItem('responses', JSON.stringify(updatedResponses));

    // Update state
    setResponses((prev) => [...prev, newResponse]);

    return newResponse;
  };

  const updateResponse = (
    id: string,
    responseData: Partial<ResponseInput>
  ): Response | false => {
    const storedResponses = localStorage.getItem('responses');
    if (!storedResponses) return false;

    const parsedResponses: Response[] = JSON.parse(storedResponses);
    const responseIndex = parsedResponses.findIndex((r) => r.id === id);

    if (responseIndex === -1) return false;

    const updatedResponse: Response = {
      ...parsedResponses[responseIndex],
      ...responseData,
      updatedAt: new Date().toISOString(),
    };

    parsedResponses[responseIndex] = updatedResponse;
    localStorage.setItem('responses', JSON.stringify(parsedResponses));

    // Update state
    setResponses((prev) =>
      prev.map((r) => (r.id === id ? updatedResponse : r))
    );

    return updatedResponse;
  };

  const deleteResponse = (id: string): boolean => {
    const storedResponses = localStorage.getItem('responses');
    if (!storedResponses) return false;

    const parsedResponses: Response[] = JSON.parse(storedResponses);
    const filteredResponses = parsedResponses.filter((r) => r.id !== id);

    localStorage.setItem('responses', JSON.stringify(filteredResponses));

    // Update state
    setResponses((prev) => prev.filter((r) => r.id !== id));

    return true;
  };

  return {
    responses,
    loading,
    getResponse,
    createResponse,
    updateResponse,
    deleteResponse,
    refresh: loadResponses,
  };
}
