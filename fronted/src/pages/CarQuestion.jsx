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
        const userEmail = getUserEmail();
        if (!userEmail) {
          // Si no hay email del registro, limpiar storage y redirigir a login
          clearSession();
          navigate("/login");
          return;
        }

        const storedUser = getUser();
        
        if (storedUser && storedUser.email && storedUser.email === userEmail) {
          if (storedUser.placa && storedUser.placa.trim() !== "") {
            const hasCarComplete = storedUser.placa?.trim() &&
                                   storedUser.marca?.trim() &&
                                   storedUser.modelo?.trim() &&
                                   storedUser.cupos > 0;
            
            if (hasCarComplete) {
              navigate("/home-driver");
              return;
            }
          }
        } else {
          clearSession();
        }

        // Si no está en storage o no coincide, verificar en el backend
        const res = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
        const user = res.data;

        if (user.email !== userEmail) {
          clearSession();
          navigate("/login");
          return;
        }

        const hasCarComplete = user.placa?.trim() &&
                              user.marca?.trim() &&
                              user.modelo?.trim() &&
                              user.cupos > 0;

        if (hasCarComplete) {
          setUser(user);
          navigate("/home-driver");
        }
      } catch (error) {
        clearSession();
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
      const userEmail = getUserEmail();
      if (!userEmail) {
        showError("Sesión no encontrada", "No se encontró la información del usuario. Por favor, inicia sesión.");
        navigate("/login");
        return;
      }

      clearSession();

      const res = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
      const user = res.data;

      if (user.email !== userEmail) {
        showError("Error de sesión", "La sesión no coincide. Por favor, inicia sesión nuevamente.");
        removeUserEmail();
        navigate("/login");
        return;
      }

      // Guardar los datos del usuario en storage
      setUser(user);

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
      clearSession();
      showError("Error de verificación", "No se pudo verificar la información del usuario. Por favor, inicia sesión.");
      navigate("/login");
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