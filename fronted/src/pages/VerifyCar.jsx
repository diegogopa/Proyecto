import React, { useState } from "react";
import styled from "styled-components";
import Colors from "../assets/Colors";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";

// --- Estilos idénticos a CarQuestion ---
const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${Colors.pageBackground};
`;

const Card = styled.div`
  background-color: ${Colors.white};
  padding: 50px 30px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

const VerifyCar = () => {
  const [answer, setAnswer] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!answer) {
      alert("Por favor selecciona una opción antes de continuar.");
      return;
    }

    if (answer === "si") {
      navigate("/home-driver"); // ✅ Si dice sí, va a HomeDriver
    } else {
      navigate("/register-car"); // ✅ Si dice no, va a RegisterCar
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Title>¿Ya tienes un carro registrado?</Title>

        <Options>
          <OptionLabel>
            <input
              type="radio"
              name="verificarCarro"
              value="no"
              checked={answer === "no"}
              onChange={(e) => setAnswer(e.target.value)}
            />
            No
          </OptionLabel>

          <OptionLabel>
            <input
              type="radio"
              name="verificarCarro"
              value="si"
              checked={answer === "si"}
              onChange={(e) => setAnswer(e.target.value)}
            />
            Sí
          </OptionLabel>
        </Options>

        <Button text="Continuar" $primary onClick={handleNext} />
      </Card>
    </PageWrapper>
  );
};

export default VerifyCar;
