// src/contexts/MessageContext.jsx
// Contexto global para manejar mensajes de retroalimentación al usuario

import React, { createContext, useContext, useState } from 'react';
import FeedbackModal from '../components/common/FeedbackModal';

const MessageContext = createContext();

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage debe usarse dentro de MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const showMessage = (type, message, details = '', onConfirm = null) => {
    setModal({
      type,
      message,
      details,
      onConfirm,
    });
  };

  const showError = (message, details = '') => {
    showMessage('error', message, details);
  };

  const showSuccess = (message, details = '') => {
    showMessage('yes', message, details);
  };

  const showWarning = (message, details = '') => {
    showMessage('no', message, details);
  };

  const showQuestion = (message, details = '', onConfirm = null) => {
    showMessage('question', message, details, onConfirm);
  };

  const closeModal = () => {
    setModal(null);
  };

  const handleConfirm = () => {
    if (modal?.onConfirm) {
      modal.onConfirm();
    }
    closeModal();
  };

  return (
    <MessageContext.Provider
      value={{
        showMessage,
        showError,
        showSuccess,
        showWarning,
        showQuestion,
        closeModal,
      }}
    >
      {children}
      {modal && (
        <FeedbackModal
          type={modal.type}
          message={modal.message}
          details={modal.details}
          onClose={closeModal}
          onConfirm={modal.onConfirm ? handleConfirm : null}
        />
      )}
    </MessageContext.Provider>
  );
};

