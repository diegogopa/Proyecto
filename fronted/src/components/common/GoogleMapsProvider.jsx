//Falta poner direccion
// Provider de contexto para Google Maps
//Hace que la API de Google Maps esté disponible en toda la aplicación mediante Context API de React  

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const LIBRARIES = ['places', 'geometry'];

const GoogleMapsContext = createContext();

export const GoogleMapsProvider = ({ children }) => {
  // Carga el script de Google Maps usando tu clave de entorno
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_API_KEY,
    libraries: LIBRARIES,
  });

  const [services, setServices] = useState({
    geocoder: null,
    directionsService: null,
    placesService: null,
  });

  useEffect(() => { //Efecto que inicializa los servicios cuando Google Maps está cargado
    if (isLoaded) {
      setServices({
        geocoder: new window.google.maps.Geocoder(),
        directionsService: new window.google.maps.DirectionsService(),
        placesService: new window.google.maps.places.PlacesService(document.createElement('div')),
      });
    }
  }, [isLoaded]);

  return (
    <GoogleMapsContext.Provider value={{ services, isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  return useContext(GoogleMapsContext);
};