// src/pages/EditProfile.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import colors from "../assets/Colors";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMessage } from '../contexts/MessageContext';

const EditContainer = styled.div`
  padding: 40px;
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 768px) { padding: 20px; }
  @media (max-width: 480px) { padding: 10px; }
`;

const FormCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px 40px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  width: 400px;
  max-width: 90%;
  @media (max-width: 768px) { padding: 25px 30px; width: 100%; }
  @media (max-width: 480px) { padding: 20px 20px; }
`;

const Title = styled.h2`
  color: ${colors.primary};
  text-align: center;
  margin-bottom: 20px;
  @media (max-width: 480px) { font-size: 20px; margin-bottom: 15px; }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: ${colors.text};
  @media (max-width: 480px) { font-size: 14px; }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  @media (max-width: 480px) { padding: 8px; }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  @media (max-width: 480px) { flex-direction: column; gap: 10px; }
`;

const SaveButton = styled.button`
  flex: 1;
  background-color: ${colors.primary};
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background-color: #4a5d72; }
  @media (max-width: 480px) { padding: 8px; }
`;

const CancelButton = styled.button`
  flex: 1;
  background-color: ${colors.details};
  color: black;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background-color: #435d75ff; }
  @media (max-width: 480px) { padding: 8px; }
`;

function EditProfile() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useMessage();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setForm({
        nombre: storedUser.nombre,
        apellido: storedUser.apellido,
        email: storedUser.email,
        password: "", // nunca cargamos la contraseña
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const backendURL = "https://proyecto5-vs2l.onrender.com/api";

      // Preparar payload con los campos modificables
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
      };
      if (form.password.trim() !== "") {
        payload.password = form.password;
      }

      const response = await axios.put(
        `${backendURL}/users/${form.email.trim()}`,
        payload
      );

      // Guardamos el usuario actualizado en localStorage (sin password)
      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Mostrar mensaje de éxito y redirigir al Home
      showSuccess("Perfil actualizado", "Tus datos han sido actualizados correctamente.");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (error) {
      showError("Error al actualizar", error.response?.data?.message || "Hubo un problema al guardar los cambios. Por favor, intenta nuevamente.");
    }
  };

  return (
    <EditContainer>
      <FormCard>
        <Title>Editar Perfil</Title>

        <Label>Nombre</Label>
        <Input type="text" name="nombre" value={form.nombre} onChange={handleChange} />

        <Label>Apellido</Label>
        <Input type="text" name="apellido" value={form.apellido} onChange={handleChange} />

        <Label>Correo</Label>
        <Input type="email" name="email" value={form.email} readOnly />

        <Label>Contraseña</Label>
        <Input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Dejar vacío si no cambia"
        />

        <ButtonGroup>
          <CancelButton onClick={() => navigate("/profile")}>Cancelar</CancelButton>
          <SaveButton onClick={handleSave}>Guardar cambios</SaveButton>
        </ButtonGroup>
      </FormCard>
    </EditContainer>
  );
}

export default EditProfile;