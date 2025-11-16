// src/index.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useDispatch } from 'react-redux';
import { StrictMode } from 'react';
import App from './App.jsx';
import { store } from './app/store.jsx';
import {GoogleMapsProvider} from './components/common/GoogleMapsProvider.jsx';
import { DriverProvider } from './contexts/DriverContext.jsx';
import { setToken } from './features/users/UserSlice.jsx';
import { getToken } from './utils/storage';
import './index.css';

// Componente para inicializar el estado desde sessionStorage
function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Limpiar localStorage antiguo para evitar conflictos
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
    } catch (error) {
      console.warn('Error al limpiar localStorage:', error);
    }

    // Inicializar el token desde sessionStorage al cargar la app
    const token = getToken();
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleMapsProvider>
      <Provider store={store}> 
        <DriverProvider>
          <AppInitializer>
            <App />
          </AppInitializer>
        </DriverProvider>
      </Provider>
    </GoogleMapsProvider>
  </StrictMode>,
)
