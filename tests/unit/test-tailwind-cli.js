import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a test CSS file with Tailwind directives
const testCssPath = path.join(__dirname, 'test-input.css');
const testCssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;

.test-component {
  @apply bg-blue-600 text-white p-4 rounded;
}
`;

// Write test CSS file
fs.writeFileSync(testCssPath, testCssContent);

// Run Tailwind CLI to build CSS
console.log('Running Tailwind CLI to build CSS...');
exec(
  `npx tailwindcss --input ${testCssPath} --output test-output.css`,
  (error, stdout, stderr) => {
    if (error) {
      console.error('Error running Tailwind CLI:');
      console.error(error);
      if (stderr) console.error(stderr);
      return;
    }

    console.log('Tailwind CSS build output:');
    console.log(stdout);

    // Read output file
    try {
      const outputPath = path.join(__dirname, 'test-output.css');
      if (fs.existsSync(outputPath)) {
        const outputContent = fs.readFileSync(outputPath, 'utf8');
        console.log('Output file created successfully!');
        console.log('First 200 characters:');
        console.log(outputContent.substring(0, 200) + '...');
      } else {
        console.error('Output file was not created.');
      }
    } catch (readError) {
      console.error('Error reading output file:', readError);
    }

    // Clean up
    try {
      fs.unlinkSync(testCssPath);
      console.log('Cleaned up test input file.');
    } catch (cleanupError) {
      console.error('Error cleaning up:', cleanupError);
    }
  }
);
