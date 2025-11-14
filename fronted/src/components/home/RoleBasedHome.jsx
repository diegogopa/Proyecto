//src/components/home/RoleBasedHome.jsx
//Componente que renderiza la vista principal (Home) basada en el rol del usuario desde Redux

import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../features/users/UserSlice.jsx';
import Home from './Home.jsx'; //Vista de Pasajero
import HomeDriver from './HomeDriver.jsx'; //Vista de Conductor

//Componente que decide qué vista mostrar según el rol del usuario
function RoleBasedHome() {
    //Obtiene el rol actual del usuario desde Redux
    const role = useSelector(selectUserRole);

    //Si el rol es 'conductor', muestra la vista del conductor
    if (role === 'conductor') {
        return <HomeDriver />;
    }
    
    //Si el rol es 'pasajero', muestra la vista del pasajero
    return <Home />;
}

export default RoleBasedHome;