export default function Footer() {
  const APP_VERSION = '1.1.1'; // Version number to help track deployments

  return (
    <div className="flex justify-between items-center w-full px-6 text-xs text-gray-500">
      <div className="flex gap-8">
        <a
          href="/about"
          className="hover:text-blue-600 hover:underline transition-colors"
        >
          About
        </a>
        <a
          href="/privacy"
          className="hover:text-blue-600 hover:underline transition-colors"
        >
          Privacy
        </a>
        <a
          href="/terms"
          className="hover:text-blue-600 hover:underline transition-colors"
        >
          Terms
        </a>
      </div>
      <div className="text-right">
        <small>
          &copy; {new Date().getFullYear()} Codex - LLM Prompt Tracker | v
          {APP_VERSION}
        </small>
      </div>
    </div>
  );
}
