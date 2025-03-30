export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  required = false,
  placeholder = '',
  error = '',
}) {
  return (
    <div>
      {label && (
        <label htmlFor={name}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
      />
      {error && <small className="error">{error}</small>}
    </div>
  );
}