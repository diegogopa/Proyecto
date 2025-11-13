// src/components/common/CommonStyles.jsx
//Estilos comunes exportados

import styled from 'styled-components';
import Colors from '../../assets/Colors';

export const Text = styled.p`
    text-align: center;
    margin: 20px;
    color: ${Colors.detail};
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${Colors.background};
  color: ${Colors.white};
`;

export const Title = styled.h1`
  font-size: 36px;
  margin-bottom: 40px;
  color: ${Colors.primary};
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
`;

export const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #F6F5F5; /* El color de fondo general */
`;