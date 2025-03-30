import { useState } from 'preact/hooks';
import Button from './Button';

export default function ShareButton({ id }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/shared/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="share-button"
    >
      {copied ? '\u2713 Copied' : 'Share'}
    </Button>
  );
}