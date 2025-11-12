import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Colors from "../assets/Colors";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";

// --- Estilos (sin cambios) ---
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
  const [answer, setAnswer] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario ya tiene carro registrado al cargar el componente
    const checkUserCar = async () => {
      try {
        // ✅ IMPORTANTE: Obtener primero el email del registro para verificar que coincida
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          // Si no hay email del registro, limpiar localStorage y redirigir a login
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        
        // ✅ IMPORTANTE: Verificar que el usuario en localStorage coincida con el email del registro
        // Esto evita usar la sesión de otra pestaña
        if (storedUser && storedUser.email && storedUser.email === userEmail) {
          // Primero verificar en localStorage solo si el email coincide
          if (storedUser.placa && storedUser.placa.trim() !== "") {
            const hasCarComplete = storedUser.placa?.trim() &&
                                   storedUser.marca?.trim() &&
                                   storedUser.modelo?.trim() &&
                                   storedUser.cupos > 0;
            
            if (hasCarComplete) {
              console.log("Usuario ya tiene carro en localStorage, redirigiendo a home-driver");
              navigate("/home-driver");
              return;
            }
          }
        } else {
          // Si el usuario en localStorage no coincide con el email del registro, limpiarlo
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }

        // Si no está en localStorage o no coincide, verificar en el backend
        const res = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
        const user = res.data;

        // ✅ IMPORTANTE: Verificar que el email del usuario obtenido coincida con el email del registro
        if (user.email !== userEmail) {
          console.error("❌ El email del usuario no coincide con el email del registro");
          localStorage.removeItem("user");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        // ✅ Validar que todos los campos del carro estén completos
        const hasCarComplete = user.placa?.trim() &&
                              user.marca?.trim() &&
                              user.modelo?.trim() &&
                              user.cupos > 0;

        if (hasCarComplete) {
          console.log("Usuario ya tiene carro en backend, redirigiendo a home-driver");
          // Actualizar localStorage solo si el email coincide
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/home-driver");
        }
      } catch (error) {
        console.error("Error al verificar carro del usuario:", error);
        // Si hay error, limpiar localStorage y dejar que el usuario continúe con el flujo normal
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    };

    checkUserCar();
  }, [navigate]);

  const handleNext = async () => {
    if (!answer) {
      alert("Selecciona una opción para continuar");
      return;
    }

    try {
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

      // Obtener los datos del usuario desde el backend
      const res = await axios.get(`${API_BASE_URL}/users/${userEmail}`);
      const user = res.data;

      // ✅ IMPORTANTE: Verificar que el email del usuario obtenido coincida con el email del registro
      if (user.email !== userEmail) {
        console.error("❌ El email del usuario no coincide con el email del registro");
        alert("Error: La sesión no coincide. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("userEmail");
        navigate("/login");
        return;
      }

      // Guardar los datos del usuario en localStorage
      localStorage.setItem("user", JSON.stringify(user));

      if (answer === "no") {
        // Si el usuario no quiere registrar un carro, ir directamente al home
        navigate("/home");
        return;
      }

      // Si el usuario quiere registrar un carro, verificar si ya tiene uno completo
      // ✅ Validamos que todos los campos del carro estén completos
      const hasCarComplete =
        user.placa?.trim() &&
        user.marca?.trim() &&
        user.modelo?.trim() &&
        user.cupos > 0;

      if (hasCarComplete) {
        navigate("/home-driver"); // ✅ Ya tiene carro con toda la info
      } else {
        navigate("/register-car"); // ✅ Le falta completar la info del carro
      }

    } catch (error) {
      console.error("❌ Error al revisar datos del carro:", error);
      // Limpiar localStorage en caso de error
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("token");
      alert("No se pudo verificar la información del usuario. Por favor, inicia sesión.");
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
