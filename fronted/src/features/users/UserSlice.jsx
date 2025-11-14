//src/features/users/UserSlice.jsx
//Slice que maneja el estado del usuario
//Incluye: estado del usuario, función para actualizar el ID, función para actualizar el nombre, función para actualizar el token, función para actualizar la foto, función para actualizar el estado, función para actualizar el rol, función para actualizar el carro y función para limpiar el usuario

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  name: null,
  token: null,
  photo: null,
  status: 'loading', 
  role: 'pasajero',
  hasCar: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setId: (state, action) => {
      state.id = action.payload;
    },

    setName: (state, action) => {
      state.name = action.payload;
    },

    setToken: (state, action) => {
      state.token = action.payload;
    },

    setUserLogin: (state, action) => {
      state.name = action.payload.name;
      state.id = action.payload.id;
      state.token = action.payload.token;
      state.photo = action.payload.photo;
      state.status = 'success';
      state.role = action.payload.role || 'pasajero';
      state.hasCar = action.payload.hasCar || false;
    },
    
    clearUser: (state) => {
      
      state.id = null;
      state.token = null;
      state.name = null;
      state.photo = null;
      state.status = 'loading';
      state.role = 'pasajero'; 
      state.hasCar = false;
    },

    setRole: (state, action) => {
      state.role = action.payload; 
    },

    setHasCar: (state, action) => {
      state.hasCar = action.payload;
    },
  },
});

export const { setId, setName, setToken, clearUser, setUserLogin, setRole, setHasCar } = userSlice.actions;

export const selectUser = (state) => state.user.id;
export const selectName = (state) => state.user.name;
export const selectToken = (state) => state.user.token;
export const selectPhoto = (state) => state.user.photo;
export const selectUserRole = (state) => state.user.role;
export const selectHasCar = (state) => state.user.hasCar;

export default userSlice.reducer;