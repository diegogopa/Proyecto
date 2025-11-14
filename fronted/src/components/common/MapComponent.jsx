//Direccion
// Componente de mapa con Google Maps

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Autocomplete, Marker, DirectionsRenderer } from '@react-google-maps/api';
import styled from 'styled-components';
import { useGoogleMaps } from './GoogleMapsProvider';

const MapContainer = styled.div`
    width: 100%;
    height: 400px; /* Asegúrate de que tenga una altura definida */
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const MapComponent = ({ onAddressSelect, origin, destination, currentSelection }) => {
  const { services, isLoaded, loadError } = useGoogleMaps(); // Hook personalizado para acceder al contexto de Google Maps
  const [autocomplete, setAutocomplete] = useState(null);
  const [place, setPlace] = useState(null);
  const [center, setCenter] = useState({ lat: 4.7110, lng: -74.0721 });
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const directionsRendererRef = useRef(null);
  const mapRef = useRef(null);

  const onLoad = (autocompleteInstance) => { //Función que se ejecuta cuando el autocompletado se carga
    setAutocomplete(autocompleteInstance);
  };

  // Función para geocodificar una dirección y obtener coordenadas
  const geocodeAddress = useCallback((address, callback) => {
    if (!services.geocoder || !address) return;

    services.geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };

        callback(location);
      } else {
        console.error('Error en geocodificación:', status);
        callback(null);
      }
    });
  }, [services.geocoder]); 

  // Efecto para actualizar coordenadas cuando cambian origin o destination
  useEffect(() => {
    if (origin) {
      geocodeAddress(origin, (coords) => {
        if (coords) {
          setOriginCoords(coords);
        }
      });
    } else {
      setOriginCoords(null);
    }
    if (destination) {
      geocodeAddress(destination, (coords) => {
        if (coords) {
          setDestinationCoords(coords);
        }
      });
    } else {
      setDestinationCoords(null);
    }
  }, [origin, destination, geocodeAddress]); 

  // Efecto para calcular la ruta cuando ambos puntos estén disponibles
  useEffect(() => {
    if (originCoords && destinationCoords && services.directionsService) {
      setRouteError(null);

      const request = {
        origin: originCoords,
        destination: destinationCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      services.directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          setDirectionsResponse(result);
          // Ajustar el zoom para mostrar toda la ruta
          if (mapRef.current && result.routes && result.routes[0]) {
            const bounds = new window.google.maps.LatLngBounds();
            result.routes[0].legs.forEach((leg) => {
              bounds.extend(leg.start_location);
              bounds.extend(leg.end_location);
            });
            mapRef.current.fitBounds(bounds);
          }
        } else {
          console.error('Error al calcular la ruta:', status);
          setRouteError('No se pudo calcular la ruta');
          setDirectionsResponse(null);
        }
      });
    } else {
      setDirectionsResponse(null);
    }
  }, [originCoords, destinationCoords, services.directionsService]); 

  const handleMapClick = useCallback((event) => {
    if (!services.geocoder) return; 

    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    // 1. Mover el marcador al punto clicado
    setCenter(newLocation);
    setPlace({ geometry: { location: { lat: () => newLocation.lat, lng: () => newLocation.lng } } });

    // 2. Usar Geocodificación Inversa para obtener la dirección
    services.geocoder.geocode({ location: newLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;

        if (onAddressSelect) {
          onAddressSelect(address); // Llama a la función de prop con la nueva dirección
        }

        console.log("📍 Lugar seleccionado (Clic en mapa):", address);
      } else {
        console.error('Geocodificación inversa fallida:', status);
        if (onAddressSelect) {
            onAddressSelect("Ubicación seleccionada (dirección no disponible)");
        }
      }
    });
  }, [services.geocoder, onAddressSelect]);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const selectedPlace = autocomplete.getPlace();
      if (selectedPlace.geometry) {
        const newLocation = {
          lat: selectedPlace.geometry.location.lat(),
          lng: selectedPlace.geometry.location.lng(),
        };

        setCenter(newLocation);
        setPlace(selectedPlace);

        if (onAddressSelect) {
          onAddressSelect(selectedPlace.formatted_address);
        }

        console.log("📍 Lugar seleccionado:", selectedPlace.formatted_address);
      } else {
        console.error("El lugar seleccionado no tiene información geográfica.");
      }
    }
  };

  // Callback para cuando DirectionsRenderer se carga
  const onDirectionsRendererLoad = useCallback((directionsRenderer) => {
    directionsRendererRef.current = directionsRenderer;
  }, []); 

  if (loadError) return <div>Error al cargar Google Maps. Verifica tu clave de API.</div>;
  if (!isLoaded) return <div>Cargando Mapa...</div>;

  return (
    <MapContainer>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={14}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="Escribe una dirección para buscar..."
            style={{
              boxSizing: 'border-box',
              border: '1px solid #ccc',
              width: '280px',
              height: '40px',
              padding: '0 15px',
              borderRadius: '20px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              fontSize: '15px',
              outline: 'none',
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
            }}
          />
        </Autocomplete>

        {/* Mostrar ruta si está disponible */}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
              suppressMarkers: true, 
            }}
            onLoad={onDirectionsRendererLoad}
          />
        )}

        {/* Marcador de origen (verde) */}
        {originCoords && (
          <Marker
            position={originCoords}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#34A853',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
            label={{
              text: 'Origen',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          />
        )}

        {/* Marcador de destino (rojo) */}
        {destinationCoords && (
          <Marker
            position={destinationCoords}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#EA4335',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
            label={{
              text: 'Destino',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          />
        )}

        {/* Marcador temporal cuando se está seleccionando un punto y aún no hay origen o destino */}
        {place && (!origin || !destination) && !originCoords && !destinationCoords && (
          <Marker
            position={{
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }}
          />
        )}
      </GoogleMap>

      {routeError && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ff4444',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 10,
        }}>
          {routeError}
        </div>
      )}
    </MapContainer>
  );
};

export default MapComponent;