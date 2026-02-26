import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './Toast.css';

// Toast context to allow any component to show toasts
let toastCallback = null;

export function setToastCallback(callback) {
  toastCallback = callback;
}

// Hook to show toasts from any component
export function useToast() {
  return useCallback((message, type = 'info', duration = 3000) => {
    if (toastCallback) {
      toastCallback({ message, type, duration });
    }
  }, []);
}

function Toast({ toast, onRemove }) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{toast.message}</div>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const [nextId, setNextId] = useState(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = 'info', duration = 3000 }) => {
    const id = nextId;
    setNextId((prev) => prev + 1);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, [nextId]);

  useEffect(() => {
    setToastCallback(addToast);
  }, [addToast]);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

export default ToastContainer;
