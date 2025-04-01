/**
 * Button component - Using Tailwind CSS
 *
 * @param {ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {string} type - Button type (button, submit, reset)
 * @param {string} variant - Button style (primary, secondary, outline)
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether button is disabled
 * @param {object} style - Inline styles (use sparingly)
 */
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  style = {},
}) {
  // Map variants to Tailwind classes
  const getVariantClasses = () => {
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
      onClick={onClick}
      className={buttonClasses}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
