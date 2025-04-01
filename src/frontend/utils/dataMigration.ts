// Data migration utility for Codex

interface ApiClient {
  prompts: {
    create: (
      data: PromptCreateData
    ) => Promise<{ id: string; [key: string]: any }>;
  };
  responses: {
    create: (promptId: string, data: ResponseCreateData) => Promise<any>;
  };
}

interface PromptCreateData {
  title: string;
  content: string;
  isPublic: boolean;
  tags?: string[];
  [key: string]: any;
}

interface ResponseCreateData {
  content: string;
  modelName: string;
  isMarkdown: boolean;
  [key: string]: any;
}

interface MigrationResult {
  success: boolean;
  migrated?: boolean;
  message: string;
  stats?: {
    prompts: {
      total: number;
      migrated: number;
      failed: number;
    };
    responses: {
      total: number;
      migrated: number;
      failed: number;
    };
  };
}

interface StoredPrompt {
  id: string;
  title?: string;
  content: string;
  isPublic?: boolean;
  tags?: string[] | string;
  [key: string]: any;
}

interface StoredResponse {
  id: string;
  promptId: string;
  content: string;
  modelName?: string;
  isMarkdown?: boolean;
  [key: string]: any;
}

/**
 * Migrates prompts and responses from localStorage to the API database
 * This function should be called after a user has authenticated
 * @param apiClient - API client object with prompts and responses methods
 * @returns Migration result with success status and stats
 */
export async function migrateLocalDataToApi(
  apiClient: ApiClient
): Promise<MigrationResult> {
  try {
    // Check if we have data to migrate
    const storedPrompts = localStorage.getItem('prompts');
    const storedResponses = localStorage.getItem('responses');

    // No data to migrate
    if (!storedPrompts) {
      return {
        success: true,
        migrated: false,
        message: 'No local data to migrate',
      };
    }

    const parsedPrompts: StoredPrompt[] = JSON.parse(storedPrompts);
    const parsedResponses: StoredResponse[] = storedResponses
      ? JSON.parse(storedResponses)
      : [];

    // Stats for the migration
    let migratedPrompts = 0;
    let migratedResponses = 0;
    let failedPrompts = 0;
    let failedResponses = 0;

    // Map of old prompt IDs to new prompt IDs (for linking responses)
    const promptIdMap = new Map<string, string>();

    // Migrate each prompt
    for (const prompt of parsedPrompts) {
      try {
        // Create a new prompt with the API
        const newPrompt = await apiClient.prompts.create({
          title: prompt.title || 'Untitled Prompt',
          content: prompt.content,
          isPublic: !!prompt.isPublic,
          tags: prompt.tags
            ? typeof prompt.tags === 'string'
              ? JSON.parse(prompt.tags)
              : prompt.tags
            : [],
        });

        // Store the mapping of the old ID to the new ID
        promptIdMap.set(prompt.id, newPrompt.id);
        migratedPrompts++;

        console.log(`Migrated prompt: ${prompt.title || 'Untitled'}`);
      } catch (error) {
        console.error(
          `Failed to migrate prompt: ${prompt.title || 'Untitled'}`,
          error
        );
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
          isMarkdown:
            response.isMarkdown !== undefined ? response.isMarkdown : true,
        });

        migratedResponses++;
        console.log(
          `Migrated response for model: ${response.modelName || 'Unknown Model'}`
        );
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
          failed: failedPrompts,
        },
        responses: {
          total: parsedResponses.length,
          migrated: migratedResponses,
          failed: failedResponses,
        },
      },
      message: `Successfully migrated ${migratedPrompts}/${parsedPrompts.length} prompts and ${migratedResponses}/${parsedResponses.length} responses`,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    const err = error as Error;
    return {
      success: false,
      message: `Migration failed: ${err.message}`,
    };
  }
}

/**
 * Clears localStorage data after a successful migration
 * @param keepBackup - Whether to keep a backup copy of the data
 */
export function clearLocalStorageData(keepBackup: boolean = true): void {
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
