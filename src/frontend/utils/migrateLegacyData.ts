import { STORAGE_KEYS, isProduction } from '@shared/constants';
import { api } from './api';

interface PromptData {
  id: string;
  title: string;
  content: string;
  isPublic?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ResponseData {
  id: string;
  promptId: string;
  modelName: string;
  content: string;
  isMarkdown?: boolean;
  settings?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface MigrationStats {
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
}

interface MigrationResult {
  success: boolean;
  migrated?: boolean;
  message: string;
  stats?: MigrationStats;
  logs?: string[];
}

interface MigrationLog {
  timestamp: string;
  type: 'info' | 'error' | 'success' | 'warning';
  message: string;
}

/**
 * Utility to migrate localStorage data to the backend
 * This can be used to import existing data when a user signs up for an account
 */
export async function migrateLegacyData(): Promise<MigrationResult> {
  const logs: MigrationLog[] = [];

  // Helper function to log events
  const logEvent = (
    type: 'info' | 'error' | 'success' | 'warning',
    message: string
  ): void => {
    const timestamp = new Date().toISOString();
    logs.push({ timestamp, type, message });

    // Also log to console with appropriate formatting
    switch (type) {
      case 'error':
        console.error(`[MIGRATION] ${message}`);
        break;
      case 'warning':
        console.warn(`[MIGRATION] ${message}`);
        break;
      case 'success':
        console.log(`[MIGRATION] ✅ ${message}`);
        break;
      default:
        console.log(`[MIGRATION] ${message}`);
    }
  };

  try {
    logEvent('info', 'Starting data migration process');

    // Check if we have a valid token (authenticated user)
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      logEvent('warning', 'Cannot migrate data without authentication');
      return {
        success: false,
        message: 'Please log in first to migrate your data',
        logs: logs.map(
          (log) =>
            `[${log.type.toUpperCase()}] ${log.timestamp}: ${log.message}`
        ),
      };
    }

    // Get current user profile to verify token is valid
    logEvent('info', 'Verifying user authentication');
    const user = await api.auth.getProfile();
    if (!user) {
      logEvent('error', 'Authentication verification failed');
      return {
        success: false,
        message: 'Authentication failed. Please log in again.',
        logs: logs.map(
          (log) =>
            `[${log.type.toUpperCase()}] ${log.timestamp}: ${log.message}`
        ),
      };
    }

    logEvent(
      'success',
      `Authentication verified for user ${user.email || user.id}`
    );

    // Get prompts from localStorage
    logEvent('info', 'Reading prompts from local storage');
    const storedPrompts = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    let localPrompts: PromptData[] = [];

    if (storedPrompts) {
      try {
        localPrompts = JSON.parse(storedPrompts);
        logEvent(
          'success',
          `Found ${localPrompts.length} prompts in local storage`
        );
      } catch (error) {
        logEvent(
          'error',
          `Failed to parse stored prompts: ${(error as Error).message}`
        );
        return {
          success: false,
          message: 'Data format error: Cannot parse stored prompts',
          logs: logs.map(
            (log) =>
              `[${log.type.toUpperCase()}] ${log.timestamp}: ${log.message}`
          ),
        };
      }
    } else {
      logEvent('info', 'No local prompts found to migrate');
      return {
        success: true,
        migrated: false,
        message: 'No local data to migrate',
        logs: logs.map(
          (log) =>
            `[${log.type.toUpperCase()}] ${log.timestamp}: ${log.message}`
        ),
      };
    }

    // Get responses from localStorage
    logEvent('info', 'Reading responses from local storage');
    const storedResponses = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    let localResponses: ResponseData[] = [];

    if (storedResponses) {
      try {
        localResponses = JSON.parse(storedResponses);
        logEvent(
          'success',
          `Found ${localResponses.length} responses in local storage`
        );
      } catch (error) {
        logEvent(
          'error',
          `Failed to parse stored responses: ${(error as Error).message}`
        );
        // Continue with prompts even if responses fail
        localResponses = [];
      }
    } else {
      logEvent('info', 'No local responses found to migrate');
    }

    // Stats for the migration
    let migratedPrompts = 0;
    let failedPrompts = 0;
    let migratedResponses = 0;
    let failedResponses = 0;

    // Create a map for new prompt IDs
    const promptIdMap = new Map<string, string>();

    // Migrate prompts
    logEvent('info', 'Starting to migrate prompts');
    for (const prompt of localPrompts) {
      try {
        // Prepare data for backend
        const promptData = {
          title: prompt.title || 'Untitled Prompt',
          content: prompt.content,
          isPublic: prompt.isPublic || false,
          tags: prompt.tags || [],
        };

        logEvent('info', `Migrating prompt: "${promptData.title}"`);

        // Create prompt in backend
        const newPrompt = await api.prompts.create(promptData);

        // Store mapping of old ID to new ID
        promptIdMap.set(prompt.id, newPrompt.id);
        migratedPrompts++;

        logEvent(
          'success',
          `Migrated prompt: "${promptData.title}" (ID: ${newPrompt.id})`
        );
      } catch (error) {
        logEvent(
          'error',
          `Failed to migrate prompt "${prompt.title || 'Untitled'}" (ID: ${prompt.id}): ${(error as Error).message}`
        );
        failedPrompts++;
      }
    }

    // Migrate responses
    if (localResponses.length > 0) {
      logEvent('info', 'Starting to migrate responses');
      for (const response of localResponses) {
        try {
          // Check if parent prompt was migrated
          const newPromptId = promptIdMap.get(response.promptId);
          if (!newPromptId) {
            logEvent(
              'warning',
              `Skipping response (ID: ${response.id}) because parent prompt (ID: ${response.promptId}) wasn't migrated`
            );
            failedResponses++;
            continue; // Skip if parent prompt wasn't migrated
          }

          // Prepare data for backend
          const responseData = {
            modelName: response.modelName || 'Unknown Model',
            content: response.content,
            isMarkdown:
              response.isMarkdown !== undefined ? response.isMarkdown : true,
          };

          logEvent(
            'info',
            `Migrating response for model: ${responseData.modelName} (Prompt ID: ${newPromptId})`
          );

          // Create response in backend
          const newResponse = await api.responses.create(
            newPromptId,
            responseData
          );
          migratedResponses++;

          logEvent(
            'success',
            `Migrated response for model: ${responseData.modelName} (ID: ${newResponse.id})`
          );
        } catch (error) {
          logEvent(
            'error',
            `Failed to migrate response (ID: ${response.id}): ${(error as Error).message}`
          );
          failedResponses++;
        }
      }
    }

    // Create a detailed summary message
    let summaryMessage = '';

    if (migratedPrompts === 0 && localPrompts.length > 0) {
      summaryMessage = 'Migration failed: No prompts could be migrated.';
      logEvent('error', summaryMessage);
    } else if (migratedPrompts < localPrompts.length) {
      summaryMessage = `Partially migrated: ${migratedPrompts}/${localPrompts.length} prompts and ${migratedResponses}/${localResponses.length} responses`;
      logEvent('warning', summaryMessage);
    } else {
      summaryMessage = `Successfully migrated ${migratedPrompts}/${localPrompts.length} prompts and ${migratedResponses}/${localResponses.length} responses`;
      logEvent('success', summaryMessage);
    }

    // Save migration logs to localStorage for debugging
    try {
      const logsJson = JSON.stringify(logs);
      localStorage.setItem('migration_logs', logsJson);
      logEvent('info', 'Migration logs saved to localStorage');
    } catch (error) {
      logEvent(
        'warning',
        `Failed to save migration logs: ${(error as Error).message}`
      );
    }

    return {
      success: migratedPrompts > 0,
      migrated: migratedPrompts > 0,
      stats: {
        prompts: {
          total: localPrompts.length,
          migrated: migratedPrompts,
          failed: failedPrompts,
        },
        responses: {
          total: localResponses.length,
          migrated: migratedResponses,
          failed: failedResponses,
        },
      },
      message: summaryMessage,
      logs: logs.map(
        (log) => `[${log.type.toUpperCase()}] ${log.timestamp}: ${log.message}`
      ),
    };
  } catch (error: any) {
    const errorMessage = `Migration failed: ${error.message}`;
    logEvent('error', errorMessage);

    return {
      success: false,
      message: errorMessage,
      logs: logs.map(
        (log) => `[${log.type.toUpperCase()}] ${log.timestamp}: ${log.message}`
      ),
    };
  }
}

/**
 * Clears localStorage data after a successful migration
 * @param keepBackup - Whether to keep a backup copy of the data
 */
export function clearLocalStorageData(keepBackup = true): void {
  console.log('[MIGRATION] Clearing localStorage data');

  // Make a backup if requested
  if (keepBackup) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const promptsData = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    const responsesData = localStorage.getItem(STORAGE_KEYS.RESPONSES);

    if (promptsData) {
      localStorage.setItem(`prompts_backup_${timestamp}`, promptsData);
      console.log(
        `[MIGRATION] Created backup of prompts at key: prompts_backup_${timestamp}`
      );
    }

    if (responsesData) {
      localStorage.setItem(`responses_backup_${timestamp}`, responsesData);
      console.log(
        `[MIGRATION] Created backup of responses at key: responses_backup_${timestamp}`
      );
    }
  }

  // Remove the original data
  localStorage.removeItem(STORAGE_KEYS.PROMPTS);
  localStorage.removeItem(STORAGE_KEYS.RESPONSES);
  console.log('[MIGRATION] Cleared original localStorage data');
}

/**
 * Function to check if there's legacy data available to migrate
 */
export function hasLegacyData(): boolean {
  // Don't show migration banner in production unless explicitly forced
  const forceMigration = localStorage.getItem('force_migration_banner');

  if (isProduction && !forceMigration) {
    return false;
  }

  const storedPrompts = localStorage.getItem(STORAGE_KEYS.PROMPTS);
  return !!storedPrompts && JSON.parse(storedPrompts).length > 0;
}

/**
 * Function to get the migration logs from localStorage
 */
export function getMigrationLogs(): string[] {
  const logsJson = localStorage.getItem('migration_logs');
  if (logsJson) {
    try {
      const logs = JSON.parse(logsJson);
      return logs.map(
        (log: MigrationLog) =>
          `[${log.type.toUpperCase()}] ${log.timestamp}: ${log.message}`
      );
    } catch (error) {
      console.error('Failed to parse migration logs:', error);
      return [];
    }
  }
  return [];
}
