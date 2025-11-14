// src/pages/CreateTrip.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import colors from '../assets/Colors.jsx'; // Ajusta la ruta si es necesario
import { useMessage } from '../contexts/MessageContext';

const Container = styled.div`
  max-width: 500px;
  margin: 40px auto;
  padding: 30px;
  background-color: ${colors.white};
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: ${colors.text};
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: 500;
  color: ${colors.text};
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const SubmitButton = styled.button`
  background-color: ${colors.primary};
  color: ${colors.white};
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${colors.details};
  }
`;

function CreateTrip() {
  const { showSuccess } = useMessage();
  const [departureTime, setDepartureTime] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí puedes hacer la lógica para enviar los datos a tu backend
    const tripData = {
      departureTime,
      fromLocation,
      toLocation,
      price,
    };

    showSuccess('Tramo creado', 'El tramo ha sido creado correctamente.');
    
    // Limpiar formulario
    setDepartureTime('');
    setFromLocation('');
    setToLocation('');
    setPrice('');
  };

  return (
    <Container>
      <Title>Crear nuevo tramo 🚗</Title>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Hora de salida</Label>
          <Input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Desde</Label>
          <Input
            type="text"
            placeholder="Lugar de salida"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Hasta</Label>
          <Input
            type="text"
            placeholder="Destino"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Precio</Label>
          <Input
            type="number"
            placeholder="Precio por pasajero"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </FormGroup>

        <SubmitButton type="submit">Crear Tramo</SubmitButton>
      </form>
    </Container>
  );
}

export default CreateTrip;
