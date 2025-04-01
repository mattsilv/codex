import { useState, useEffect } from 'preact/hooks';

/**
 * DevBlock - Only renders its children in development mode
 * Use this to wrap any UI elements that should only appear in development
 */
export default function DevBlock({ children }) {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    const hostname = window.location.hostname;
    const isDevEnvironment =
      hostname === 'localhost' ||
      hostname.includes('127.0.0.1') ||
      hostname.includes('.local');

    // Never show dev blocks on production domains
    const isProductionDomain =
      hostname === 'codex.silv.app' || hostname.includes('codex-abq.pages.dev');

    setIsDev(isDevEnvironment && !isProductionDomain);
  }, []);

  // Only render children in development mode
  return isDev ? children : null;
}
