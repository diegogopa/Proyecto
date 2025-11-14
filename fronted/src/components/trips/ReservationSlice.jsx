// src/features/reservations/ReservationSlice.jsx
//Slice que maneja el estado de las reservas
//Incluye: lista de reservas, estado de las reservas, errores, etc..

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    reservations: [],
    status: 'idle', 
    error: null,
};

const reservationTravelSlice = createSlice({
    name: 'reservations',
    initialState,
    reducers: {
        deleteReservation: (state, action) => {
            const idToDelete = action.payload;
            state.reservations = state.reservations.filter(
                reservation => reservation.id !== idToDelete
            );
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createReservation.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createReservation.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reservations.push(action.payload); 
            })
            .addCase(createReservation.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Fallo al realizar la reserva.';
            });
    },
});

let nextReservationId = 1;

export const createReservation = createAsyncThunk(
    'reservations/createReservation',
    async (reservationData, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/reservas', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservationData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'El servidor rechazó la reserva.');
            }

            const newReservation = await response.json();
            return newReservation; 

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const { deleteReservation, updateReservationStatus } = reservationTravelSlice.actions;

export const selectReservations = (state) => state.reservations.reservations;
export const selectReservationStatus = (state) => state.reservations.status;
export const selectFilteredReservations = (status) => (state) => {
    return state.reservations.reservations.filter(r => r.status === status);
};

export default reservationTravelSlice.reducer;