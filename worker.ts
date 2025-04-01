// Import the main backend handler
import backendHandler from './src/backend/index';

/**
 * Cloudflare Worker for the Codex backend API
 * Includes support for scheduled user deletion after 7-day retention period
 */

// Simple type definitions for Cloudflare Worker environment
interface Env {
  ENVIRONMENT: string;
  DB: any; // We'll use a generic type here as the exact D1Database type may not be available
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
  [key: string]: any;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
}

export default {
  // Process HTTP requests by passing to the main backend handler
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return backendHandler.fetch(request, env, ctx);
  },

  // Handle scheduled tasks
  async scheduled(event: any, env: Env, _ctx: ExecutionContext): Promise<void> {
    // Process scheduled user deletions daily
    // This will permanently delete users that were marked for deletion more than 7 days ago
    console.info('Running scheduled task: process user deletions');

    try {
      const { processScheduledUserDeletions } = await import(
        './src/backend/api/auth'
      );
      const result = await processScheduledUserDeletions(env);
      console.info('Scheduled task completed:', result);
    } catch (error) {
      console.error('Error in scheduled task:', error);
    }
  },
};
