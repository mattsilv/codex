import { STORAGE_KEYS } from '@shared/constants';
import { authAPI, promptsAPI, responsesAPI } from './api';

/**
 * Utility to migrate localStorage data to the backend
 * This can be used to import existing data when a user signs up for an account
 */
export async function migrateLegacyData() {
  try {
    // Check if we have a valid token (authenticated user)
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      console.warn('Cannot migrate data without authentication');
      return { success: false, message: 'Please log in first to migrate your data' };
    }
    
    // Get current user profile to verify token is valid
    const user = await authAPI.getProfile();
    if (!user) {
      console.warn('Cannot migrate data without valid user');
      return { success: false, message: 'Authentication failed. Please log in again.' };
    }
    
    // Get prompts from localStorage
    const storedPrompts = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    let localPrompts = [];
    
    if (storedPrompts) {
      localPrompts = JSON.parse(storedPrompts);
    } else {
      return { success: true, message: 'No local data to migrate' };
    }
    
    // Get responses from localStorage
    const storedResponses = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    let localResponses = storedResponses ? JSON.parse(storedResponses) : [];
    
    // Create a map for new prompt IDs
    const promptIdMap = new Map();
    
    // Migrate prompts
    for (const prompt of localPrompts) {
      try {
        // Prepare data for backend
        const promptData = {
          title: prompt.title,
          content: prompt.content,
          isPublic: prompt.isPublic || false,
          tags: prompt.tags || []
        };
        
        // Create prompt in backend
        const newPrompt = await promptsAPI.createPrompt(promptData);
        
        // Store mapping of old ID to new ID
        promptIdMap.set(prompt.id, newPrompt.id);
      } catch (error) {
        console.error(`Failed to migrate prompt ${prompt.id}:`, error);
      }
    }
    
    // Migrate responses
    for (const response of localResponses) {
      try {
        // Check if parent prompt was migrated
        const newPromptId = promptIdMap.get(response.promptId);
        if (!newPromptId) continue; // Skip if parent prompt wasn't migrated
        
        // Prepare data for backend
        const responseData = {
          modelName: response.modelName,
          content: response.content,
          settings: response.settings || {}
        };
        
        // Create response in backend
        await responsesAPI.createResponse(newPromptId, responseData);
      } catch (error) {
        console.error(`Failed to migrate response ${response.id}:`, error);
      }
    }
    
    return { 
      success: true, 
      message: `Successfully migrated ${promptIdMap.size} prompts and ${localResponses.length} responses` 
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, message: `Migration failed: ${error.message}` };
  }
}

// Function to check if there's legacy data available to migrate
export function hasLegacyData() {
  const storedPrompts = localStorage.getItem(STORAGE_KEYS.PROMPTS);
  return !!storedPrompts && JSON.parse(storedPrompts).length > 0;
}