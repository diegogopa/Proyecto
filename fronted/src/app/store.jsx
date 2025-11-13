// src/app/store.jsx
//Contiene todo el estado de la aplicación que necesita ser compartido entre múltiples componentes.
import { configureStore } from '@reduxjs/toolkit'; //creamos la funcion principal para crear el store
import userSlice from '../features/users/UserSlice'; //importamos el slice del usuario, maneja el estado del usuario, id,name,etc..
import reservationTravel from "../components/trips/ReservationSlice.jsx"; //importamos el slice de las reservas, maneja el estado de las reservas, lista de reservas, estado de las peticiones, errores, etc..

export const store = configureStore({ //creamos el store con el estado global 
  reducer: {
    user: userSlice,
    reservation: reservationTravel
  },
});