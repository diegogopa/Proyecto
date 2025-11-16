//src/pages/CarPhoto.jsx
//Página para agregar una foto de carro
//Incluye: formulario para agregar una foto de carro, botón para guardar la foto y botón para volver a la página anterior

import React, { useState } from "react";
import styled from "styled-components";
import Colors from "../assets/Colors";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import AddPhoto from '../components/common/AddPhoto';
import CarIcon from '../assets/AddPhoto.png';
import axios from "axios";
import { useMessage } from '../contexts/MessageContext';
import API_BASE_URL from "../config/api";
import { getUserEmail, setUser } from '../utils/storage';

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${Colors.pageBackground};
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Card = styled.div`
  background-color: ${Colors.white};
  padding: 50px 60px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 380px;
  border: 1px solid ${Colors.primary};

  @media (max-width: 768px) {
    padding: 30px 20px;
    width: 100%;
    min-width: unset;
  }

  @media (max-width: 480px) {
    padding: 20px 15px;
  }
`;

const Title = styled.h1`
  color: ${Colors.primary};
  font-size: 24px;
  margin-bottom: 25px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 20px;
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;

    button {
      width: 100%;
    }
  }
`;

const CarPhoto = () => {
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showError, showSuccess } = useMessage();

  const handlePhotoSelect = (file) => {
    if (file) {
      setPhotoFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
    }
  };

  const handleNext = async () => {
    try {
      setIsLoading(true);

      const userEmail = getUserEmail();
      if (!userEmail) {
        showError("Sesión no encontrada", "No se encontró la información del usuario. Por favor, inicia sesión.");
        navigate("/login");
        return;
      }

      // Si hay una foto seleccionada, convertirla a base64 y guardarla
      if (photoFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Image = reader.result; // Esto será una URL base64 (data:image/...)
            
            // Actualizar el usuario con la foto del carro
            await axios.put(
              `${API_BASE_URL}/users/${userEmail}`,
              { carPhoto: base64Image },
              { headers: { "Content-Type": "application/json" } }
            );

            // Actualizar el usuario en storage
            const response = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
            const user = response.data;
            setUser(user);

            navigate("/soat-photo");
          } catch (error) {
            console.error("Error al guardar la foto:", error);
            showError("Error al guardar", "No se pudo guardar la foto del carro. Por favor, intenta nuevamente.");
          } finally {
            setIsLoading(false);
          }
        };
        reader.onerror = () => {
          showError("Error", "Error al leer la imagen. Por favor, intenta nuevamente.");
          setIsLoading(false);
        };
        reader.readAsDataURL(photoFile);
      } else {
        // Si no hay foto, simplemente navegar a la siguiente página
        navigate("/soat-photo");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Error", "Ocurrió un error. Por favor, intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Title>¡Agrega una foto de tu carro!</Title>

        <AddPhoto onPhotoSelect={handlePhotoSelect} icon={CarIcon} />

        <ButtonsRow>
          <Button 
            text="Anterior" 
            $primary 
            onClick={() => navigate("/register-car")} 
            disabled={isLoading}
          />
          <Button 
            text={isLoading ? "Guardando..." : "Siguiente"} 
            onClick={handleNext}
            disabled={isLoading}
          />
        </ButtonsRow>
      </Card>
    </PageWrapper>
  );
};

export default CarPhoto;