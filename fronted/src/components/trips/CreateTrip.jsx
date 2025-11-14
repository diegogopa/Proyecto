//Crear viaje conductor (tramo)
import React, { useState } from 'react';
import styled from 'styled-components';
import colors from '../../assets/Colors.jsx';
import MapComponent from '../common/MapComponent.jsx'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faMapMarkerAlt, faRoute, faCarSide, faUserFriends, faGlobe} from '@fortawesome/free-solid-svg-icons';
import { useMessage } from '../../contexts/MessageContext'; 

//Estilo para hacer dos contenedores (mapa y formulario)
const MainContent = styled.div` 
    display: flex;
    gap: 20px; /* Espacio entre el mapa y el formulario */
    max-width: 1000px; /* Limita el ancho para una mejor visualización */
    margin: 0 auto;
    /* Permite que el contenido se apile en pantallas muy pequeñas */
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const MapWrapper = styled.div`
    flex: 1; /* Ocupa el mismo espacio que el formulario */
    min-width: 300px; 
    height: 400px; /* Altura fija para el mapa */
`;

const FormWrapper = styled.div`
    flex: 1; /* Ocupa el mismo espacio que el mapa */
    display: flex;
    flex-direction: column;
    gap: 15px; /* Espacio entre los grupos de formulario */
`;

const FormContainer = styled.div`
    width: 100%;
    max-width: 500px;
    padding: 20px;
    background-color: ${colors.white}; 
    border-radius: 12px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
    color: ${colors.text};
    margin-bottom: 20px;
    font-size: 1.5rem;
    text-align: center;
`;

const FormGroup = styled.div`
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    margin-bottom: 5px;
    font-weight: 600;
    color: ${colors.text};
    display: flex;
    align-items: center;
    gap: 8px;
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
    margin-top: 10px;
    &:hover {
        background-color: ${colors.details};
    }
`;

const BackButton = styled(SubmitButton)`
    background-color: #95a5a6; /* Gris */
    margin-top: 5px;
    &:hover {
        background-color: #7f8c8d;
    }
`;

// Recibe la función de manejo de envío final y una función para cerrar el modal
function CreateTrip({ onTripSubmit, onClose }) {
    const { showError } = useMessage();
    
    const [formData, setFormData] = useState({
        fromLocation: '',
        toLocation: '',
        departureTime: '',
        price: '',
        sector: '', 
        cupos: '',
    });

    const [currentSelection, setCurrentSelection] = useState('from'); 

    // Actualiza cualquier campo del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Maneja la dirección seleccionada por el MapComponent
    const handleAddressSelected = (address) => {
        setFormData(prevData => {
            if (currentSelection === 'from') {
                return { ...prevData, fromLocation: address };
            } else {
                return { ...prevData, toLocation: address };
            }
        });
    };

    // 2. Maneja el envío final del tramo
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Aquí desestructuramos formData, lo cual ahora es posible
        const { fromLocation, toLocation, departureTime, price, sector, cupos } = formData;

        if (!fromLocation || !toLocation || !departureTime || !price || !sector || !cupos) {
            showError("Campos incompletos", "Por favor, selecciona Origen, Destino y completa todos los campos.");
            return;
        }

        const tripData = {
            departureTime,
            fromLocation,
            toLocation,
            price: Number(price),
            sector,
            cupos: Number(cupos)
        };
        
        onTripSubmit(tripData); 
    };

return (
    <>
        <FormTitle>Crear nuevo tramo </FormTitle>

        <MainContent>
            
            <MapWrapper>
                <MapComponent 
                    onAddressSelect={handleAddressSelected}
                    origin={formData.fromLocation || null}
                    destination={formData.toLocation || null}
                    currentSelection={currentSelection}
                />
            </MapWrapper>

            <FormWrapper>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <SubmitButton 
                        type="button" 
                        onClick={() => setCurrentSelection('from')}
                        style={{ 
                            backgroundColor: currentSelection === 'from' ? colors.primary : '#95a5a6', 
                            padding: '10px 15px',
                            flex: 1
                        }}
                    >
                        Seleccionar Origen
                    </SubmitButton>
                    
                    <SubmitButton 
                        type="button" 
                        onClick={() => setCurrentSelection('to')}
                        style={{ 
                            backgroundColor: currentSelection === 'to' ? colors.primary : '#95a5a6',
                            padding: '10px 15px',
                            flex: 1
                        }}
                    >
                        Seleccionar Destino
                    </SubmitButton>
                </div>
                
                <form id="trip-form" onSubmit={handleSubmit} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <FormGroup>
                        <Label><FontAwesomeIcon icon={faMapMarkerAlt} /> Origen ({currentSelection === 'from' ? 'ACTIVO' : ''})</Label>
                        <Input 
                            type="text" 
                            name="fromLocation"
                            value={formData.fromLocation} 
                            onChange={handleChange}
                            placeholder="Dirección de Origen"
                            readOnly 
                            required 
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label><FontAwesomeIcon icon={faMapMarkerAlt} /> Destino ({currentSelection === 'to' ? 'ACTIVO' : ''})</Label>
                        <Input 
                            type="text" 
                            name="toLocation" 
                            value={formData.toLocation} 
                            onChange={handleChange}
                            placeholder="Dirección de Destino"
                            readOnly 
                            required 
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label><FontAwesomeIcon icon={faGlobe} /> Sector (Ej: Colina, Samaria Chía)</Label>
                        <Input 
                            type="text" 
                            name="sector"
                            value={formData.sector} 
                            onChange={handleChange}
                            placeholder="Ej: Samaria Chía, Colina"
                            required 
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label><FontAwesomeIcon icon={faCarSide} /> Hora de salida</Label>
                        <Input 
                            type="time" 
                            name="departureTime"
                            value={formData.departureTime} 
                            onChange={handleChange}
                            required 
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label><FontAwesomeIcon icon={faUserFriends} /> Cupos disponibles</Label>
                        <Input 
                            type="number" 
                            name="cupos"
                            value={formData.cupos} 
                            onChange={handleChange}
                            placeholder="Máx. 10"
                            min="1"
                            max="10"
                            required 
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label><FontAwesomeIcon icon={faRoute} /> Precio del tramo</Label>
                        <Input 
                            type="number" 
                            name="price"
                            value={formData.price} 
                            onChange={handleChange}
                            placeholder="Ej: 5000"
                            required 
                        />
                    </FormGroup>
                </form>
                

                <SubmitButton 
                    type="submit"
                    form="trip-form"
                    style={{ marginTop: '5px', width: '100%' }}
                >
                    Crear tramo
                </SubmitButton>

                <BackButton type="button" onClick={onClose} style={{ marginTop: '5px' , width: '100%' }}>
                    Cerrar
                </BackButton>

            </FormWrapper>

        </MainContent>
    </>
);
}

export default CreateTrip;