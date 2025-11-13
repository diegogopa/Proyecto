//Direccion
//Componente de carga con animación

import React from "react";
import styled, { keyframes } from "styled-components"; 
import colors from '../../assets/Colors';

// Define el keyframes para el loader
const loaderFade = keyframes`
  0% { background-color: ${colors.primary}; }
  100% { background-color: transparent; }
`;

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.background};
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000; 

  .spinner {
    font-size: 28px;
    position: relative;
    display: inline-block;
    width: 1em;
    height: 1em;
  }

  .spinner.center {
    margin: auto;
  }

  .spinner .spinner-blade {
    position: absolute;
    left: 0.4629em;
    bottom: 0;
    width: 0.074em;
    height: 0.2777em;
    border-radius: 0.0555em;
    background-color: transparent;
    transform-origin: center -0.2222em;
    animation: ${loaderFade} 1s infinite linear; 
  }

  .spinner .spinner-blade:nth-child(1) { animation-delay: 0s; transform: rotate(0deg); }
  .spinner .spinner-blade:nth-child(2) { animation-delay: 0.083s; transform: rotate(30deg); }
  .spinner .spinner-blade:nth-child(3) { animation-delay: 0.166s; transform: rotate(60deg); }
  .spinner .spinner-blade:nth-child(4) { animation-delay: 0.249s; transform: rotate(90deg); }
  .spinner .spinner-blade:nth-child(5) { animation-delay: 0.332s; transform: rotate(120deg); }
  .spinner .spinner-blade:nth-child(6) { animation-delay: 0.415s; transform: rotate(150deg); }
  .spinner .spinner-blade:nth-child(7) { animation-delay: 0.498s; transform: rotate(180deg); }
  .spinner .spinner-blade:nth-child(8) { animation-delay: 0.581s; transform: rotate(210deg); }
  .spinner .spinner-blade:nth-child(9) { animation-delay: 0.664s; transform: rotate(240deg); }
  .spinner .spinner-blade:nth-child(10) { animation-delay: 0.747s; transform: rotate(270deg); }
  .spinner .spinner-blade:nth-child(11) { animation-delay: 0.83s; transform: rotate(300deg); }
  .spinner .spinner-blade:nth-child(12) { animation-delay: 0.913s; transform: rotate(330deg); }
`;

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="spinner center">
        {/* Generamos las 12 imagenes del loader que nos inventamos*/}
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="spinner-blade" />
        ))}
      </div>
    </StyledWrapper>
  );
};

export default Loader;