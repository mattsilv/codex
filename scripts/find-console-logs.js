#!/usr/bin/env node
/**
 * Script to find and report all console.log() statements in the codebase
 * It identifies console statements, categorizes them, and generates a report
 * that can be used to systematically fix them
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build'];
const TEST_DIRS = ['tests', 'test', 'debug'];

// Output files
const REPORT_FILE = path.resolve(__dirname, '../console-log-report.md');
const REPLACE_SCRIPT = path.resolve(__dirname, './fix-console-logs.js');

// Console usage patterns
const CONSOLE_PATTERN = /console\.(log|warn|error|info|debug|trace)\(/g;
const CONSOLE_LINE_PATTERN = /console\.(log|warn|error|info|debug|trace)\((.+)\);?/;

/**
 * Finds all files in directory with given extensions
 */
function findFiles(dir, extensions, ignoreDirs = []) {
  let results = [];
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      
      // Skip ignored directories
      if (fs.statSync(fullPath).isDirectory()) {
        if (!ignoreDirs.includes(file)) {
          results = results.concat(findFiles(fullPath, extensions, ignoreDirs));
        }
        continue;
      }
      
      // Check file extension
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
  
  return results;
}

/**
 * Checks if a path is in a test directory
 */
function isInTestDir(filePath) {
  return TEST_DIRS.some(dir => filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`));
}

/**
 * Analyze file content for console statements
 */
function analyzeFile(filePath, content) {
  const lines = content.split('\n');
  const consoleUsages = [];
  const isTestFile = isInTestDir(filePath) || 
                    filePath.includes('test') || 
                    filePath.includes('debug');
  
  lines.forEach((line, index) => {
    const match = line.match(CONSOLE_PATTERN);
    if (match) {
      const lineNumber = index + 1;
      const method = match[0].split('.')[1].split('(')[0]; // Extract log/warn/error/info
      
      // Extract context - what's being logged
      const fullLine = line.trim();
      const context = extractContext(fullLine);
      
      consoleUsages.push({
        lineNumber,
        method,
        context,
        line: fullLine,
        isTestFile
      });
    }
  });
  
  return consoleUsages;
}

/**
 * Extract what's being logged from the console statement
 */
function extractContext(line) {
  const match = line.match(CONSOLE_LINE_PATTERN);
  if (match && match[2]) {
    return match[2].trim();
  }
  return 'Unable to parse context';
}

/**
 * Determine recommended action for each console statement
 */
function getRecommendation(usage) {
  // In test files, we generally allow console statements
  if (usage.isTestFile) {
    return {
      action: 'Keep',
      reason: 'Test file'
    };
  }
  
  // For non-test files
  switch (usage.method) {
    case 'log':
      if (usage.context.toLowerCase().includes('error')) {
        return {
          action: 'Replace',
          replacement: `console.error(${usage.context})`,
          reason: 'Convert to error - contains error information'
        };
      } else if (
        usage.context.toLowerCase().includes('warn') || 
        usage.context.toLowerCase().includes('warning')
      ) {
        return {
          action: 'Replace',
          replacement: `console.warn(${usage.context})`,
          reason: 'Convert to warn - contains warning information'
        };
      } else if (
        usage.context.toLowerCase().includes('init') ||
        usage.context.toLowerCase().includes('start') ||
        usage.context.toLowerCase().includes('loaded') ||
        usage.context.toLowerCase().includes('complete') ||
        usage.context.toLowerCase().includes('success')
      ) {
        return {
          action: 'Replace',
          replacement: `console.info(${usage.context})`,
          reason: 'Convert to info - contains initialization or success information'
        };
      } else {
        return {
          action: 'Remove',
          reason: 'Debug statement not needed in production'
        };
      }
    case 'debug':
    case 'trace':
      return {
        action: 'Remove',
        reason: 'Debug statement not needed in production'
      };
    // Keep error/warn/info as they are
    default:
      return {
        action: 'Keep',
        reason: `Already using appropriate console.${usage.method}`
      };
  }
}

/**
 * Generate markdown report
 */
function generateReport(results) {
  let report = '# Console Statement Analysis Report\n\n';
  
  // Summary statistics
  const total = results.reduce((sum, file) => sum + file.usages.length, 0);
  const actionCounts = {
    'Remove': 0,
    'Replace': 0,
    'Keep': 0
  };
  
  results.forEach(file => {
    file.usages.forEach(usage => {
      actionCounts[usage.recommendation.action]++;
    });
  });
  
  report += '## Summary\n\n';
  report += `- Total console statements found: ${total}\n`;
  report += `- Statements to remove: ${actionCounts['Remove']}\n`;
  report += `- Statements to replace: ${actionCounts['Replace']}\n`;
  report += `- Statements to keep: ${actionCounts['Keep']}\n\n`;
  
  // Generate detailed file reports
  report += '## Files containing console statements\n\n';
  
  results.forEach(file => {
    if (file.usages.length === 0) return;
    
    const filePath = file.path.replace(process.cwd(), '');
    report += `### ${filePath}\n\n`;
    
    if (file.usages.length > 0) {
      report += 'Line | Statement | Recommendation | Reason\n';
      report += '-----|-----------|----------------|-------\n';
      
      file.usages.forEach(usage => {
        const rec = usage.recommendation;
        const replacement = rec.replacement ? `\`${rec.replacement}\`` : 'N/A';
        report += `${usage.lineNumber} | \`${usage.line}\` | ${rec.action} ${rec.action === 'Replace' ? 'with ' + replacement : ''} | ${rec.reason}\n`;
      });
      
      report += '\n';
    }
  });
  
  return report;
}

/**
 * Generate script to fix console statements
 */
function generateFixScript(results) {
  let script = `#!/usr/bin/env node
// Auto-generated script to fix console statements
// Run with: node ${path.basename(REPLACE_SCRIPT)}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to process with their fixes
const filesToFix = [
`;

  // Add files that need changes
  results.forEach(file => {
    const needsChanges = file.usages.some(u => u.recommendation.action !== 'Keep');
    if (needsChanges) {
      script += `  {\n`;
      script += `    path: "${file.path}",\n`;
      script += `    fixes: [\n`;
      
      // Add each line to fix with its replacement
      file.usages.forEach(usage => {
        const rec = usage.recommendation;
        if (rec.action !== 'Keep') {
          script += `      {\n`;
          script += `        lineNumber: ${usage.lineNumber},\n`;
          script += `        action: "${rec.action}",\n`;
          
          if (rec.action === 'Replace') {
            script += `        original: \`${usage.line}\`,\n`;
            script += `        replacement: \`${rec.replacement}\`,\n`;
          } else if (rec.action === 'Remove') {
            script += `        original: \`${usage.line}\`,\n`;
          }
          
          script += `      },\n`;
        }
      });
      
      script += `    ],\n`;
      script += `  },\n`;
    }
  });

  script += `];

/**
 * Apply fixes to a file
 */
function fixFile(fileInfo) {
  console.info(\`Processing \${fileInfo.path}...\`);
  
  try {
    // Read file content
    let content = fs.readFileSync(fileInfo.path, 'utf8');
    let lines = content.split('\\n');
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
            console.info(\`  Line \${fix.lineNumber}: Replaced with \${fix.replacement}\`);
            changed = true;
          } else if (fix.action === 'Remove') {
            // Replace with empty string or comment depending on indentation
            const indent = currentLine.match(/^\\s*/)[0];
            lines[lineIndex] = \`\${indent}// REMOVED: \${currentLine.trim()}\`;
            console.info(\`  Line \${fix.lineNumber}: Removed\`);
            changed = true;
          }
        } else {
          console.warn(\`  Line \${fix.lineNumber}: Content doesn't match, skipping\`);
          console.warn(\`    Expected: \${fix.original.trim()}\`);
          console.warn(\`    Found:    \${currentLine.trim()}\`);
        }
      } else {
        console.warn(\`  Line \${fix.lineNumber}: Out of range\`);
      }
    }
    
    // Write changes back to file
    if (changed) {
      fs.writeFileSync(fileInfo.path, lines.join('\\n'), 'utf8');
      console.info(\`  ✅ Updated \${fileInfo.path}\`);
    } else {
      console.info(\`  ⚠️ No changes made to \${fileInfo.path}\`);
    }
  } catch (err) {
    console.error(\`  ❌ Error processing \${fileInfo.path}: \${err.message}\`);
  }
}

// Process each file
let fixCount = 0;
filesToFix.forEach(fileInfo => {
  fixFile(fileInfo);
  fixCount++;
});

console.info(\`\\nCompleted processing \${fixCount} files\`);
`;

  return script;
}

// Main execution
async function main() {
  console.info('Finding and analyzing console statements...');
  
  // Find all JavaScript and TypeScript files
  const files = findFiles(SRC_DIR, ['.js', '.jsx', '.ts', '.tsx'], IGNORE_DIRS);
  console.info(`Found ${files.length} files to analyze.`);
  
  // Analyze each file
  const results = [];
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const usages = analyzeFile(filePath, content);
      
      // Add recommendations
      usages.forEach(usage => {
        usage.recommendation = getRecommendation(usage);
      });
      
      results.push({
        path: filePath,
        usages
      });
      
      if (usages.length > 0) {
        console.info(`Found ${usages.length} console statements in ${filePath}`);
      }
    } catch (err) {
      console.error(`Error analyzing ${filePath}:`, err);
    }
  }
  
  // Filter and sort results
  const filteredResults = results.filter(file => file.usages.length > 0);
  filteredResults.sort((a, b) => b.usages.length - a.usages.length);
  
  // Generate report
  const report = generateReport(filteredResults);
  fs.writeFileSync(REPORT_FILE, report, 'utf8');
  console.info(`Report written to ${REPORT_FILE}`);
  
  // Generate fix script
  const fixScript = generateFixScript(filteredResults);
  fs.writeFileSync(REPLACE_SCRIPT, fixScript, 'utf8');
  fs.chmodSync(REPLACE_SCRIPT, '755'); // Make executable
  console.info(`Fix script generated at ${REPLACE_SCRIPT}`);
  
  console.info('\nDone! Next steps:');
  console.info(`1. Review the report in ${REPORT_FILE}`);
  console.info(`2. Run the fix script with 'node ${path.basename(REPLACE_SCRIPT)}'`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});