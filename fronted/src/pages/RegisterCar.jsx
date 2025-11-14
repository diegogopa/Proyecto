import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Colors from "../assets/Colors";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FeedbackModal from "../components/common/FeedbackModal";
import API_BASE_URL from "../config/api";
import { useMessage } from '../contexts/MessageContext';

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
  padding: 40px 60px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  min-width: 380px;
  border: 1px solid ${Colors.primary};
  @media (max-width: 768px) { padding: 35px 30px; width: 100%; max-width: 450px; }
  @media (max-width: 480px) { padding: 25px 20px; }
`;

const Title = styled.h2`
  color: ${Colors.primary};
  font-size: 24px;
  margin-bottom: 25px;
  text-align: center;
  @media (max-width: 480px) { font-size: 20px; margin-bottom: 20px; }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1.8px solid ${Colors.primary};
  border-radius: 6px;
  font-size: 15px;
  margin-bottom: 15px;
  outline: none;
  &::placeholder { color: #999; }
  @media (max-width: 480px) { font-size: 14px; padding: 10px; }
`;

const RegisterCar = () => {
  const [placa, setPlaca] = useState("");
  const [cupos, setCupos] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalDetails, setModalDetails] = useState("");
  const [modalType, setModalType] = useState("");
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");

  // ✅ NUEVO: Cargar datos del usuario si ya tiene carro registrado
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) return navigate("/login");

    setUserEmail(storedEmail);

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${storedEmail}`);
        const user = res.data;

        if (user.placa) setPlaca(user.placa);
        if (user.cupos) setCupos(user.cupos);
        if (user.marca) setMarca(user.marca);
        if (user.modelo) setModelo(user.modelo);
      } catch (err) {
        // Error silencioso - los datos se cargarán desde el formulario
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!placa || !cupos || !marca || !modelo) {
      setModalType("no");
      setModalMessage("Campos incompletos");
      setModalDetails("Por favor llena todos los campos antes de continuar.");
      setShowModal(true);
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${userEmail}`,
        {
          placa: placa.trim(),
          cupos: Number(cupos),
          marca: marca.trim(),
          modelo: modelo.trim(),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setModalType("yes");
      setModalMessage("Carro registrado");
      setModalDetails(response.data.message || "Tu carro se guardó correctamente.");
      setShowModal(true);
    } catch (error) {
      setModalType("no");
      setModalMessage("Error al registrar carro");
      setModalDetails(error.response?.data?.message || "Intenta nuevamente más tarde.");
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalType === "yes") navigate("/car-photo");
  };

  return (
    <PageWrapper>
      <Card>
        <Title>¡Registra tu carro!</Title>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}
        >
          <Input type="text" placeholder="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} />
          <Input type="number" placeholder="Cupos" value={cupos} onChange={(e) => setCupos(e.target.value)} />
          <Input type="text" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
          <Input type="text" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} />
          <Button text="Siguiente" $primary type="submit" style={{ width: "100%" }} />
        </form>
      </Card>

      {showModal && (
        <FeedbackModal
          type={modalType}
          message={modalMessage}
          details={modalDetails}
          onClose={handleCloseModal}
        />
      )}
    </PageWrapper>
  );
};

export default RegisterCar;
