// src/pages/Register.jsx
import React, { useState } from "react";
import styled from "styled-components";
import Colors from "../assets/Colors";
import Button from "../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FeedbackModal from "../components/common/FeedbackModal";

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
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  min-width: 400px;
  border: 1px solid ${Colors.primary};

  @media (max-width: 768px) { padding: 40px 30px; width: 100%; max-width: 450px; }
  @media (max-width: 480px) { padding: 30px 20px; }
`;

const Title = styled.h1`
  color: ${Colors.primary};
  font-size: 26px;
  margin-bottom: 25px;

  @media (max-width: 480px) { font-size: 22px; margin-bottom: 20px; }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) { flex-direction: column; }
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1.8px solid ${Colors.primary};
  border-radius: 6px;
  font-size: 15px;
  margin-bottom: 15px;
  outline: none;

  &::placeholder { color: #999; }

  @media (max-width: 480px) { width: 100%; font-size: 14px; padding: 10px; }
`;

const Text = styled.p`
  margin-top: 15px;
  font-size: 14px;
  color: ${Colors.primary};
  text-align: center;

  @media (max-width: 480px) { font-size: 13px; }
`;

const StyledLink = styled(Link)`
  color: blue;
  text-decoration: none;
  font-weight: 500;
  &:hover { text-decoration: underline; }
`;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', idUniversidad: '', email: '', telefono: '', password: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalDetails, setModalDetails] = useState('');
  const [modalType, setModalType] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
      setModalMessage('Campos incompletos');
      setModalDetails('Por favor completa todos los campos obligatorios.');
      setModalType('no');
      setShowModal(true);
      return;
    }

    try {
      const newUser = {
        ...formData,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        idUniversidad: formData.idUniversidad.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        password: formData.password.trim(),
        placa: "",
        cupos: 0,
        marca: "",
        modelo: "",
        trips: [] // ✅ añadido
      };

      const response = await axios.post(
        "https://proyecto5-vs2l.onrender.com/api/users/register",
        newUser,
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );

      // ✅ IMPORTANTE: Limpiar cualquier sesión previa antes de guardar el nuevo usuario
      // Esto evita que se comparta la sesión entre pestañas
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
      setModalMessage('Registro exitoso');
      setModalDetails(response.data.message || 'Tu cuenta fue creada correctamente.');
      setModalType('yes');
      localStorage.setItem("userEmail", formData.email.trim());
      setShowModal(true);

    } catch (error) {
      console.error("Error en el registro:", error);
      let errorMessage = 'Intenta nuevamente más tarde.';
      if (error.response) errorMessage = error.response.data?.message || 'Error en el servidor.';
      else if (error.request) errorMessage = 'No se pudo conectar con el servidor.';
      else errorMessage = 'Error al enviar los datos.';

      setModalMessage('Error al registrarse');
      setModalDetails(errorMessage);
      setModalType('no');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalType === 'yes') navigate('/car-question');
  };

  return (
    <PageWrapper>
      <Card>
        <Title>Registro</Title>
        <Form onSubmit={handleRegister}>
          <Row>
            <Input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} />
            <Input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} />
          </Row>
          <Input name="idUniversidad" placeholder="ID de la Universidad" value={formData.idUniversidad} onChange={handleChange} />
          <Input name="email" type="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} />
          <Input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} />
          <Input name="password" type="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} />
          <Button text="Registrarse" $primary type="submit" style={{ width: '100%' }} />
        </Form>

        <Text>¿Ya tienes una cuenta?</Text>
        <StyledLink to="/login">Inicia Sesión</StyledLink>
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

export default Register;
