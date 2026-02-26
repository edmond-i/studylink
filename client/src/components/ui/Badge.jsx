import './Badge.css';

/**
 * Badge component for tags and labels
 * @param {Object} props - Badge props
 * @param {string} props.children - Badge text
 * @param {string} props.variant - 'primary' | 'success' | 'warning' | 'danger' (default: 'primary')
 * @param {string} props.className - Additional CSS classes
 */
function Badge({ children, variant = 'primary', className = '', ...rest }) {
  return (
    <span className={`badge badge-${variant} ${className}`} {...rest}>
      {children}
    </span>
  );
}

export default Badge;
