/**
 * Enhanced storage utility with improved error handling
 * Optimized for Cloudflare Workers R2 environment
 */

/**
 * Stores content in R2 bucket with proper error handling
 * @param {Object} env - Environment object containing CONTENT_STORE
 * @param {string} content - Content to store
 * @param {string} prefix - Prefix for the key (prompt or response)
 * @returns {Promise<string>} - Key where content is stored
 */
export async function storeContent(env, content, prefix = 'prompt') {
  const key = `${prefix}_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;

  try {
    // Get R2 store from env
    const store = env.CONTENT_STORE;

    if (!store) {
      throw new Error('CONTENT_STORE not available in environment');
    }

    // Store content in R2 with proper Headers for text
    await store.put(key, content, {
      httpMetadata: {
        contentType: 'text/plain',
      },
    });

    return key;
  } catch (error) {
    // Enhanced error logging with timestamps
    console.error(
      `[${new Date().toISOString()}] R2 storage error (put): ${error.message}`
    );
    console.error(`Failed to store ${prefix} content with key: ${key}`);

    // Rethrow with context for easier debugging
    throw new Error(`Failed to store content in R2: ${error.message}`);
  }
}

/**
 * Retrieves content from R2 bucket with proper error handling
 * @param {Object} env - Environment object containing CONTENT_STORE
 * @param {string} key - Key where content is stored
 * @returns {Promise<string>} - Retrieved content
 */
export async function getContent(env, key) {
  try {
    // Get R2 store from env
    const store = env.CONTENT_STORE;

    if (!store) {
      throw new Error('CONTENT_STORE not available in environment');
    }

    // Retrieve content from R2
    const object = await store.get(key);

    if (object === null) {
      throw new Error(`Content not found for key: ${key}`);
    }

    // Use async text() method to get content as string
    return await object.text();
  } catch (error) {
    // Enhanced error logging with timestamps
    console.error(
      `[${new Date().toISOString()}] R2 storage error (get): ${error.message}`
    );
    console.error(`Failed to retrieve content with key: ${key}`);

    // Rethrow with context for easier debugging
    throw new Error(`Failed to retrieve content from R2: ${error.message}`);
  }
}

/**
 * Deletes content from R2 bucket with proper error handling
 * @param {Object} env - Environment object containing CONTENT_STORE
 * @param {string} key - Key to delete
 * @returns {Promise<boolean>}
 */
export async function deleteContent(env, key) {
  try {
    // Get R2 store from env
    const store = env.CONTENT_STORE;

    if (!store) {
      throw new Error('CONTENT_STORE not available in environment');
    }

    // Delete content from R2
    await store.delete(key);
    return true;
  } catch (error) {
    // Enhanced error logging with timestamps
    console.error(
      `[${new Date().toISOString()}] R2 storage error (delete): ${error.message}`
    );
    console.error(`Failed to delete content with key: ${key}`);

    // Log but don't throw error for deletion failures
    // since this is often called in a waitUntil context
    console.error(`Failed to delete content from R2: ${error.message}`);
    return false;
  }
}

// Helper function to get the local storage path for R2 objects during development
export function getLocalR2Path() {
  return '.wrangler/state/r2/';
}
