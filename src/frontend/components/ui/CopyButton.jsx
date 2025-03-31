import { useState } from 'preact/hooks';

export default function CopyButton({ content, style }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };
  
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', ...style }}>
      <button 
        onClick={handleCopy}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
        }}
        aria-label="Copy to clipboard"
        title="Copy to clipboard"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
        </svg>
      </button>
      
      {copied && (
        <span 
          style={{
            fontSize: '0.75rem',
            color: 'var(--primary)',
            fontWeight: 'bold',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          Copied!
        </span>
      )}
    </div>
  );
}