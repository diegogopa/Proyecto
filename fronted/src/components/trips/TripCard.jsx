// src/components/common/TripCard.jsx
import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faPlus } from '@fortawesome/free-solid-svg-icons';
import colors from '../../assets/Colors';

// Estilos de la tarjeta
const CardContainer = styled.div`
    background: ${colors.white};
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 15px;
    width: 23%; // Permite 4 tarjetas por fila
    min-width: 250px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 1200px) {
        width: 48%; // 2 por fila
    }
    @media (max-width: 600px) {
        width: 100%; // 1 por fila
    }
`;

const ImagePlaceholder = styled.div`
    background-color: ${colors.lightGray};
    border-radius: 8px;
    height: 120px;
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid ${colors.details};
`;

const CarIcon = styled(FontAwesomeIcon)`
    color: ${colors.detail};
    font-size: 40px;
`;

const Title = styled.h3`
    color: ${colors.text};
    margin-bottom: 5px;
    font-size: 1.2em;
`;

const DetailText = styled.p`
    color: ${colors.details};
    margin: 3px 0;
    font-size: 0.9em;
`;

const ActionButton = styled.button`
    background-color: ${colors.primary};
    color: ${colors.white};
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    align-self: flex-end; /* Lo alinea a la derecha inferior */
    margin-top: 10px;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${colors.primaryHover};
    }
`;

const TripCard = ({ sector, conductor, desde, para, horaSalida, valor, cupos, onReserve }) => {
    return (
        <CardContainer>
            <div>
                <ImagePlaceholder>
                    <CarIcon icon={faCar} />
                </ImagePlaceholder>
                <Title>{sector}</Title>
                <DetailText>Conductor: {conductor}</DetailText>
                <DetailText>Desde: {desde}</DetailText>
                <DetailText>Para: {para}</DetailText>
                <DetailText>Hora salida: {horaSalida}</DetailText>
                <DetailText>Valor: {valor}</DetailText>
                <DetailText>Cupos: {cupos}</DetailText>
            </div>
            <ActionButton onClick={onReserve}>
                <FontAwesomeIcon icon={faPlus} />
            </ActionButton>
        </CardContainer>
    );
};

export default TripCard;