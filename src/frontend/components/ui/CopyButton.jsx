import { useState } from 'preact/hooks';

export default function CopyButton({ content, className }) {
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
    <div className={`inline-flex items-center gap-2 ${className || ''}`}>
      <button
        onClick={handleCopy}
        className="bg-transparent border-0 cursor-pointer p-1 flex items-center justify-center text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-label="Copy to clipboard"
        title="Copy to clipboard"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
        </svg>
      </button>

      {copied && (
        <span className="text-xs text-blue-600 font-bold animate-pulse">
          Copied!
        </span>
      )}
    </div>
  );
}
