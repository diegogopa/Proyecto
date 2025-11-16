//src/contexts/DriverContext.jsx
//Contexto para saber si el usuario es conductor o pasajero
//Incluye: estado de si es conductor o pasajero, función para cambiar el modo y función para obtener el contexto

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

const DriverContext = createContext();

export const useDriver = () => {
  return useContext(DriverContext);
};

export const DriverProvider = ({ children }) => {
  const [isDriver, setIsDriver] = useState(() => {
    const storedMode = getStorageItem('isDriverMode');
    return storedMode === 'true';
  });

  useEffect(() => {
    setStorageItem('isDriverMode', isDriver);
  }, [isDriver]);

  const toggleDriverMode = () => {
    setIsDriver(prevMode => !prevMode);
  };

  const contextValue = {
    isDriver,
    toggleDriverMode,
  };

  return (
    <DriverContext.Provider value={contextValue}>
      {children}
    </DriverContext.Provider>
  );
};