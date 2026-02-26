import './Spinner.css';

/**
 * Full-page spinner for loading states
 * @param {Object} props - Spinner props
 * @param {string} props.message - Loading message
 */
function Spinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

export default Spinner;
