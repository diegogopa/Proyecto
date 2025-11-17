//Componente principal de la aplicación React.

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { MessageProvider } from './contexts/MessageContext';
import { setToken, clearUser, setHasCar } from './features/users/UserSlice.jsx';
import { getToken, getUser } from './utils/storage';

// Importamos las páginas
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
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';

// Home para conductores
import HomeDriver from './components/home/HomeDriver.jsx';

//Componente Layout que envuelve todas las rutas.
function Layout({ children }) {
  const location = useLocation();
  const token = useSelector(selectToken);
  const isAuthenticated = !!token;

  //Rutas donde NO se muestra el menú de navegación.
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
      {isAuthenticated && !hideMenu && <NavigationMenu />}
      {children}
    </>
  );
}

//Componente para sincronizar Redux con sessionStorage
function AuthSync() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const location = useLocation();

  // Sincronizar Redux con sessionStorage cuando cambia la ruta
  useEffect(() => {
    const sessionToken = getToken();
    const sessionUser = getUser();
    
    // Si hay token en sessionStorage pero no en Redux, actualizar Redux
    if (sessionToken && !token) {
      dispatch(setToken(sessionToken));
    }
    
    // Si hay usuario en sessionStorage, actualizar hasCar en Redux
    if (sessionUser) {
      const hasCarComplete = sessionUser.placa?.trim() &&
                            sessionUser.marca?.trim() &&
                            sessionUser.modelo?.trim() &&
                            sessionUser.cupos > 0;
      dispatch(setHasCar(hasCarComplete));
    }
    
    // Si no hay token ni usuario en sessionStorage, limpiar Redux
    if (!sessionToken || !sessionUser) {
      if (token) {
        dispatch(clearUser());
      }
    }
  }, [location.pathname, token, dispatch]);

  return null;
}

//Componente principal de la aplicación.
function App() {
  const token = useSelector(selectToken);
  const isAuthenticated = !!token;

  return (
    <MessageProvider>
      <Router>
        <AuthSync />
        <Layout>
          <Routes>
          
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/add-photoProfile" element={<AddPhotoProfile />} />
          <Route path="/car-question" element={<CarQuestion />} />
          <Route path="/verify-car" element={<VerifyCar />} />
          <Route path="/register-car" element={<RegisterCar />} />
          <Route path="/car-photo" element={<CarPhoto />} />
          <Route path="/soat-photo" element={<SoatPhoto />} />

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
    </MessageProvider>
  );
}

export default App;
