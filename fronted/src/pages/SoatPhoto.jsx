// src/pages/SoatPhoto.jsx
import React, { useState } from "react";
import styled from "styled-components";
import Colors from "../assets/Colors";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import AddPhoto from "../components/common/AddPhoto";
import CarIcon from "../assets/AddPhoto.png";
import axios from "axios";

const API_BASE_URL = "https://proyecto5-vs2l.onrender.com/api";

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${Colors.pageBackground};
  padding: 20px;

  @media (max-width: 768px) { padding: 15px; }
  @media (max-width: 480px) { padding: 10px; }
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
    padding: 40px 30px;
    width: 100%;
    max-width: 450px;
  }

  @media (max-width: 480px) {
    padding: 30px 20px;
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
    gap: 10px;

    & > button {
      width: 100%;
    }
  }
`;

const SoatPhoto = () => {
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    try {
      setIsLoading(true);
      
      // ✅ IMPORTANTE: Obtener el email del localStorage y verificar que sea del usuario actual
      // No usar la sesión de otra pestaña
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("No se encontró la información del usuario. Por favor, inicia sesión.");
        navigate("/login");
        return;
      }

      // ✅ IMPORTANTE: Limpiar cualquier sesión previa antes de obtener los datos del usuario
      // Esto evita que se use la sesión de otra pestaña
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Obtener los datos del usuario desde el backend usando el email del registro
      const response = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
      const user = response.data;

      // ✅ Verificar que el email del usuario obtenido coincida con el email del registro
      if (user.email !== userEmail) {
        console.error("❌ El email del usuario no coincide con el email del registro");
        alert("Error: La sesión no coincide. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("userEmail");
        navigate("/login");
        return;
      }

      // Guardar los datos del usuario en localStorage como se hace en el login
      localStorage.setItem("user", JSON.stringify(user));

      // Redirigir al home
      navigate("/home");
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      // Limpiar localStorage en caso de error
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("token");
      alert("Error al cargar la información del usuario. Por favor, inicia sesión.");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Title>¡Agrega una foto de tu SOAT vigente!</Title>

        <AddPhoto onPhotoSelect={setPhoto} icon={CarIcon} />

        <ButtonsRow>
          <Button
            text="Anterior"
            $primary
            onClick={() => navigate("/car-photo")}
            disabled={isLoading}
          />
          <Button 
            text={isLoading ? "Cargando..." : "Siguiente"} 
            onClick={handleNext}
            disabled={isLoading}
          />
        </ButtonsRow>
      </Card>
    </PageWrapper>
  );
};

export default SoatPhoto;
