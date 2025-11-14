// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import colors from "../assets/Colors";
import profilePhoto from "../assets/ProfilePhoto.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileContainer = styled.div`
  padding: 40px;
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 25px;
  }

  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px 40px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  width: 400px;
  max-width: 90%;
  text-align: center;

  @media (max-width: 768px) {
    padding: 25px 30px;
    width: 100%;
  }

  @media (max-width: 480px) {
    padding: 20px 20px;
  }
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 20px;
  border: 3px solid ${colors.primary};

  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
    margin-bottom: 15px;
  }
`;

const Name = styled.h2`
  color: ${colors.primary};
  margin-bottom: 10px;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const Email = styled.p`
  color: ${colors.text};
  font-size: 15px;
  margin: 5px 0;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const BackButton = styled.button`
  margin-top: 25px;
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 25px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: #4a5d72;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 10px;
  }
`;

const LogoutButton = styled(BackButton)`
  background-color: #d9534f;

  &:hover {
    background-color: #c9302c;
  }

  margin-top: 10px;
`;

function Profile() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

    const fetchUserData = async () => {
      try {
        const email = storedUser?.email;
        if (!email) return;
        const res = await axios.get(`https://proyecto-y2t3.vercel.app/api/users/${email}`);
        if (res.data) setUser(res.data);
      } catch (err) {
        // Error silencioso - no es crítico mostrar este error al usuario
      }
    };

    fetchUserData();
  }, []);

  return (
    <ProfileContainer>
      <Card>
        <ProfileImage src={profilePhoto} alt="Foto de perfil" />
        <Name>{user?.nombre ? `${user.nombre} ${user.apellido}` : "Usuario"}</Name>
        <Email><strong>Correo:</strong> {user?.email || "Sin correo"}</Email>
        <Email><strong>Rol:</strong> {user?.role || "Pasajero"}</Email>

        <BackButton onClick={() => navigate("/home")}>← Volver</BackButton>
        <LogoutButton
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          Cerrar sesión
        </LogoutButton>
      </Card>
    </ProfileContainer>
  );
}

export default Profile;
