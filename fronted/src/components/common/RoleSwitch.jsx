//Direccion
// Interruptor de rol usuario

import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setRole, selectUserRole, selectHasCar } from '../../features/users/UserSlice.jsx';
import FeedbackModal from "./FeedbackModal.jsx"; // Asegúrate que la ruta sea correcta
import colors from '../../assets/Colors';

//Estilos para el interruptor de rol
const RoleToggle = styled.div`
    display: flex;
    background-color: #2c3e50; /* Color de fondo del interruptor */
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    margin-right: 15px; /* Separación del icono de perfil */
    border: 2px solid ${colors.white};
`;

const RoleIcon = styled.div`
    padding: 8px 12px;
    color: ${props => props.active ? colors.white : '#7f8c8d'};
    background-color: ${props => props.active ? colors.primary : 'transparent'};
    transition: background-color 0.3s, color 0.3s;
    font-size: 1.2rem;

    &.person-icon::before {
        content: "👤";
    }

    &.car-icon::before {
        content: "🚗";
    }
`;

const RoleSwitch = () => {
  const dispatch = useDispatch();
  const currentRole = useSelector(selectUserRole);
  const hasCar = useSelector(selectHasCar);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('confirm'); // 'confirm' o 'carError'

  const isConductor = currentRole === 'conductor';

  const handleSwitchClick = (newRole) => {
    if (newRole === currentRole) return; // No hacer nada si ya está en ese rol

    if (newRole === 'pasajero') {

      dispatch(setRole('pasajero'));
     
    } else {
      if (!hasCar) {
        setModalType('carError');
        setShowModal(true);
      } else {
        setModalType('confirm');
        setShowModal(true);
      }
    }
  };

  const handleConfirmChange = () => { //Función que se ejecuta al confirmar el cambio a conductor
    dispatch(setRole('conductor'));
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
    // Si cancela la transición a conductor, se queda en pasajero (pantalla actual)
  };

  return (
    <>
      <RoleToggle>
        <RoleIcon
          className="person-icon"
          active={!isConductor}
          onClick={() => handleSwitchClick('pasajero')}
        />

        <RoleIcon
          className="car-icon"
          active={isConductor}
          onClick={() => handleSwitchClick('conductor')}
        />
      </RoleToggle>


      {showModal && modalType === 'confirm' && (
        <FeedbackModal
          type="question"
          message="¿Está seguro que desea cambiar a modo Conductor?"
          details="Esta acción afectará la manera en que usa la app."
          onConfirm={handleConfirmChange}
          onClose={handleCancel}
        />
      )}

      {showModal && modalType === 'carError' && (
        <FeedbackModal
          type="error"
          message="No tienes un carro registrado."
          details="Debes registrar un carro para cambiar a modo conductor."
          onClose={handleCancel} 
        />
      )}
    </>
  );
};

export default RoleSwitch;