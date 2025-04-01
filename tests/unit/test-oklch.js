// Test OKLCH colors for Tailwind CSS 4
import tailwindColors from 'tailwindcss/colors.js';

// eslint-disable-next-line no-console
console.log('Testing Tailwind CSS v4 colors:');
// eslint-disable-next-line no-console
console.log('Available color palettes:', Object.keys(tailwindColors));

// Check if blue is available
if (tailwindColors.blue) {
  // eslint-disable-next-line no-console
  console.log('\nBlue color palette:');
  // eslint-disable-next-line no-console
  console.log(tailwindColors.blue);
} else {
  // eslint-disable-next-line no-console
  console.log('\nBlue color palette is not available!');
}

// Define missing variables with default values
const l = 0.7; // Example lightness
const c = 0.1; // Example chroma
const h = 200; // Example hue
const delta = 0.1; // Example delta

function generateRandomOklchColor() {
  // ... (rest of the function remains the same)
  const colorString = `oklch(${l}% ${c} ${h})`;
  // eslint-disable-next-line no-console
  console.log(`Generated color: ${colorString}`);
  return `${colorString}; --color-fg: oklch(from ${colorString} calc(l + ${delta} / l) c h); /* OKLCH! */`;
}

const colorString = `oklch(${l}% ${c} ${h})`;
// eslint-disable-next-line no-console
console.log(`Generated color: ${colorString}`);
