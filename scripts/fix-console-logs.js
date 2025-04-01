#!/usr/bin/env node
// Auto-generated script to fix console statements
// Run with: node fix-console-logs.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to process with their fixes
const filesToFix = [
  {
    path: "/Users/m/gh/codex/src/frontend/context/AuthContext.jsx",
    fixes: [
      {
        lineNumber: 77,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 89,
        action: "Remove",
        original: `console.log('AuthContext: Login response status:', response.status);`,
      },
      {
        lineNumber: 94,
        action: "Replace",
        original: `console.log('AuthContext: Login response data:', errorData);`,
        replacement: `console.error('AuthContext: Login response data:', errorData)`,
      },
      {
        lineNumber: 123,
        action: "Replace",
        original: `console.log('AuthContext: Login success, user data:', data.user);`,
        replacement: `console.info('AuthContext: Login success, user data:', data.user)`,
      },
      {
        lineNumber: 143,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 147,
        action: "Remove",
        original: `console.log('AuthContext: Registration payload:', {`,
      },
      {
        lineNumber: 161,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 175,
        action: "Replace",
        original: `console.log('AuthContext: Registration success, user data:', data.user);`,
        replacement: `console.info('AuthContext: Registration success, user data:', data.user)`,
      },
      {
        lineNumber: 229,
        action: "Remove",
        original: `console.log('AuthContext: Sending profile update request');`,
      },
      {
        lineNumber: 275,
        action: "Remove",
        original: `console.log('AuthContext: Sending account deletion request');`,
      },
      {
        lineNumber: 307,
        action: "Remove",
        original: `console.log('AuthContext: Sending email verification request');`,
      },
      {
        lineNumber: 324,
        action: "Replace",
        original: `console.log('AuthContext: Verification success, user data:', data.user);`,
        replacement: `console.info('AuthContext: Verification success, user data:', data.user)`,
      },
      {
        lineNumber: 349,
        action: "Remove",
        original: `console.log('AuthContext: Resending verification code');`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/frontend/context/AuthContext.tsx",
    fixes: [
      {
        lineNumber: 132,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 144,
        action: "Remove",
        original: `console.log('AuthContext: Login response status:', response.status);`,
      },
      {
        lineNumber: 149,
        action: "Replace",
        original: `console.log('AuthContext: Login response data:', errorData);`,
        replacement: `console.error('AuthContext: Login response data:', errorData)`,
      },
      {
        lineNumber: 178,
        action: "Replace",
        original: `console.log('AuthContext: Login success, user data:', data.user);`,
        replacement: `console.info('AuthContext: Login success, user data:', data.user)`,
      },
      {
        lineNumber: 203,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 207,
        action: "Remove",
        original: `console.log('AuthContext: Registration payload:', {`,
      },
      {
        lineNumber: 221,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 235,
        action: "Replace",
        original: `console.log('AuthContext: Registration success, user data:', data.user);`,
        replacement: `console.info('AuthContext: Registration success, user data:', data.user)`,
      },
      {
        lineNumber: 290,
        action: "Remove",
        original: `console.log('AuthContext: Sending profile update request');`,
      },
      {
        lineNumber: 337,
        action: "Remove",
        original: `console.log('AuthContext: Sending account deletion request');`,
      },
      {
        lineNumber: 373,
        action: "Remove",
        original: `console.log('AuthContext: Sending email verification request');`,
      },
      {
        lineNumber: 390,
        action: "Replace",
        original: `console.log('AuthContext: Verification success, user data:', data.user);`,
        replacement: `console.info('AuthContext: Verification success, user data:', data.user)`,
      },
      {
        lineNumber: 418,
        action: "Remove",
        original: `console.log('AuthContext: Resending verification code');`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/backend/api/auth.js",
    fixes: [
      {
        lineNumber: 31,
        action: "Remove",
        original: `console.log(`Found ${usersToDelete.length} users to permanently delete`);`,
      },
      {
        lineNumber: 51,
        action: "Remove",
        original: `console.log(`Permanently deleted user ${user.id}`);`,
      },
      {
        lineNumber: 64,
        action: "Remove",
        original: `console.log('Auth API request:', request.method, path);`,
      },
      {
        lineNumber: 65,
        action: "Remove",
        original: `console.log('Auth headers:', Object.fromEntries(request.headers.entries()));`,
      },
      {
        lineNumber: 74,
        action: "Remove",
        original: `console.log('Direct deletion test for user ID:', userId);`,
      },
      {
        lineNumber: 109,
        action: "Remove",
        original: `console.log('User marked for deletion:', userId);`,
      },
      {
        lineNumber: 577,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 667,
        action: "Remove",
        original: `console.log('Processing deletion request for user:', request.user);`,
      },
      {
        lineNumber: 668,
        action: "Remove",
        original: `console.log('User ID:', request.user?.id);`,
      },
      {
        lineNumber: 735,
        action: "Remove",
        original: `console.log('Direct test delete for user ID:', userId);`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/frontend/pages/Auth.tsx",
    fixes: [
      {
        lineNumber: 101,
        action: "Remove",
        original: `console.log('Auth form submission:', {`,
      },
      {
        lineNumber: 110,
        action: "Remove",
        original: `console.log(`Making direct fetch to ${API_URL}/auth/${endpoint}`);`,
      },
      {
        lineNumber: 124,
        action: "Remove",
        original: `console.log('Direct API response status:', response.status);`,
      },
      {
        lineNumber: 135,
        action: "Replace",
        original: `console.log('Direct API success response:', data);`,
        replacement: `console.info('Direct API success response:', data)`,
      },
      {
        lineNumber: 142,
        action: "Replace",
        original: `console.log('Authentication successful, attempting data migration');`,
        replacement: `console.info('Authentication successful, attempting data migration')`,
      },
      {
        lineNumber: 145,
        action: "Remove",
        original: `console.log('Migration result:', result);`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/frontend/utils/migrateLegacyData.ts",
    fixes: [
      {
        lineNumber: 76,
        action: "Remove",
        original: `console.log(`[MIGRATION] ✅ ${message}`);`,
      },
      {
        lineNumber: 79,
        action: "Remove",
        original: `console.log(`[MIGRATION] ${message}`);`,
      },
      {
        lineNumber: 341,
        action: "Remove",
        original: `console.log('[MIGRATION] Clearing localStorage data');`,
      },
      {
        lineNumber: 351,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 358,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 367,
        action: "Remove",
        original: `console.log('[MIGRATION] Cleared original localStorage data');`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/backend/utils/seedTestData.js",
    fixes: [
      {
        lineNumber: 12,
        action: "Remove",
        original: `console.log('Seeding test data...');`,
      },
      {
        lineNumber: 20,
        action: "Remove",
        original: `console.log('Test data already exists. Skipping seed operation.');`,
      },
      {
        lineNumber: 47,
        action: "Remove",
        original: `console.log('Created test users');`,
      },
      {
        lineNumber: 95,
        action: "Remove",
        original: `console.log('CONTENT_STORE not available. Skipping content storage.');`,
      },
      {
        lineNumber: 99,
        action: "Remove",
        original: `console.log('Created test prompts');`,
      },
      {
        lineNumber: 171,
        action: "Remove",
        original: `console.log(`,
      },
      {
        lineNumber: 177,
        action: "Remove",
        original: `console.log('Created test responses');`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/backend/index.ts",
    fixes: [
      {
        lineNumber: 73,
        action: "Remove",
        original: `console.log(`Request: ${request.method} ${path}`);`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/frontend/utils/dataMigration.js",
    fixes: [
      {
        lineNumber: 55,
        action: "Remove",
        original: `console.log(`Migrated prompt: ${prompt.title || 'Untitled'}`);`,
      },
      {
        lineNumber: 86,
        action: "Remove",
        original: `console.log(`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/frontend/utils/dataMigration.ts",
    fixes: [
      {
        lineNumber: 121,
        action: "Remove",
        original: `console.log(`Migrated prompt: ${prompt.title || 'Untitled'}`);`,
      },
      {
        lineNumber: 152,
        action: "Remove",
        original: `console.log(`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/backend/utils/emailService.js",
    fixes: [
      {
        lineNumber: 49,
        action: "Replace",
        original: `console.log(`Email sent successfully to ${to}, ID: ${data.id}`);`,
        replacement: `console.info(`Email sent successfully to ${to}, ID: ${data.id}`)`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/frontend/components/auth/RegisterForm.jsx",
    fixes: [
      {
        lineNumber: 66,
        action: "Remove",
        original: `console.log('Attempting registration for:', formData.email);`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/frontend/components/auth/LoginForm.jsx",
    fixes: [
      {
        lineNumber: 61,
        action: "Remove",
        original: `console.log('Attempting login for:', formData.email);`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/frontend/components/auth/LoginForm.tsx",
    fixes: [
      {
        lineNumber: 77,
        action: "Remove",
        original: `console.log('Attempting login for:', formData.email);`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/frontend/components/prompt/PromptCard.jsx",
    fixes: [
      {
        lineNumber: 37,
        action: "Remove",
        original: `console.log('Duplicate prompt:', id);`,
      },
      {
        lineNumber: 43,
        action: "Remove",
        original: `console.log('Delete prompt:', id);`,
      },
    ],
  },
  {
    path: "/Users/m/gh/codex/src/backend/middleware/cors.js",
    fixes: [
      {
        lineNumber: 66,
        action: "Replace",
        original: `console.log(`Warning: Using wildcard CORS for unknown origin: ${origin}`);`,
        replacement: `console.warn(`Warning: Using wildcard CORS for unknown origin: ${origin}`)`,
      },
    ],
  },
];

/**
 * Apply fixes to a file
 */
function fixFile(fileInfo) {
  console.info(`Processing ${fileInfo.path}...`);
  
  try {
    // Read file content
    let content = fs.readFileSync(fileInfo.path, 'utf8');
    let lines = content.split('\n');
    let changed = false;
    
    // Process fixes in reverse order (bottom to top) to avoid line number issues
    const sortedFixes = [...fileInfo.fixes].sort((a, b) => b.lineNumber - a.lineNumber);
    
    for (const fix of sortedFixes) {
      const lineIndex = fix.lineNumber - 1;
      
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const currentLine = lines[lineIndex];
        
        // Verify we're fixing the right line
        if (currentLine.trim() === fix.original.trim()) {
          if (fix.action === 'Replace') {
            lines[lineIndex] = currentLine.replace(fix.original, fix.replacement);
            console.info(`  Line ${fix.lineNumber}: Replaced with ${fix.replacement}`);
            changed = true;
          } else if (fix.action === 'Remove') {
            // Replace with empty string or comment depending on indentation
            const indent = currentLine.match(/^\s*/)[0];
            lines[lineIndex] = `${indent}// REMOVED: ${currentLine.trim()}`;
            console.info(`  Line ${fix.lineNumber}: Removed`);
            changed = true;
          }
        } else {
          console.warn(`  Line ${fix.lineNumber}: Content doesn't match, skipping`);
          console.warn(`    Expected: ${fix.original.trim()}`);
          console.warn(`    Found:    ${currentLine.trim()}`);
        }
      } else {
        console.warn(`  Line ${fix.lineNumber}: Out of range`);
      }
    }
    
    // Write changes back to file
    if (changed) {
      fs.writeFileSync(fileInfo.path, lines.join('\n'), 'utf8');
      console.info(`  ✅ Updated ${fileInfo.path}`);
    } else {
      console.info(`  ⚠️ No changes made to ${fileInfo.path}`);
    }
  } catch (err) {
    console.error(`  ❌ Error processing ${fileInfo.path}: ${err.message}`);
  }
}

// Process each file
let fixCount = 0;
filesToFix.forEach(fileInfo => {
  fixFile(fileInfo);
  fixCount++;
});

console.info(`\nCompleted processing ${fixCount} files`);
