//Reservar viaje pasajero usando API
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../../assets/Colors.jsx';
import MapComponent from '../common/MapComponent.jsx'; // Asegúrate que la ruta sea correcta
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCheckCircle, faUser, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'; // Icono de check
import { useDispatch } from 'react-redux'; // 👈 Importar hook de Redux
import { createReservation } from "../../components/trips/ReservationSlice.jsx";
import { useMessage } from '../../contexts/MessageContext';

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

const SelectInput = styled.select`
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    background-color: ${colors.white};
    color: ${colors.text};
    cursor: pointer;
`;

const SeatSection = styled.div`
    margin-bottom: 25px;
    padding: 15px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
`;

const SeatTitle = styled.h3`
    font-size: 1.1rem;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ScrollableContainer = styled.div`
    max-height: 500px;
    overflow-y: auto;
    padding-right: 10px;
    
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        
        &:hover {
            background: rgba(255, 255, 255, 0.5);
        }
    }
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

const CancelButton = styled.button`
    background-color: #95a5a6;
    color: ${colors.white};
    border: none;
    cursor: pointer;
    padding: 12px 25px;
    border-radius: 8px;
    font-weight: 600;
    width: 100%;
    margin-top: 10px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #7f8c8d;
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
    const { showError } = useMessage();
    const [step, setStep] = useState('seats'); // 'seats', 'pickup' o 'confirmation'
    const [numberOfSeats, setNumberOfSeats] = useState(1);
    const [pickupAddresses, setPickupAddresses] = useState(['']); // Array de direcciones, una por cada cupo
    const [currentSeatIndex, setCurrentSeatIndex] = useState(0); // Índice del cupo actual que se está configurando

    // Verificar cupos al cargar el componente
    const cuposNum = typeof trip.cupos === 'string' ? parseInt(trip.cupos) : trip.cupos;
    const maxSeats = Math.min(cuposNum, 10); // Máximo 10 cupos o los disponibles

    // Actualizar el array de direcciones cuando cambia el número de cupos
    useEffect(() => {
        setPickupAddresses(prev => {
            if (numberOfSeats > prev.length) {
                // Agregar direcciones vacías para los nuevos cupos
                const newAddresses = [...prev];
                while (newAddresses.length < numberOfSeats) {
                    newAddresses.push('');
                }
                return newAddresses;
            } else if (numberOfSeats < prev.length) {
                // Reducir el array si se disminuye el número de cupos
                return prev.slice(0, numberOfSeats);
            }
            return prev;
        });
    }, [numberOfSeats]);

    const handleSeatsSelected = () => {
        if (numberOfSeats < 1 || numberOfSeats > maxSeats) {
            showError("Cantidad inválida", `Por favor, selecciona entre 1 y ${maxSeats} cupos.`);
            return;
        }
        setStep('pickup');
        setCurrentSeatIndex(0);
    };

    // ✅ Función para actualizar el estado de la dirección cuando el mapa la selecciona
    const handleAddressSelected = (address) => {
        const newAddresses = [...pickupAddresses];
        newAddresses[currentSeatIndex] = address;
        setPickupAddresses(newAddresses);
    };

    const handleNextSeat = () => {
        if (currentSeatIndex < numberOfSeats - 1) {
            setCurrentSeatIndex(currentSeatIndex + 1);
        } else {
            // Todos los cupos configurados, proceder a reservar
            handleReserveClick();
        }
    };

    const handlePreviousSeat = () => {
        if (currentSeatIndex > 0) {
            setCurrentSeatIndex(currentSeatIndex - 1);
        }
    };

    const handleReserveClick = async () => {
        // Validar que todas las direcciones estén completas
        const incompleteAddresses = pickupAddresses.some(addr => !addr || addr.trim() === '');
        if (incompleteAddresses) {
            showError("Direcciones incompletas", "Por favor, completa todas las direcciones de recogida para cada cupo.");
            return;
        }

        // Obtener el tripId (puede ser trip.tripId o trip.id)
        const tripId = trip.tripId || trip.id;
        if (!tripId) {
            showError("Error", "No se encontró el ID del viaje. Por favor, intenta nuevamente.");
            return;
        }

        try {
            // Obtener el usuario pasajero para guardar la reserva
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (!storedUser || !storedUser._id) {
                showError("Sesión no encontrada", "No se encontró la sesión del usuario. Inicia sesión nuevamente.");
                return;
            }

            // Llamar al endpoint para reservar múltiples cupos
            const response = await fetch(`https://proyecto5-vs2l.onrender.com/api/trips/${tripId}/reserve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: storedUser._id,
                    numberOfSeats: numberOfSeats,
                    pickupAddresses: pickupAddresses.map(addr => addr.trim()),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Mensaje personalizado si está lleno
                if (errorData.message && errorData.message.includes('cupos')) {
                    showError("Cupos no disponibles", errorData.message);
                } else {
                    showError("Error al reservar", errorData.message || 'Error al reservar los cupos. Por favor, intenta nuevamente.');
                }
                return;
            }

            // Si todo salió bien, mostrar confirmación
            setStep('confirmation');
        } catch (error) {
            // El error ya se maneja arriba con el modal
            // No necesitamos hacer nada adicional aquí
        }
    };

    if (!trip) {
        return <ReserveContainer><p>No se encontró el viaje.</p></ReserveContainer>;
    }

    const isFull = cuposNum === 0;

    // 0. Vista de Selección de Cupos
    if (step === 'seats') {
        // Si está lleno, mostrar mensaje
        if (isFull) {
            return (
                <ReserveContainer>
                    <FormCard>
                        <Title>⚠️ Tramo Lleno</Title>
                        <Subtitle style={{ color: '#e74c3c', fontSize: '1.1rem', marginBottom: '20px' }}>
                            Este tramo no tiene cupos disponibles
                        </Subtitle>
                        <p style={{ color: colors.white, marginBottom: '30px' }}>
                            Lo sentimos, este viaje ya está completo. Por favor, busca otro tramo disponible.
                        </p>
                        <ReserveButton 
                            onClick={onFinishReservation}
                            style={{ backgroundColor: colors.white, color: '#2c3e50' }}
                        >
                            Volver
                        </ReserveButton>
                    </FormCard>
                </ReserveContainer>
            );
        }

        return (
            <ReserveContainer>
                <FormCard>
                    <Title>Reserva tu viaje</Title>
                    <Subtitle>¿Cuántos cupos deseas reservar?</Subtitle>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '1rem' }}>
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                            Cupos disponibles: {cuposNum}
                        </label>
                        <SelectInput
                            value={numberOfSeats}
                            onChange={(e) => setNumberOfSeats(parseInt(e.target.value))}
                        >
                            {Array.from({ length: maxSeats }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>
                                    {num} cupo{num > 1 ? 's' : ''}
                                </option>
                            ))}
                        </SelectInput>
                    </div>

                    <ReserveButton onClick={handleSeatsSelected}>
                        Continuar
                    </ReserveButton>
                    
                    <CancelButton onClick={onFinishReservation}>
                        Cancelar
                    </CancelButton>
                </FormCard>
            </ReserveContainer>
        );
    }

    // 1. Vista de Selección de Puntos de Recogida
    if (step === 'pickup') {
        return (
            <ReserveContainer>
                <FormCard style={{ width: '600px', maxWidth: '90vw' }}>
                    <Title>Punto de recogida</Title>
                    <Subtitle>
                        Cupo {currentSeatIndex + 1} de {numberOfSeats}
                    </Subtitle>
                    
                    <ScrollableContainer>
                        <SeatSection>
                            <SeatTitle>
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                Dirección de recogida para el cupo {currentSeatIndex + 1}
                            </SeatTitle>
                            
                            {/* ✅ Le pasamos la nueva función al MapComponent */}
                            <div style={{ marginBottom: '15px' }}>
                                <MapComponent 
                                    onAddressSelect={handleAddressSelected}
                                />
                            </div>

                            {/* ✅ Enlazamos el TextInput al estado de la dirección actual */}
                            <TextInput
                                type="text"
                                placeholder="Selecciona o escribe la dirección de recogida..."
                                value={pickupAddresses[currentSeatIndex] || ''}
                                onChange={(e) => {
                                    const newAddresses = [...pickupAddresses];
                                    newAddresses[currentSeatIndex] = e.target.value;
                                    setPickupAddresses(newAddresses);
                                }}
                            />
                        </SeatSection>
                    </ScrollableContainer>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        {currentSeatIndex > 0 && (
                            <CancelButton 
                                onClick={handlePreviousSeat}
                                style={{ flex: 1, marginTop: 0 }}
                            >
                                Anterior
                            </CancelButton>
                        )}
                        <ReserveButton 
                            onClick={handleNextSeat}
                            style={{ flex: currentSeatIndex === 0 ? 1 : 1 }}
                        >
                            {currentSeatIndex < numberOfSeats - 1 ? 'Siguiente' : 'Reservar'}
                        </ReserveButton>
                    </div>
                    
                    <CancelButton onClick={() => setStep('seats')} style={{ marginTop: '10px' }}>
                        Volver
                    </CancelButton>
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
                    <ConfirmationText>
                        Has reservado {numberOfSeats} cupo{numberOfSeats > 1 ? 's' : ''} exitosamente. 
                        ¡Disfruta del viaje!
                    </ConfirmationText>
                    <ListoButton onClick={onFinishReservation}>
                        ¡Listo!
                    </ListoButton>
                </ConfirmationCard>
            </ReserveContainer>
        );
    }
}

export default ReserveTrip;