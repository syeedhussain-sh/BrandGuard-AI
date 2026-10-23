import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, showToast } = useApp();

  if (!toastMessage) return null;

  const getIcon = () => {
    switch (toastMessage.type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon text-success" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon text-error" />;
      default:
        return <Info size={18} className="toast-icon text-info" />;
    }
  };

  return (
    <div className={`toast-container toast-${toastMessage.type}`} role="alert" aria-live="assertive">
      <div className="toast-content">
        {getIcon()}
        <span className="toast-text">{toastMessage.text}</span>
      </div>
      <button
        className="toast-close-btn"
        onClick={() => showToast('', 'info')}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
};
