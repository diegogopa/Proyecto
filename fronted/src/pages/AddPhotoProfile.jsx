import React, { useState } from 'react';
import styled from 'styled-components';
import Colors from '../assets/Colors';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import AddPhoto from '../components/common/AddPhoto';
import UserIcon from '../assets/ProfilePhoto.png';

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
  min-width: 350px;
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

const AddPhotoProfile = () => {
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Card>
        <Title>Agrega tu foto</Title>

        <AddPhoto onPhotoSelect={setPhoto} icon={UserIcon} />

        <ButtonsRow>
          <Button text="Anterior" $primary onClick={() => navigate('/register')} />
          <Button text="Siguiente" onClick={() => navigate('/car-question')} />
        </ButtonsRow>
      </Card>
    </PageWrapper>
  );
};

export default AddPhotoProfile;
