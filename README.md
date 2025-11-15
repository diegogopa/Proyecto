# 🚗 Sistema de Viajes Compartidos

Sistema web para conectar conductores y pasajeros que desean compartir viajes, especialmente diseñado para la comunidad universitaria.
# Despliegue
- Backend: https://proyecto5-vs2l.onrender.com
- Fronted: https://proyecto9-c03h.onrender.com

## 📝 Descripción

Este proyecto es una aplicación web full-stack que permite a los usuarios:

- **Como Pasajeros**: Buscar y reservar viajes disponibles, ver sus reservas y cancelarlas.
- **Como Conductores**: Crear viajes, gestionar solicitudes de reservas (aceptar/rechazar), y ver sus viajes creados.

La aplicación está diseñada para facilitar el transporte compartido entre miembros de la comunidad universitaria, permitiendo a los conductores publicar viajes con información detallada (origen, destino, precio, cupos disponibles) y a los pasajeros reservar estos viajes de manera sencilla.

## ✨ Características

### Para Pasajeros
- ✅ Registro e inicio de sesión
- ✅ Búsqueda de viajes disponibles
- ✅ Reserva de múltiples cupos en un viaje
- ✅ Visualización de reservas con estados (Pendiente, Aceptada, Rechazada)
- ✅ Cancelación de reservas (devuelve cupos al viaje)
- ✅ Borrado de reservas rechazadas
- ✅ Código de colores para estados de reservas:
  - 🟡 Amarillo: Pendiente
  - 🟢 Verde: Aceptada
  - 🔴 Rojo: Rechazada

### Para Conductores
- ✅ Registro de vehículo (placa, marca, modelo, cupos)
- ✅ Subida de foto del vehículo
- ✅ Creación de viajes con información detallada
- ✅ Visualización de solicitudes pendientes
- ✅ Aceptar o rechazar solicitudes de reservas
- ✅ Gestión de viajes creados (ver y eliminar)
- ✅ Visualización de foto del vehículo en los viajes publicados

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **bcryptjs** - Hashing de contraseñas
- **dotenv** - Variables de entorno
- **cors** - Configuración CORS

### Frontend
- **React** - Biblioteca de UI
- **React Router** - Enrutamiento
- **Redux** - Gestión de estado
- **Styled Components** - Estilos CSS-in-JS
- **Axios** - Cliente HTTP
- **Font Awesome** - Iconos
- **Vite** - Build tool

## 🛠️ Creadores
- **Sara Santacruz Corredor** (320872)
- **Diego Alejandro Gomez Papagayo** (336260)
