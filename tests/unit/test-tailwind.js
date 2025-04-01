// Test script for Tailwind CSS configuration
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

console.log('=== TAILWIND CSS CONFIGURATION TEST ===');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for required configuration files
const tailwindConfigExists = fs.existsSync(
  join(__dirname, 'tailwind.config.js')
);
const postcssConfigExists = fs.existsSync(join(__dirname, 'postcss.config.js'));
const tailwindCssExists = fs.existsSync(
  join(__dirname, 'src/frontend/styles/tailwind.css')
);

// Check content of postcss.config.js
let postcssConfigCorrect = false;
if (postcssConfigExists) {
  const postcssConfig = fs.readFileSync(
    join(__dirname, 'postcss.config.js'),
    'utf8'
  );
  postcssConfigCorrect = postcssConfig.includes('tailwindcss');
}

// Check if package.json includes required dependencies
const packageJsonExists = fs.existsSync(join(__dirname, 'package.json'));
let dependenciesCorrect = false;
if (packageJsonExists) {
  const packageJson = JSON.parse(
    fs.readFileSync(join(__dirname, 'package.json'), 'utf8')
  );
  const hasTailwind =
    packageJson.devDependencies && packageJson.devDependencies.tailwindcss;
  const hasAutoprefixer =
    packageJson.devDependencies && packageJson.devDependencies.autoprefixer;
  dependenciesCorrect = hasTailwind && hasAutoprefixer;
}

// Print results
console.log(
  `tailwind.config.js exists: ${tailwindConfigExists ? 'PASSED ✅' : 'FAILED ❌'}`
);
console.log(
  `postcss.config.js exists: ${postcssConfigExists ? 'PASSED ✅' : 'FAILED ❌'}`
);
console.log(
  `Tailwind CSS file exists: ${tailwindCssExists ? 'PASSED ✅' : 'FAILED ❌'}`
);
console.log(
  `postcss.config.js uses correct plugin: ${postcssConfigCorrect ? 'PASSED ✅' : 'FAILED ❌'}`
);
console.log(
  `Package.json has required dependencies: ${dependenciesCorrect ? 'PASSED ✅' : 'FAILED ❌'}`
);

// Overall result
const overallSuccess =
  tailwindConfigExists &&
  postcssConfigExists &&
  tailwindCssExists &&
  postcssConfigCorrect &&
  dependenciesCorrect;

console.log(`\nOverall result: ${overallSuccess ? 'PASSED ✅' : 'FAILED ❌'}`);

if (!overallSuccess) {
  console.log('\nRecommended fixes:');
  if (!tailwindConfigExists) console.log('- Create tailwind.config.js file');
  if (!postcssConfigExists) console.log('- Create postcss.config.js file');
  if (!tailwindCssExists)
    console.log('- Create src/frontend/styles/tailwind.css file');
  if (!postcssConfigCorrect)
    console.log('- Update postcss.config.js to use tailwindcss');
  if (!dependenciesCorrect)
    console.log('- Install tailwindcss package using: pnpm add -D tailwindcss');
}
