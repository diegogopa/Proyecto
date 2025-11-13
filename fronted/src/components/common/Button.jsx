// src/components/common/Button.jsx, diego siempre que haya un return, significa que se renderiza el componente
//Componente de botón reutilizable

import React from 'react';
import styled from 'styled-components';
import Colors from '../../assets/Colors';

//Componente de botón estilizado usando styled-components
//Si $primary es true, usa el color primario, si es false, usa transparente
const StyledButton = styled.button` 
  background-color: ${({ $primary }) =>
    $primary ? Colors.primary : 'transparent'}; 
  color: ${({ $primary }) =>
    $primary ? Colors.white : Colors.primary};
  border: 2px solid ${Colors.primary};
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

//Componente funcional de botón reutilizable
const Button = ({ text, $primary, onClick, type }) => {
  return (
    <StyledButton $primary={$primary} onClick={onClick} type={type}>
      {text}
    </StyledButton>
  );
};

export default Button;