//Reservar viaje pasajero usando API
import React, { useState } from 'react';
import styled from 'styled-components';
import colors from '../../assets/Colors.jsx';
import MapComponent from '../common/MapComponent.jsx'; // Asegúrate que la ruta sea correcta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'; // Icono de check
import { useDispatch } from 'react-redux'; // 👈 Importar hook de Redux
import { createReservation } from "../../components/trips/ReservationSlice.jsx";

// --- Estilos para la Reserva ---

const ReserveContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 40px;
    background-color: #f0f4f7; /* Fondo del ContentWrapper */
`;

// Estilo del Contenedor de Formulario/Mapa (el bloque oscuro)
const FormCard = styled.div`
    background-color: #2c3e50; /* Color azul oscuro/gris de tu diseño */
    color: ${colors.white};
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    width: 450px;
    
    @media (max-width: 768px) {
        width: 100%;
    }
`;

const Title = styled.h2`
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.8rem;
`;

const Subtitle = styled.p`
    font-size: 0.9rem;
    color: #bdc3c7;
    margin-bottom: 15px;
`;

const MapPlaceholder = styled.div`
    width: 100%;
    height: 300px;
    background-color: #ecf0f1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${colors.text};
    font-weight: 600;
    margin-bottom: 15px;
`;

const TextInput = styled.input`
    width: calc(100% - 30px);
    padding: 15px;
    margin-bottom: 20px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
`;

const ReserveButton = styled.button`
    background-color: ${colors.primary};
    color: ${colors.white};
    border: none;
    cursor: pointer;
    padding: 12px 25px;
    border-radius: 8px;
    font-weight: 600;
    width: 100%;
    transition: background-color 0.3s;

    &:hover {
        background-color: #4a5d72;
    }
`;

// --- Estilos de Confirmación ---

const ConfirmationCard = styled(FormCard)`
    background-color: #2c3e50;
    text-align: center;
    padding: 50px 30px;
`;

const CheckIcon = styled(FontAwesomeIcon)`
    color: #2ecc71; /* Verde de éxito */
    font-size: 4rem;
    margin-bottom: 20px;
`;

const ConfirmationTitle = styled.h3`
    font-size: 1.8rem;
    color: ${colors.white};
    margin: 10px 0;
`;

const ConfirmationText = styled.p`
    font-size: 1rem;
    color: #bdc3c7;
    margin-bottom: 30px;
`;

const ListoButton = styled(ReserveButton)`
    background-color: ${colors.white};
    color: #2c3e50;
    padding: 10px 20px;
    width: auto;
`;

// --- Componente Principal ---

// Recibe el trip y la función para volver al Home
function ReserveTrip({ trip, onFinishReservation }) {
    const dispatch = useDispatch(); // 👈 Inicializar el dispatch de Redux
    const [step, setStep] = useState('map'); // 'map' o 'confirmation'
    const [pickupAddress, setPickupAddress] = useState('');

    const handleReserveClick = async () => {
        // Validación básica
        if (!pickupAddress || pickupAddress.trim() === '') {
            alert("Por favor, selecciona o escribe una dirección de recogida.");
            return;
        }

        // Obtener el tripId (puede ser trip.tripId o trip.id)
        const tripId = trip.tripId || trip.id;
        if (!tripId) {
            alert("Error: No se encontró el ID del viaje.");
            return;
        }

        try {
            // Llamar al endpoint para restar 1 cupo
            const response = await fetch(`https://proyecto5-vs2l.onrender.com/api/trips/${tripId}/reserve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Error al reservar el cupo. Por favor, intenta nuevamente.');
                return;
            }

            // Si todo salió bien, mostrar confirmación
            console.log(`Reservando viaje #${trip.id} con recogida en: ${pickupAddress}`);
            setStep('confirmation');
        } catch (error) {
            console.error("Error al reservar:", error);
            alert("Error al realizar la reserva. Por favor, intenta nuevamente.");
        }
    };

    // ✅ Función para actualizar el estado de la dirección cuando el mapa la selecciona
    const handleAddressSelected = (address) => {
        setPickupAddress(address);
    };

    if (!trip) {
        return <ReserveContainer><p>No se encontró el viaje.</p></ReserveContainer>;
    }

    // 1. Vista de Mapa y Formulario
    if (step === 'map') {
        return (
            <ReserveContainer>
                <FormCard>
                    <Title>Reserva tu viaje</Title>
                    <Subtitle>Selecciona el punto de recogida</Subtitle>
                    
                    {/* ✅ Le pasamos la nueva función al MapComponent */}
                    <MapComponent 
                        onAddressSelect={handleAddressSelected}
                    />

                    {/* ✅ Enlazamos el TextInput al estado 'pickupAddress' */}
                    <TextInput
                        type="text"
                        placeholder="La dirección seleccionada es..."
                        value={pickupAddress} // ✅ Mostrar el valor del estado
                        onChange={(e) => setPickupAddress(e.target.value)} // ✅ Permitir edición
                    />

                    <ReserveButton onClick={handleReserveClick}>
                        Reservar
                    </ReserveButton>
                </FormCard>
            </ReserveContainer>
        );
    }

    // 2. Vista de Confirmación
    if (step === 'confirmation') {
        return (
            <ReserveContainer>
                <ConfirmationCard>
                    <CheckIcon icon={faCheckCircle} />
                    <ConfirmationTitle>Reserva realizada con éxito</ConfirmationTitle>
                    <ConfirmationText>Tu reserva ha sido confirmada. ¡Disfruta del viaje!</ConfirmationText>
                    <ListoButton onClick={onFinishReservation}>
                        ¡Listo!
                    </ListoButton>
                </ConfirmationCard>
            </ReserveContainer>
        );
    }
}

export default ReserveTrip;