// Data migration utility for Codex

/**
 * Migrates prompts and responses from localStorage to the API database
 * This function should be called after a user has authenticated
 * @param {Object} apiClient - API client object with prompts and responses methods
 * @returns {Promise<Object>} Migration result with success status and stats
 */
export async function migrateLocalDataToApi(apiClient) {
  try {
    // Check if we have data to migrate
    const storedPrompts = localStorage.getItem('prompts');
    const storedResponses = localStorage.getItem('responses');
    
    // No data to migrate
    if (!storedPrompts) {
      return { 
        success: true, 
        migrated: false, 
        message: 'No local data to migrate' 
      };
    }
    
    const parsedPrompts = JSON.parse(storedPrompts);
    const parsedResponses = storedResponses ? JSON.parse(storedResponses) : [];
    
    // Stats for the migration
    let migratedPrompts = 0;
    let migratedResponses = 0;
    let failedPrompts = 0;
    let failedResponses = 0;
    
    // Map of old prompt IDs to new prompt IDs (for linking responses)
    const promptIdMap = new Map();
    
    // Migrate each prompt
    for (const prompt of parsedPrompts) {
      try {
        // Create a new prompt with the API
        const newPrompt = await apiClient.prompts.create({
          title: prompt.title || 'Untitled Prompt',
          content: prompt.content,
          isPublic: !!prompt.isPublic,
          tags: prompt.tags ? (typeof prompt.tags === 'string' ? JSON.parse(prompt.tags) : prompt.tags) : []
        });
        
        // Store the mapping of the old ID to the new ID
        promptIdMap.set(prompt.id, newPrompt.id);
        migratedPrompts++;
        
        console.log(`Migrated prompt: ${prompt.title || 'Untitled'}`);
      } catch (error) {
        console.error(`Failed to migrate prompt: ${prompt.title || 'Untitled'}`, error);
        failedPrompts++;
      }
    }
    
    // Migrate responses after all prompts are created
    for (const response of parsedResponses) {
      try {
        // Look up the new prompt ID from the map
        const newPromptId = promptIdMap.get(response.promptId);
        
        // Skip if the prompt wasn't migrated
        if (!newPromptId) {
          failedResponses++;
          continue;
        }
        
        // Create the response with the API
        await apiClient.responses.create(newPromptId, {
          content: response.content,
          modelName: response.modelName || 'Unknown Model',
          isMarkdown: response.isMarkdown !== undefined ? response.isMarkdown : true
        });
        
        migratedResponses++;
        console.log(`Migrated response for model: ${response.modelName || 'Unknown Model'}`);
      } catch (error) {
        console.error('Failed to migrate response:', error);
        failedResponses++;
      }
    }
    
    // Return migration stats
    return {
      success: true,
      migrated: true,
      stats: {
        prompts: {
          total: parsedPrompts.length,
          migrated: migratedPrompts,
          failed: failedPrompts
        },
        responses: {
          total: parsedResponses.length,
          migrated: migratedResponses,
          failed: failedResponses
        }
      },
      message: `Successfully migrated ${migratedPrompts}/${parsedPrompts.length} prompts and ${migratedResponses}/${parsedResponses.length} responses`
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`
    };
  }
}

/**
 * Clears localStorage data after a successful migration
 * @param {boolean} keepBackup - Whether to keep a backup copy of the data
 * @returns {void}
 */
export function clearLocalStorageData(keepBackup = true) {
  // Make a backup if requested
  if (keepBackup) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const promptsData = localStorage.getItem('prompts');
    const responsesData = localStorage.getItem('responses');
    
    if (promptsData) {
      localStorage.setItem(`prompts_backup_${timestamp}`, promptsData);
    }
    
    if (responsesData) {
      localStorage.setItem(`responses_backup_${timestamp}`, responsesData);
    }
  }
  
  // Remove the original data
  localStorage.removeItem('prompts');
  localStorage.removeItem('responses');
}