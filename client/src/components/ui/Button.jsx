import './Button.css';

/**
 * Reusable button component with multiple variants
 * @param {Object} props - Button props
 * @param {string} props.children - Button text/content
 * @param {string} props.variant - 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
 * @param {string} props.size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param {boolean} props.disabled - Disable the button
 * @param {boolean} props.loading - Show loading state
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...rest
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? <span className="spinner-inline" /> : null}
      {children}
    </button>
  );
}

export default Button;
