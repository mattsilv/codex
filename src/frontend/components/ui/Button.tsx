import { h, JSX } from 'preact';

/**
 * Button component - Using Tailwind CSS
 */
interface ButtonProps {
  children: JSX.Element | string | (JSX.Element | string)[];
  onClick?: (event: MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  className?: string;
  disabled?: boolean;
  style?: h.JSX.CSSProperties;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  style = {},
}: ButtonProps): JSX.Element {
  // Map variants to Tailwind classes
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'outline':
        return 'bg-transparent hover:bg-gray-100 text-blue-600 border border-blue-600';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  // Base classes that all buttons get
  const baseClasses =
    'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

  // Disabled state
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Combine all classes
  const buttonClasses = `${baseClasses} ${getVariantClasses()} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick as any}
      className={buttonClasses}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
