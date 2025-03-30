export default function Button({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'secondary';
      case 'contrast':
        return 'contrast';
      case 'outline':
        return 'outline';
      default:
        return 'primary';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${getVariantClass()} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}