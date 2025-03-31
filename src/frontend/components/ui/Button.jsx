/**
 * Button component - Using Pico CSS defaults
 * 
 * @param {ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {string} type - Button type (button, submit, reset)
 * @param {string} variant - Button style (outline, secondary, contrast)
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether button is disabled
 * @param {object} style - Inline styles (use sparingly)
 */
export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant, 
  className = '', 
  disabled = false,
  style = {}
}) {
  // Add variant classes
  let buttonClass = className;
  
  if (variant) {
    buttonClass += ` ${variant}`;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClass}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}