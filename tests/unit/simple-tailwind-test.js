import postcss from 'postcss';
import tailwindcssPostCSS from '@tailwindcss/postcss';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testTailwind = async () => {
  try {
    console.log('Testing Tailwind CSS processing with @tailwindcss/postcss...');

    // Create a simple CSS file with Tailwind directives
    const css = `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
      
      .my-custom-class {
        @apply text-blue-600 bg-gray-100 p-4;
      }
    `;

    // Get the path to tailwind.config.js
    const configPath = path.resolve(__dirname, 'tailwind.config.js');
    console.log(`Using config at: ${configPath}`);

    // Check if config exists
    if (!fs.existsSync(configPath)) {
      console.error('Error: tailwind.config.js not found!');
      return;
    }

    // Process the CSS with PostCSS + Tailwind
    const result = await postcss([tailwindcssPostCSS()]).process(css, {
      from: undefined,
    });

    console.log('Success! Tailwind CSS processed correctly.');
    console.log('First 200 characters of output:');
    console.log(result.css.substring(0, 200) + '...');
  } catch (error) {
    console.error('Error processing Tailwind CSS:');
    console.error(error);
  }
};

testTailwind();
