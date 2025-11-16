// src/pages/Login.jsx
//Página para iniciar sesión
//Incluye: formulario para iniciar sesión, botón para iniciar sesión y botón para volver a la página de registro

import React, { useState } from 'react';
import styled from 'styled-components';
import Colors from '../assets/Colors';
import Button from '../components/common/Button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/common/Loader';
import FeedbackModal from '../components/common/FeedbackModal';
import { clearSession, setUser, setUserEmail, setToken } from '../utils/storage';

const API_BASE_URL = "https://proyecto5-vs2l.onrender.com/api"; 

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${Colors.white};
  padding: 20px;
`;

const Card = styled.div`
  background-color: ${Colors.white};
  padding: 30px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  min-width: 350px;
  border: 1px solid ${Colors.primary};
`;

const Title = styled.h1`
  color: ${Colors.primary};
  font-size: 26px;
  margin-bottom: 25px;
`;

const Input = styled.input`
  width: 80%;
  padding: 12px;
  border: 1.8px solid ${Colors.primary};
  border-radius: 6px;
  font-size: 15px;
  margin-bottom: 15px;
  outline: none;
  &::placeholder { color: #999; }
`;

const Text = styled.p`
  margin-top: 15px;
  font-size: 14px;
  color: ${Colors.primary};
`;

const StyledLink = styled(Link)`
  color: blue;
  text-decoration: none;
  font-weight: 500;
  &:hover { text-decoration: underline; }
`;

const ErrorText = styled.div`
  color: red;
  font-size: 12px;
  align-self: flex-start;
  margin-top: -10px;
  margin-bottom: 15px;
  width: 80%;
`;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalDetails, setModalDetails] = useState('');
  const [modalType, setModalType] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorEmail(''); setErrorPassword('');

    if (!email) { setErrorEmail('Ingrese un correo electrónico'); return; }
    if (!password) { setErrorPassword('Ingrese una contraseña'); return; }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: email.trim(),
        password: password.trim()
      });

      clearSession();
      
      setUser(response.data.user);
      setUserEmail(email.trim());
      if (response.data.token) {
        setToken(response.data.token);
      }

      setModalMessage('¡Bienvenido de vuelta!');
      setModalDetails('Serás redirigido a la página principal.');
      setModalType('yes');
      setShowModal(true);

    } catch (error) {
      setModalMessage('Error de Sesión');
      setModalDetails(error.response?.data?.message || 'Correo o contraseña incorrectos.');
      setModalType('no');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalType === 'yes') navigate('/home'); // redirige al home
  };

  return (
    <PageWrapper>
      {loading && <Loader />}
      <Card>
        <Title>Iniciar Sesión</Title>
        <form style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onSubmit={handleLogin}>
          <Input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errorEmail && <ErrorText>{errorEmail}</ErrorText>}
          <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errorPassword && <ErrorText>{errorPassword}</ErrorText>}
          <div style={{ marginTop: '20px', width: '100%' }}>
            <Button text="Iniciar Sesión" $primary type="submit" style={{ width: '100%' }} />
          </div>
        </form>
        <Text>¿No tienes cuenta? <br /><StyledLink to="/register">Regístrate</StyledLink></Text>
      </Card>

      {showModal && <FeedbackModal type={modalType} message={modalMessage} details={modalDetails} onClose={handleCloseModal} />}
    </PageWrapper>
  );
};

export default Login;