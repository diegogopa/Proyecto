// src/pages/LandingPage.jsx
//Página de inicio
//Incluye: botón para iniciar sesión y botón para registrarse

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import logo from '../assets/Logo.png';
import Colors from '../assets/Colors';

//Estilos
const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${Colors.Background};
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Card = styled.div`
  background-color: ${Colors.white};
  padding: 80px 100px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 60px 50px;
    width: 100%;
    max-width: 400px;
  }

  @media (max-width: 480px) {
    padding: 40px 25px;
  }
`;

const Logo = styled.img`
  width: 190px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    width: 150px;
    margin-bottom: 30px;
  }

  @media (max-width: 480px) {
    width: 120px;
    margin-bottom: 25px;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  align-items: center;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const LandingPage = () => {
  return (
    <PageWrapper>
      <Card>
        <Logo src={logo} alt="Logo" />
        <ButtonsContainer>
          <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
            <Button text="Iniciar Sesión" $primary style={{ width: '100%' }} />
          </Link>

          <Link to="/register" style={{ textDecoration: 'none', width: '100%' }}>
            <Button text="Registrarse" style={{ width: '100%' }} />
          </Link>
        </ButtonsContainer>
      </Card>
    </PageWrapper>
  );
};

export default LandingPage;