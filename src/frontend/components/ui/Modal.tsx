import { h, JSX } from 'preact';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element | JSX.Element[] | string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
