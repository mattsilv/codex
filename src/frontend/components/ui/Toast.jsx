export default function Toast({ message, type = 'info', onClose }) {
  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className={`toast toast-${getTypeClass()}`}>
      <p>{message}</p>
      {onClose && (
        <button type="button" onClick={onClose} className="close-button">
          &times;
        </button>
      )}
    </div>
  );
}