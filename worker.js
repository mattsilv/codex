// Import the main backend handler
import backendHandler from './src/backend/index.js';

/**
 * Cloudflare Worker for the Codex backend API
 * Includes support for scheduled user deletion after 7-day retention period
 */
export default {
  // Process HTTP requests by passing to the main backend handler
  async fetch(request, env, ctx) {
    return backendHandler.fetch(request, env, ctx);
  },

  // Handle scheduled tasks
  async scheduled(event, env, _ctx) {
    // Process scheduled user deletions daily
    // This will permanently delete users that were marked for deletion more than 7 days ago
    console.info('Running scheduled task: process user deletions');

    try {
      const { processScheduledUserDeletions } = await import(
        './src/backend/api/auth.js'
      );
      const result = await processScheduledUserDeletions(env);
      console.info('Scheduled task completed:', result);
    } catch (error) {
      console.error('Error in scheduled task:', error);
    }
  },
};
