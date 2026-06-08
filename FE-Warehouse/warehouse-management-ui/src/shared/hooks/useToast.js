import { useState, useCallback } from 'react';
import { TOAST_TYPES } from '@shared/components/Toast';

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = ++toastIdCounter;
    const newToast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return showToast(message, TOAST_TYPES.SUCCESS, duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    return showToast(message, TOAST_TYPES.ERROR, duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    return showToast(message, TOAST_TYPES.WARNING, duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    return showToast(message, TOAST_TYPES.INFO, duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  };
};

