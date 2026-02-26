import './Input.css';

/**
 * Reusable input component
 * @param {Object} props - Input props
 * @param {string} props.type - Input type (default: 'text')
 * @param {string} props.label - Label text
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message to display
 * @param {boolean} props.disabled - Disable the input
 * @param {string} props.className - Additional CSS classes
 */
function Input({
  type = 'text',
  label,
  placeholder,
  error,
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <div className={`input-group ${className}`}>
      {label && <label>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'error' : ''}
        {...rest}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

export default Input;
