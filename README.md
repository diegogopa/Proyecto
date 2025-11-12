# 🚗 Sistema de Viajes Compartidos

Sistema web para conectar conductores y pasajeros que desean compartir viajes, especialmente diseñado para la comunidad universitaria.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Estructura de Datos](#estructura-de-datos)
- [Flujo de Usuario](#flujo-de-usuario)
- [Manejo de Sesiones](#manejo-de-sesiones)
- [Contribución](#contribución)

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

### Seguridad y Sesiones
- ✅ Autenticación con contraseñas hasheadas (bcrypt)
- ✅ Validación de sesiones para evitar conflictos entre pestañas
- ✅ Manejo seguro de localStorage
- ✅ Validación de permisos en operaciones críticas

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **bcryptjs** - Hashing de contraseñas
- **dotenv** - Variables de entorno
- **cors** - Configuración CORS
- **multer** - Manejo de archivos (fotos de vehículos)

### Frontend
- **React** - Biblioteca de UI
- **React Router** - Enrutamiento
- **Redux** - Gestión de estado
- **Styled Components** - Estilos CSS-in-JS
- **Axios** - Cliente HTTP
- **Font Awesome** - Iconos
- **Vite** - Build tool

## 📁 Estructura del Proyecto

```
Proyecto/
├── backend/
│   ├── server.js              # Servidor principal y endpoints de la API
│   ├── models/
│   │   └── User.js            # Modelo de usuario (si se usa)
│   ├── routes/
│   │   ├── userRoutes.js      # Rutas de usuarios
│   │   └── CarRoutes.js       # Rutas de vehículos
│   ├── controllers/
│   │   └── userController.js  # Controladores de usuarios
│   ├── package.json           # Dependencias del backend
│   └── .env                   # Variables de entorno (no incluido en git)
│
├── fronted/
│   ├── src/
│   │   ├── App.jsx            # Componente principal y rutas
│   │   ├── main.jsx           # Punto de entrada
│   │   ├── pages/             # Páginas de la aplicación
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── HomeDriver.jsx
│   │   │   └── ...
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── home/
│   │   │   ├── trips/
│   │   │   └── common/
│   │   ├── assets/            # Recursos estáticos
│   │   ├── config/            # Configuración
│   │   └── contexts/          # Contextos de React
│   ├── package.json           # Dependencias del frontend
│   └── vite.config.js         # Configuración de Vite
│
└── README.md                   # Este archivo
```

## 🚀 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn
- MongoDB Atlas (cuenta gratuita) o MongoDB local
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Proyecto
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Instalar dependencias del frontend**
   ```bash
   cd ../fronted
   npm install
   ```

## ⚙️ Configuración

### Backend

1. **Crear archivo `.env` en la carpeta `backend/`**
   ```env
   MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/nombre-db?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   ```

2. **Configurar MongoDB Atlas**
   - Crear una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Crear un cluster gratuito
   - Obtener la cadena de conexión (MONGO_URI)
   - Agregar tu IP a la whitelist

### Frontend

1. **Configurar la URL de la API en `fronted/src/config/api.js`**
   ```javascript
   const API_BASE_URL = "http://localhost:5000/api";
   // O en producción:
   // const API_BASE_URL = "https://proyecto5-vs2l.onrender.com/api";
   ```

## 🎯 Uso

### Iniciar el Backend
```bash
cd backend
npm start
# O para desarrollo con nodemon:
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Iniciar el Frontend
```bash
cd fronted
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📡 API Endpoints

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/users/register` | Registrar nuevo usuario |
| `POST` | `/api/users/login` | Iniciar sesión |
| `GET` | `/api/users/:email` | Obtener usuario por email |
| `PUT` | `/api/users/:email` | Actualizar usuario |
| `GET` | `/api/users/placa/:placa` | Verificar si placa existe |

### Viajes (Trips)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/trips` | Crear nuevo viaje |
| `GET` | `/api/trips` | Obtener todos los viajes disponibles |
| `GET` | `/api/trips/:userId` | Obtener viajes de un conductor |
| `DELETE` | `/api/trips/:tripId` | Eliminar viaje |

### Reservas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/trips/:tripId/reserve` | Crear reserva |
| `GET` | `/api/users/:userId/reservations` | Obtener reservas de un usuario |
| `DELETE` | `/api/reservations/:reservationId` | Eliminar reserva (devuelve cupos) |
| `PUT` | `/api/reservations/:reservationId/status` | Actualizar estado de reserva |
| `GET` | `/api/drivers/:driverId/pending-requests` | Obtener solicitudes pendientes |

### Documentación Detallada

Para más detalles sobre cada endpoint, consulta los comentarios JSDoc en `backend/server.js`.

## 📊 Estructura de Datos

### Usuario (User Schema)

```javascript
{
  nombre: String (requerido),
  apellido: String (requerido),
  idUniversidad: String,
  email: String (requerido, único),
  telefono: String,
  password: String (requerido, hasheado),
  placa: String,
  cupos: Number,
  marca: String,
  modelo: String,
  carPhoto: String (URL de la foto),
  trips: [{
    departureTime: String,
    fromLocation: String,
    toLocation: String,
    price: Number,
    sector: String,
    cupos: Number,
    createdAt: Date
  }],
  reservations: [{
    tripId: ObjectId,
    driverUserId: ObjectId,
    numberOfSeats: Number,
    pickupAddresses: [String],
    pickupAddress: String,
    status: String ("Pendiente", "Aceptada", "Rechazada"),
    createdAt: Date
  }]
}
```

## 🔄 Flujo de Usuario

### Registro de Pasajero
1. Usuario se registra con email y contraseña
2. Opcionalmente sube foto de perfil
3. Responde si quiere registrar un vehículo
4. Si responde "No", va directamente al home de pasajero
5. Si responde "Sí", sigue el flujo de conductor

### Registro de Conductor
1. Usuario se registra
2. Responde "Sí" a registrar vehículo
3. Completa información del vehículo (placa, marca, modelo, cupos)
4. Sube foto del vehículo
5. Sube foto del SOAT
6. Accede al home de conductor

### Reserva de Viaje
1. Pasajero busca viajes disponibles
2. Selecciona un viaje y hace clic en "Reservar"
3. Ingresa dirección de recogida y número de cupos
4. El sistema resta los cupos del viaje
5. La reserva queda en estado "Pendiente"
6. El conductor ve la solicitud en "Viajes Pendientes"
7. El conductor acepta o rechaza
8. Si rechaza, el pasajero ve botón "Borrar" (rojo)
9. Si acepta, el pasajero ve estado verde "Aceptada"

### Gestión de Cupos
- **Al crear reserva**: Se restan los cupos del viaje
- **Al rechazar reserva**: Los cupos NO se devuelven automáticamente
- **Al borrar reserva rechazada**: Los cupos se devuelven al viaje
- **Al cancelar reserva**: Los cupos se devuelven al viaje

## 🔐 Manejo de Sesiones

La aplicación utiliza `localStorage` para gestionar sesiones, con las siguientes consideraciones:

- **userEmail**: Identificador principal de la sesión
- **user**: Objeto completo del usuario
- **token**: Token de autenticación (si se implementa)

### Prevención de Conflictos entre Pestañas

Para evitar que una sesión de una pestaña interfiera con otra:

1. Al iniciar sesión o registrarse, se limpia `localStorage` antes de guardar nuevos datos
2. Se valida que el `userEmail` coincida con el email del usuario en `localStorage`
3. Si hay discrepancia, se limpia la sesión y se redirige al login

### Archivos que Implementan Validación de Sesión
- `fronted/src/pages/Login.jsx`
- `fronted/src/pages/Register.jsx`
- `fronted/src/pages/CarQuestion.jsx`
- `fronted/src/pages/SoatPhoto.jsx`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas Importantes

### Orden de Rutas en Express
- La ruta `GET /api/trips` debe estar **antes** de `GET /api/trips/:userId`
- La ruta `DELETE /api/trips/:tripId` debe estar **antes** de `GET /api/trips/:userId`

### Manejo de Cupos
- Los cupos se restan cuando se crea una reserva
- Los cupos se devuelven cuando se elimina una reserva (independientemente del estado)
- Al rechazar una reserva, los cupos NO se devuelven automáticamente

### Compatibilidad
- El campo `pickupAddress` se mantiene para compatibilidad con reservas antiguas
- El campo `pickupAddresses` es el preferido para nuevas reservas (soporta múltiples cupos)

## 📧 Contacto

Para preguntas o sugerencias, contacta al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: 2024
