/**
 * @fileoverview Componente principal de la aplicación React.
 * 
 * Este archivo contiene:
 * - Configuración de rutas con React Router
 * - Componente Layout que controla la visualización del menú de navegación
 * - Rutas públicas y protegidas
 * - Protección de rutas basada en autenticación
 * 
 * @author Equipo de Desarrollo
 * @version 1.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

// Importa las páginas
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import ErrorPage from './pages/ErrorLogin.jsx';
import Register from './pages/Register.jsx';
import AddPhotoProfile from './pages/AddPhotoProfile.jsx';
import CarQuestion from './pages/CarQuestion.jsx';
import VerifyCar from './pages/VerifyCar.jsx';
import RegisterCar from './pages/RegisterCar.jsx';
import CarPhoto from './pages/CarPhoto.jsx';
import SoatPhoto from './pages/SoatPhoto.jsx';
import Home from './components/home/Home.jsx';
import NavigationMenu from './components/header/NavigationMenu.jsx';
import { selectToken } from './features/users/UserSlice.jsx';
import ReservedTravelTittle from './components/home/ReservedTravelTittle.jsx';
import CurrentTravel from './components/home/CurrentTravel.jsx';

// Importamos la nueva página de perfil
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';

// Home para conductores
import HomeDriver from './components/home/HomeDriver.jsx';

/**
 * Componente Layout que envuelve todas las rutas.
 * 
 * Controla la visualización del menú de navegación basándose en:
 * - Si el usuario está autenticado (token existe)
 * - Si la ruta actual debe ocultar el menú
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar
 * @returns {JSX.Element} Layout con o sin menú de navegación
 */
function Layout({ children }) {
  const location = useLocation();
  const token = useSelector(selectToken);
  const isAuthenticated = !!token;

  /**
   * Rutas donde NO se muestra el menú de navegación.
   * Estas son principalmente páginas de autenticación y registro.
   */
  const hideMenuRoutes = [
    '/',
    '/login',
    '/register',
    '/add-photoProfile',
    '/car-question',
    '/verify-car',
    '/register-car',
    '/car-photo',
    '/soat-photo'
  ];

  const hideMenu = hideMenuRoutes.includes(location.pathname.toLowerCase());

  return (
    <>
      {/* Mostrar menú solo si el usuario está autenticado y la ruta no está en la lista de ocultar */}
      {isAuthenticated && !hideMenu && <NavigationMenu />}
      {children}
    </>
  );
}

/**
 * Componente principal de la aplicación.
 * 
 * Define todas las rutas de la aplicación y maneja la protección de rutas
 * basándose en el estado de autenticación del usuario.
 * 
 * Rutas públicas: LandingPage, Login, Register, páginas de registro de vehículo
 * Rutas protegidas: Home, HomeDriver, Profile, EditProfile
 * 
 * @returns {JSX.Element} Aplicación con enrutamiento configurado
 */
function App() {
  const token = useSelector(selectToken);
  const isAuthenticated = !!token;

  return (
    <Router>
      <Layout>
        <Routes>
          {/* ============================================
              RUTAS PÚBLICAS
              Estas rutas son accesibles sin autenticación
              ============================================ */}
          
          {/* Página de inicio/landing */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/error" element={<ErrorPage />} />
          
          {/* Flujo de registro de vehículo */}
          <Route path="/add-photoProfile" element={<AddPhotoProfile />} />
          <Route path="/car-question" element={<CarQuestion />} />
          <Route path="/verify-car" element={<VerifyCar />} />
          <Route path="/register-car" element={<RegisterCar />} />
          <Route path="/car-photo" element={<CarPhoto />} />
          <Route path="/soat-photo" element={<SoatPhoto />} />

          {/* ============================================
              RUTAS PROTEGIDAS
              Estas rutas requieren autenticación
              ============================================ */}
          
          {/* Página principal de pasajeros */}
          <Route path="/home" element={<Home />} />

          {/* Página principal de conductores */}
          <Route path="/home-driver" element={<HomeDriver />} />

          {/* Perfil de usuario */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* Rutas adicionales */}
          <Route path="/reserved-travelTittle" element={<ReservedTravelTittle />} />
          <Route path="/current-travel" element={<CurrentTravel />} />

          {/* ============================================
              REDIRECCIONES Y PROTECCIÓN
              ============================================ */}
          
          {/* Redirigir a /home si está autenticado, sino a login */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
          />
          
          {/* Proteger /home: redirigir a / si no está autenticado */}
          <Route
            path="/home"
            element={isAuthenticated ? <Home /> : <Navigate to="/" />}
          />
          
          {/* Proteger /verify-car: redirigir a /login si no está autenticado */}
          <Route
            path="/verify-car"
            element={isAuthenticated ? <VerifyCar /> : <Navigate to="/login" />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
