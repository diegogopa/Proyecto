//src/pages/CarQuestion.jsx
//Página para preguntar si el usuario quiere registrar un carro
//Incluye: formulario para preguntar si el usuario quiere registrar un carro, botón para guardar la respuesta y botón para volver a la página anterior

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Colors from "../assets/Colors";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useMessage } from '../contexts/MessageContext';
import { getUser, getUserEmail, setUser, clearSession, removeUserEmail } from '../utils/storage';

//Estilos
const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${Colors.pageBackground};
  padding: 20px;
`;

const Card = styled.div`
  background-color: ${Colors.white};
  padding: 50px 30px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  min-width: 350px;
  border: 1px solid ${Colors.primary};
`;

const Title = styled.h2`
  color: ${Colors.primary};
  font-size: 22px;
  margin-bottom: 20px;
  text-align: center;
`;

const Options = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
`;

const OptionLabel = styled.label`
  font-size: 16px;
  color: ${Colors.primary};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CarQuestion = () => {
  const { showError } = useMessage();
  const [answer, setAnswer] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario ya tiene carro registrado al cargar el componente
    const checkUserCar = async () => {
      try {
        const storedUser = getUser();
        let userEmail = getUserEmail();
        
        // Si no hay email pero hay usuario en storage, usar el email del usuario
        if (!userEmail && storedUser && storedUser.email) {
          userEmail = storedUser.email;
          setUserEmail(userEmail);
        }
        
        // Si hay usuario en storage, verificar si tiene carro completo
        if (storedUser && storedUser.email) {
          const hasCarComplete = storedUser.placa?.trim() &&
                                storedUser.marca?.trim() &&
                                storedUser.modelo?.trim() &&
                                storedUser.cupos > 0;
          
          if (hasCarComplete) {
            navigate("/home-driver");
            return;
          }
          
          // Si el usuario tiene email, usarlo para verificar en backend si es necesario
          if (storedUser.email && !userEmail) {
            userEmail = storedUser.email;
            setUserEmail(userEmail);
          }
        }
        
        // Si no hay email ni usuario, redirigir a login
        if (!userEmail && !storedUser) {
          clearSession();
          navigate("/login");
          return;
        }
        
        // Si tenemos email pero no usuario completo, obtenerlo del backend
        if (userEmail && (!storedUser || storedUser.email !== userEmail)) {
          const res = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
          const user = res.data;

          if (user.email !== userEmail) {
            clearSession();
            navigate("/login");
            return;
          }

          // Guardar el usuario en storage
          setUser(user);

          const hasCarComplete = user.placa?.trim() &&
                                user.marca?.trim() &&
                                user.modelo?.trim() &&
                                user.cupos > 0;

          if (hasCarComplete) {
            navigate("/home-driver");
          }
        }
      } catch (error) {
        // Solo limpiar si es un error de autenticación o usuario no encontrado
        if (error.response?.status === 404 || error.response?.status === 401) {
          clearSession();
          navigate("/login");
        }
        // Si es otro error (como de red), no hacer nada y dejar que el usuario continúe
      }
    };

    checkUserCar();
  }, [navigate]);

  const handleNext = async () => {
    if (!answer) {
      showError("Opción requerida", "Selecciona una opción para continuar");
      return;
    }

    try {
      let user = getUser();
      let userEmail = getUserEmail();
      
      // Si no hay email pero hay usuario en storage, usar el email del usuario
      if (!userEmail && user && user.email) {
        userEmail = user.email;
        setUserEmail(userEmail);
      }
      
      // Si no tenemos usuario ni email, intentar obtenerlo del backend
      if (!user && userEmail) {
        const res = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
        user = res.data;
        setUser(user);
      }
      
      // Si aún no tenemos usuario ni email, mostrar error
      if (!user && !userEmail) {
        showError("Sesión no encontrada", "No se encontró la información del usuario. Por favor, inicia sesión.");
        navigate("/login");
        return;
      }
      
      // Si tenemos usuario pero no coincide el email, verificar en backend
      if (user && userEmail && user.email !== userEmail) {
        const res = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
        user = res.data;
        setUser(user);
      }
      
      // Si tenemos email pero no usuario, obtenerlo del backend
      if (userEmail && (!user || user.email !== userEmail)) {
        const res = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
        user = res.data;
        setUser(user);
      }

      if (answer === "no") {
        // Si el usuario no quiere registrar un carro, ir directamente al home
        navigate("/home");
        return;
      }

      const hasCarComplete =
        user.placa?.trim() &&
        user.marca?.trim() &&
        user.modelo?.trim() &&
        user.cupos > 0;

      if (hasCarComplete) {
        navigate("/home-driver");
      } else {
        navigate("/register-car");
      }

    } catch (error) {
      // Solo limpiar la sesión si hay un error real
      if (error.response?.status === 404 || error.response?.status === 401) {
        clearSession();
        showError("Error de verificación", "No se pudo verificar la información del usuario. Por favor, inicia sesión.");
        navigate("/login");
      } else {
        showError("Error de conexión", "No se pudo conectar con el servidor. Por favor, intenta nuevamente.");
      }
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Title>¿Quieres registrar un carro?</Title>

        <Options>
          <OptionLabel>
            <input
              type="radio"
              name="carro"
              value="no"
              checked={answer === "no"}
              onChange={(e) => setAnswer(e.target.value)}
            />
            No
          </OptionLabel>

          <OptionLabel>
            <input
              type="radio"
              name="carro"
              value="si"
              checked={answer === "si"}
              onChange={(e) => setAnswer(e.target.value)}
            />
            Sí
          </OptionLabel>
        </Options>

        <Button text="Siguiente" $primary onClick={handleNext} />
      </Card>
    </PageWrapper>
  );
};

export default CarQuestion;