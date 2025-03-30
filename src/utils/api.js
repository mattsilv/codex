// For MVP, we'll use localStorage instead of real API calls
// This file is a placeholder for future API integration

export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          // For MVP, just return the credentials with an ID
          resolve({
            ...credentials,
            id: crypto.randomUUID()
          });
        }, 500);
      });
    },
    register: async (userData) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          // For MVP, just return the user data with an ID
          resolve({
            ...userData,
            id: crypto.randomUUID()
          });
        }, 500);
      });
    },
  },
  
  // Prompts
  prompts: {
    getAll: async (userId) => {
      // In a real API, we would fetch from the server
      // For MVP, we'll just read from localStorage
      return new Promise((resolve) => {
        setTimeout(() => {
          const storedPrompts = localStorage.getItem('prompts');
          if (storedPrompts) {
            const parsedPrompts = JSON.parse(storedPrompts);
            resolve(parsedPrompts.filter(prompt => prompt.userId === userId));
          } else {
            resolve([]);
          }
        }, 300);
      });
    },
    
    get: async (id) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const storedPrompts = localStorage.getItem('prompts');
          if (storedPrompts) {
            const parsedPrompts = JSON.parse(storedPrompts);
            resolve(parsedPrompts.find(prompt => prompt.id === id) || null);
          } else {
            resolve(null);
          }
        }, 300);
      });
    },
    
    create: async (promptData) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newPrompt = {
            ...promptData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const storedPrompts = localStorage.getItem('prompts');
          let updatedPrompts = [];
          if (storedPrompts) {
            updatedPrompts = [...JSON.parse(storedPrompts), newPrompt];
          } else {
            updatedPrompts = [newPrompt];
          }
          localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
          
          resolve(newPrompt);
        }, 300);
      });
    },
    
    update: async (id, promptData) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const storedPrompts = localStorage.getItem('prompts');
          if (!storedPrompts) {
            reject(new Error('No prompts found'));
            return;
          }
          
          const parsedPrompts = JSON.parse(storedPrompts);
          const promptIndex = parsedPrompts.findIndex(p => p.id === id);
          
          if (promptIndex === -1) {
            reject(new Error('Prompt not found'));
            return;
          }
          
          const updatedPrompt = {
            ...parsedPrompts[promptIndex],
            ...promptData,
            updatedAt: new Date().toISOString()
          };
          
          parsedPrompts[promptIndex] = updatedPrompt;
          localStorage.setItem('prompts', JSON.stringify(parsedPrompts));
          
          resolve(updatedPrompt);
        }, 300);
      });
    },
    
    delete: async (id) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const storedPrompts = localStorage.getItem('prompts');
          if (!storedPrompts) {
            reject(new Error('No prompts found'));
            return;
          }
          
          const parsedPrompts = JSON.parse(storedPrompts);
          const filteredPrompts = parsedPrompts.filter(p => p.id !== id);
          
          localStorage.setItem('prompts', JSON.stringify(filteredPrompts));
          
          resolve(true);
        }, 300);
      });
    }
  },
  
  // Responses
  responses: {
    getAll: async (promptId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const storedResponses = localStorage.getItem('responses');
          if (storedResponses) {
            const parsedResponses = JSON.parse(storedResponses);
            resolve(parsedResponses.filter(response => response.promptId === promptId));
          } else {
            resolve([]);
          }
        }, 300);
      });
    },
    
    create: async (responseData) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newResponse = {
            ...responseData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const storedResponses = localStorage.getItem('responses');
          let updatedResponses = [];
          if (storedResponses) {
            updatedResponses = [...JSON.parse(storedResponses), newResponse];
          } else {
            updatedResponses = [newResponse];
          }
          localStorage.setItem('responses', JSON.stringify(updatedResponses));
          
          resolve(newResponse);
        }, 300);
      });
    },
    
    update: async (id, responseData) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const storedResponses = localStorage.getItem('responses');
          if (!storedResponses) {
            reject(new Error('No responses found'));
            return;
          }
          
          const parsedResponses = JSON.parse(storedResponses);
          const responseIndex = parsedResponses.findIndex(r => r.id === id);
          
          if (responseIndex === -1) {
            reject(new Error('Response not found'));
            return;
          }
          
          const updatedResponse = {
            ...parsedResponses[responseIndex],
            ...responseData,
            updatedAt: new Date().toISOString()
          };
          
          parsedResponses[responseIndex] = updatedResponse;
          localStorage.setItem('responses', JSON.stringify(parsedResponses));
          
          resolve(updatedResponse);
        }, 300);
      });
    },
    
    delete: async (id) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const storedResponses = localStorage.getItem('responses');
          if (!storedResponses) {
            reject(new Error('No responses found'));
            return;
          }
          
          const parsedResponses = JSON.parse(storedResponses);
          const filteredResponses = parsedResponses.filter(r => r.id !== id);
          
          localStorage.setItem('responses', JSON.stringify(filteredResponses));
          
          resolve(true);
        }, 300);
      });
    }
  }
};