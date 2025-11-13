// src/components/common/FeedbackModal.jsx
//Componente para mostrar mensajes de retroalimentación al usuario

import React from 'react';
import PropTypes from 'prop-types';
import yesIcon from '../../assets/Yes.webp';
import noIcon from '../../assets/No.png';
import questionIcon from '../../assets/Question.png';
import colors from '../../assets/Colors';
import { Text, Title } from './CommonStyles';
import Button from './Button'; 

const FeedbackModal = ({ type, message, details, onClose, onConfirm }) => { //Componente funcional que muestra un modal de retroalimentación
  let icon;
  let confirmLabel = 'Aceptar';
  let cancelLabel = 'Cancelar';

  switch (type) { //Determina el ícono y las etiquetas según el tipo de modal
    case 'yes':
      icon = yesIcon;
      confirmLabel = '¡Listo!';
      cancelLabel = null;
      break;

    case 'no':
    case 'error': 
      icon = noIcon;
      confirmLabel = 'Aceptar'; 
      cancelLabel = 'Cancelar'; 
      break;

    case 'question':
      icon = questionIcon;
      confirmLabel = 'Aceptar'; 
      break;

    default:
      icon = yesIcon;
  }

  // Si el tipo es 'error' o 'no', no queremos el botón principal, sino solo el de cerrar/aceptar
  const showCancelButton = type === 'question' || type === 'no';
  const showConfirmButton = type === 'question'; // Solo muestra Confirmar en 'question'

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalContainer, ...styles[type] }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={icon} alt={`${type} icon`} style={styles.modalIcon} />
        </div>
        <Title>{message}</Title>
        <Text>{details}</Text>
        <div style={styles.buttonContainer}> 
          {/* Lógica de botones para 'question' (Aceptar y Cancelar) */}
          {type === 'question' && (
            <>
              <Button text={cancelLabel} onClick={onClose} $primary={false} />
              <Button text={confirmLabel} onClick={onConfirm} $primary={true} />
            </>
          )}

          {/* Lógica de botones para 'no'/'error' (Cancelar y Aceptar) */}
          {(type === 'no' || type === 'error') && (
            <>
              <Button text="Cancelar" onClick={onClose} $primary={false} />
              <Button text="Aceptar" onClick={onClose} $primary={true} />
            </>
          )}

          {type === 'yes' && (
            <Button text={confirmLabel} onClick={onClose} $primary={true} />
          )}
        </div>
      </div>
    </div>
  );
};

//Estilo del fondo del aviso y del modal
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },  // Aseguramos que el modal esté por encima de otros elementos
  modalContainer: {
    backgroundColor: colors.background,
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0px 11px 5px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    color: '#000000',
    maxWidth: '400px',
    width: '100%',
  }, // Estilo base del modal
  yes: {
    border: `3px solid ${colors.primary}`,
  },
  no: {
    border: `3px solid ${colors.third}`,
  },
  question: {
    border: `3px solid ${colors.detail}`,
  },
  error: {
    border: `3px solid ${colors.third}`,
  }, // Estilos específicos por tipo
  modalIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.2)',
    marginBottom: '20px',
  }, // Estilo del icono
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
};

// Tipos para las props
FeedbackModal.propTypes = {
  type: PropTypes.oneOf(['yes', 'no', 'question', 'error']).isRequired,
  message: PropTypes.string.isRequired,
  details: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
};

export default FeedbackModal;