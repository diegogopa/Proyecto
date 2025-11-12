/**
 * @fileoverview Servidor principal del backend de la aplicación de viajes compartidos.
 * 
 * Este archivo contiene:
 * - Configuración del servidor Express
 * - Conexión a MongoDB Atlas
 * - Definición del esquema de usuario (User Schema)
 * - Endpoints de la API REST para usuarios, viajes y reservas
 * 
 * @author Equipo de Desarrollo
 * @version 1.0.0
 */

// ============================================================================
// IMPORTS Y CONFIGURACIÓN INICIAL
// ============================================================================

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Inicializar aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// CONFIGURACIÓN CORS (Cross-Origin Resource Sharing)
// ============================================================================

/**
 * Orígenes permitidos para las peticiones CORS.
 * Solo estos dominios pueden hacer peticiones al backend.
 */
const allowedOrigins = [
  "https://proyecto9-c03h.onrender.com", // Frontend en producción
  "http://localhost:5173", // Frontend en desarrollo
];

/**
 * Configuración de CORS para permitir peticiones desde los orígenes especificados.
 * También permite credenciales y métodos HTTP específicos.
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (ej: Postman, aplicaciones móviles)
    if (!origin) return callback(null, true);
    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("No permitido por CORS"));
  },
  credentials: true, // Permitir cookies y credenciales
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware para parsear JSON en el body de las peticiones

// ============================================================================
// CONEXIÓN A MONGODB ATLAS
// ============================================================================

/**
 * Conecta a la base de datos MongoDB Atlas usando la URI almacenada en variables de entorno.
 * La URI debe estar en el archivo .env como MONGO_URI.
 */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error al conectar MongoDB:", err));

// ============================================================================
// ESQUEMA DE USUARIO (USER SCHEMA)
// ============================================================================

/**
 * Esquema de Mongoose para el modelo User.
 * 
 * Este esquema define la estructura de un usuario en la base de datos:
 * - Información personal (nombre, apellido, email, etc.)
 * - Información del vehículo (placa, cupos, marca, modelo)
 * - Array de viajes creados por el usuario (si es conductor)
 * - Array de reservas realizadas por el usuario (si es pasajero)
 * 
 * @typedef {Object} UserSchema
 * @property {String} nombre - Nombre del usuario (requerido)
 * @property {String} apellido - Apellido del usuario (requerido)
 * @property {String} idUniversidad - ID de la universidad (opcional)
 * @property {String} email - Email del usuario (requerido, único)
 * @property {String} telefono - Teléfono del usuario (opcional)
 * @property {String} password - Contraseña hasheada (requerido)
 * @property {String} placa - Placa del vehículo (opcional, default: "")
 * @property {Number} cupos - Número de cupos disponibles en el vehículo (opcional, default: 0)
 * @property {String} marca - Marca del vehículo (opcional, default: "")
 * @property {String} modelo - Modelo del vehículo (opcional, default: "")
 * @property {String} carPhoto - URL de la foto del carro (opcional, default: "")
 * @property {Array<Trip>} trips - Array de viajes creados por el conductor
 * @property {Array<Reservation>} reservations - Array de reservas realizadas por el pasajero
 */
const userSchema = new mongoose.Schema(
  {
    // Información personal
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    idUniversidad: String,
    email: { type: String, required: true, unique: true },
    telefono: String,
    password: { type: String, required: true },

    // 🚗 Información del carro
    placa: { type: String, default: "" },
    cupos: { type: Number, default: 0 },
    marca: { type: String, default: "" },
    modelo: { type: String, default: "" },
    carPhoto: { type: String, default: "" }, // URL de la foto del carro

    // ✅ Lista de trips del conductor
    // Cada usuario puede crear múltiples viajes
    trips: [
      {
        departureTime: { type: String, required: true }, // Hora de salida
        fromLocation: { type: String, required: true }, // Origen
        toLocation: { type: String, required: true }, // Destino
        price: { type: Number, required: true }, // Precio del viaje
        sector: { type: String, required: true }, // Sector/área
        cupos: { type: Number, required: true }, // Cupos disponibles en este viaje
        createdAt: { type: Date, default: Date.now }, // Fecha de creación
      },
    ],

    // ✅ Lista de reservas del pasajero
    // Cada usuario puede tener múltiples reservas en diferentes viajes
    reservations: [
      {
        tripId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID del viaje reservado
        driverUserId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID del conductor
        numberOfSeats: { type: Number, required: true, default: 1 }, // Número de cupos reservados
        pickupAddresses: [{ type: String, required: true }], // Array de direcciones, una por cada cupo
        status: { type: String, default: "Pendiente" }, // Estado: "Pendiente", "Aceptada", "Rechazada"
        createdAt: { type: Date, default: Date.now }, // Fecha de creación
        // Mantener pickupAddress para compatibilidad con reservas antiguas
        pickupAddress: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true } // Agregar automáticamente createdAt y updatedAt
);

// Crear el modelo User a partir del esquema
const User = mongoose.model("User", userSchema);

// ============================================================================
// ENDPOINTS DE LA API
// ============================================================================

// ----------------------------------------------------------------------------
// ENDPOINTS DE USUARIOS
// ----------------------------------------------------------------------------

/**
 * @route GET /api/users/placa/:placa
 * @description Verifica si una placa de vehículo ya está registrada en el sistema.
 * @param {String} placa - Placa del vehículo a verificar
 * @returns {Object} { exists: Boolean } - Indica si la placa existe
 */
app.get("/api/users/placa/:placa", async (req, res) => {
  try {
    const existing = await User.findOne({ placa: req.params.placa });
    res.json({ exists: !!existing });
  } catch (err) {
    res.status(500).json({ message: "Error al verificar placa" });
  }
});

/**
 * @route POST /api/users/register
 * @description Registra un nuevo usuario en el sistema.
 * 
 * Valida que no exista un usuario con el mismo email, hashea la contraseña
 * y crea un nuevo usuario en la base de datos.
 * 
 * @param {Object} req.body - Datos del usuario a registrar
 * @param {String} req.body.nombre - Nombre del usuario (requerido)
 * @param {String} req.body.apellido - Apellido del usuario (requerido)
 * @param {String} req.body.email - Email del usuario (requerido, único)
 * @param {String} req.body.password - Contraseña del usuario (requerido)
 * @param {String} [req.body.idUniversidad] - ID de la universidad (opcional)
 * @param {String} [req.body.telefono] - Teléfono del usuario (opcional)
 * 
 * @returns {Object} { message: String } - Mensaje de confirmación
 * @throws {400} Si faltan campos obligatorios o el email ya existe
 * @throws {500} Si hay un error en el servidor
 */
app.post("/api/users/register", async (req, res) => {
  try {
    const { nombre, apellido, idUniversidad, email, telefono, password } =
      req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Verificar si el email ya está registrado
    const existente = await User.findOne({ email });
    if (existente)
      return res.status(400).json({ message: "El correo ya está registrado" });

    // Hashear la contraseña con bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      apellido,
      idUniversidad,
      email,
      telefono,
      password: hashedPassword,
      placa: req.body.placa || "",
      cupos: req.body.cupos || 0,
      marca: req.body.marca || "",
      modelo: req.body.modelo || "",
      trips: [], // ✅ Importante inicializar trips
      reservations: [], // ✅ Importante inicializar reservations
    });

    await nuevoUsuario.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * @route POST /api/users/login
 * @description Autentica un usuario y devuelve sus datos.
 * 
 * Verifica que el email exista y que la contraseña coincida con la almacenada
 * (hasheada) en la base de datos.
 * 
 * @param {Object} req.body - Credenciales del usuario
 * @param {String} req.body.email - Email del usuario
 * @param {String} req.body.password - Contraseña del usuario (sin hashear)
 * 
 * @returns {Object} { message: String, user: Object } - Mensaje y datos del usuario
 * @throws {401} Si el email o contraseña son incorrectos
 * @throws {500} Si hay un error en el servidor
 */
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });

    // Comparar la contraseña proporcionada con la almacenada (hasheada)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });

    res.json({
      message: "Login exitoso",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * @route GET /api/users/:email
 * @description Obtiene los datos de un usuario por su email.
 * 
 * @param {String} email - Email del usuario a buscar
 * @returns {Object} user - Datos completos del usuario
 * @throws {404} Si el usuario no existe
 * @throws {500} Si hay un error en el servidor
 */
app.get("/api/users/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error en servidor" });
  }
});

/**
 * @route PUT /api/users/:email
 * @description Actualiza los datos de un usuario existente.
 * 
 * Valida que la placa no esté registrada por otro usuario si se intenta actualizar.
 * 
 * @param {String} email - Email del usuario a actualizar
 * @param {Object} req.body - Campos a actualizar (nombre, apellido, placa, etc.)
 * 
 * @returns {Object} { message: String, user: Object } - Mensaje y usuario actualizado
 * @throws {400} Si la placa ya está registrada por otro usuario
 * @throws {404} Si el usuario no existe
 * @throws {500} Si hay un error en el servidor
 */
app.put("/api/users/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // Validar que la placa no esté duplicada (si se está actualizando)
    if (req.body.placa) {
      const existingCar = await User.findOne({ placa: req.body.placa });
      if (existingCar && existingCar.email !== req.params.email) {
        return res
          .status(400)
          .json({ message: "La placa ya está registrada por otro usuario" });
      }
    }

    // Actualizar los campos del usuario
    Object.assign(user, req.body);
    await user.save();

    res.json({ message: "Usuario actualizado correctamente", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ----------------------------------------------------------------------------
// ENDPOINTS DE VIAJES (TRIPS)
// ----------------------------------------------------------------------------

/**
 * @route POST /api/trips
 * @description Crea un nuevo viaje para un conductor.
 * 
 * El viaje se agrega al array de trips del usuario conductor.
 * 
 * @param {Object} req.body - Datos del viaje
 * @param {String} req.body.userId - ID del conductor que crea el viaje
 * @param {String} req.body.departureTime - Hora de salida
 * @param {String} req.body.fromLocation - Origen del viaje
 * @param {String} req.body.toLocation - Destino del viaje
 * @param {Number} req.body.price - Precio del viaje
 * @param {String} req.body.sector - Sector/área del viaje
 * @param {Number} req.body.cupos - Número de cupos disponibles
 * 
 * @returns {Object} trip - Datos del viaje creado
 * @throws {400} Si faltan datos del viaje
 * @throws {404} Si el usuario no existe
 * @throws {500} Si hay un error en el servidor
 */
app.post("/api/trips", async (req, res) => {
  try {
    const { userId, departureTime, fromLocation, toLocation, price, sector, cupos } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!userId || !departureTime || !fromLocation || !toLocation || !price || !sector || !cupos) {
      return res.status(400).json({ message: "Faltan datos del tramo" });
    }

    // Buscar el usuario conductor
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // Crear y agregar el nuevo viaje al array de trips del usuario
    const newTrip = { departureTime, fromLocation, toLocation, price, sector, cupos };
    user.trips.push(newTrip);
    await user.save();

    // Obtener el último trip creado (el que acabamos de agregar)
    const createdTrip = user.trips[user.trips.length - 1];

    res.status(201).json({
      _id: createdTrip._id,
      departureTime: createdTrip.departureTime,
      fromLocation: createdTrip.fromLocation,
      toLocation: createdTrip.toLocation,
      price: createdTrip.price,
      sector: createdTrip.sector,
      cupos: createdTrip.cupos,
      createdAt: createdTrip.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en servidor" });
  }
});

/**
 * @route GET /api/trips
 * @description Obtiene todos los viajes de todos los usuarios (para pasajeros).
 * 
 * IMPORTANTE: Esta ruta debe estar ANTES de /api/trips/:userId para que Express la reconozca.
 * 
 * Retorna una lista de todos los viajes disponibles con información del conductor.
 * 
 * @returns {Object} { trips: Array } - Lista de todos los viajes disponibles
 * @throws {500} Si hay un error en el servidor
 */
app.get("/api/trips", async (req, res) => {
  try {
    console.log("✅ GET /api/trips - Iniciando consulta...");
    
    // Obtener todos los usuarios (luego filtramos los que tienen trips)
    const users = await User.find({});
    
    console.log(`✅ Total de usuarios encontrados: ${users.length}`);
    
    const allTrips = [];
    
    // Iterar sobre todos los usuarios y sus viajes
    users.forEach(user => {
      if (user.trips && Array.isArray(user.trips) && user.trips.length > 0) {
        user.trips.forEach(trip => {
          // Verificar que el trip tenga los campos necesarios
          if (trip.departureTime && trip.fromLocation && trip.toLocation) {
            allTrips.push({
              id: trip._id ? trip._id.toString() : `trip-${Math.random()}`,
              sector: trip.sector || "Sin sector",
              conductor: `${user.nombre || ""} ${user.apellido || ""}`.trim() || "Conductor",
              desde: trip.fromLocation || "Sin origen",
              para: trip.toLocation || "Sin destino",
              horaSalida: trip.departureTime || "Sin hora",
              valor: `$${(trip.price || 0).toLocaleString()}`,
              cupos: trip.cupos || 0,
              userId: user._id ? user._id.toString() : "",
              tripId: trip._id ? trip._id.toString() : "",
              createdAt: trip.createdAt || new Date(),
              carPhoto: user.carPhoto ? `https://proyecto5-vs2l.onrender.com${user.carPhoto}` : "", // URL completa de la foto del carro
            });
          }
        });
      }
    });

    console.log(`✅ Total de trips encontrados: ${allTrips.length}`);
    res.json({ trips: allTrips });
  } catch (err) {
    console.error("❌ Error en GET /api/trips:", err);
    res.status(500).json({ 
      message: "Error en servidor", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

/**
 * @route DELETE /api/trips/:tripId
 * @description Elimina un viaje y todas sus reservas asociadas.
 * 
 * IMPORTANTE: Esta ruta DEBE estar antes de GET /api/trips/:userId para que Express la reconozca.
 * 
 * Cuando se elimina un viaje:
 * 1. Se eliminan todas las reservas relacionadas con ese viaje de todos los usuarios
 * 2. Se elimina el viaje del array de trips del conductor
 * 
 * @param {String} tripId - ID del viaje a eliminar
 * @param {String} req.body.userId - ID del conductor (para verificar permisos)
 * 
 * @returns {Object} { message: String, tripId: String, deletedReservationsCount: Number }
 * @throws {400} Si faltan parámetros o el ID es inválido
 * @throws {403} Si el usuario no es el dueño del viaje
 * @throws {404} Si el viaje no existe
 * @throws {500} Si hay un error en el servidor
 */
app.delete("/api/trips/:tripId", async (req, res) => {
  try {
    console.log("🗑️ DELETE /api/trips/:tripId - Iniciando eliminación...");
    const { tripId } = req.params;
    const { userId } = req.body;
    
    console.log("📋 Parámetros recibidos:", { tripId, userId });

    // Validar parámetros
    if (!tripId) {
      console.error("❌ Falta el ID del viaje");
      return res.status(400).json({ message: "Falta el ID del viaje" });
    }

    if (!userId) {
      console.error("❌ Falta el ID del usuario");
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    // Convertir tripId a ObjectId
    let tripObjectId;
    if (mongoose.Types.ObjectId.isValid(tripId)) {
      tripObjectId = new mongoose.Types.ObjectId(tripId);
    } else {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    // Buscar el usuario conductor que tiene el trip
    const driver = await User.findOne({ "trips._id": tripObjectId });
    if (!driver) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    // Verificar que el usuario sea el dueño del viaje
    if (driver._id.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este viaje" });
    }

    // Encontrar el trip específico
    const trip = driver.trips.id(tripObjectId);
    if (!trip) {
      return res.status(404).json({ message: "Viaje no encontrado en el conductor" });
    }

    // Eliminar todas las reservas relacionadas con este trip de todos los usuarios
    const allUsers = await User.find({});
    let deletedReservationsCount = 0;

    for (const user of allUsers) {
      if (user.reservations && Array.isArray(user.reservations)) {
        const reservationsToDelete = user.reservations.filter(
          (reservation) => reservation.tripId && reservation.tripId.toString() === tripObjectId.toString()
        );
        
        if (reservationsToDelete.length > 0) {
          reservationsToDelete.forEach((reservation) => {
            user.reservations.pull(reservation._id);
            deletedReservationsCount++;
          });
          await user.save();
        }
      }
    }

    // Eliminar el trip del conductor
    driver.trips.pull(tripObjectId);
    await driver.save();

    res.status(200).json({
      message: "Viaje eliminado exitosamente",
      tripId: tripId,
      deletedReservationsCount: deletedReservationsCount,
    });
  } catch (err) {
    console.error("❌ Error en DELETE /api/trips/:tripId:", err);
    res.status(500).json({
      message: "Error en servidor",
      error: err.message,
    });
  }
});

/**
 * @route GET /api/trips/:userId
 * @description Obtiene todos los viajes de un usuario específico (conductor).
 * 
 * @param {String} userId - ID del usuario conductor
 * @returns {Object} { trips: Array } - Lista de viajes del conductor
 * @throws {404} Si el usuario no existe
 * @throws {500} Si hay un error en el servidor
 */
app.get("/api/trips/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ trips: user.trips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en servidor" });
  }
});

// ----------------------------------------------------------------------------
// ENDPOINTS DE RESERVAS
// ----------------------------------------------------------------------------

/**
 * @route GET /api/users/:userId/reservations
 * @description Obtiene todas las reservas de un usuario con información completa del viaje.
 * 
 * Para cada reserva, busca el conductor y el viaje asociado para incluir
 * información detallada (origen, destino, precio, etc.).
 * 
 * @param {String} userId - ID del usuario pasajero
 * @returns {Object} { reservations: Array } - Lista de reservas con detalles completos
 * @throws {400} Si falta el ID del usuario
 * @throws {404} Si el usuario no existe
 * @throws {500} Si hay un error en el servidor
 */
app.get("/api/users/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    // Buscar el usuario pasajero
    const passenger = await User.findById(userId);
    if (!passenger) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener todas las reservas con información completa del viaje
    const reservationsWithDetails = await Promise.all(
      passenger.reservations.map(async (reservation) => {
        try {
          // Buscar el conductor que tiene el trip
          const driver = await User.findById(reservation.driverUserId);
          if (!driver) {
            return {
              ...reservation.toObject(),
              tripDetails: null,
              driverName: "Conductor no encontrado",
            };
          }

          // Buscar el trip específico
          const trip = driver.trips.id(reservation.tripId);
          if (!trip) {
            return {
              ...reservation.toObject(),
              tripDetails: null,
              driverName: `${driver.nombre || ""} ${driver.apellido || ""}`.trim() || "Conductor",
            };
          }

          return {
            _id: reservation._id,
            tripId: reservation.tripId,
            driverUserId: reservation.driverUserId,
            pickupAddress: reservation.pickupAddress,
            status: reservation.status,
            createdAt: reservation.createdAt,
            tripDetails: {
              desde: trip.fromLocation,
              para: trip.toLocation,
              horaSalida: trip.departureTime,
              valor: trip.price,
              sector: trip.sector,
            },
            driverName: `${driver.nombre || ""} ${driver.apellido || ""}`.trim() || "Conductor",
          };
        } catch (error) {
          console.error(`Error obteniendo detalles de reserva ${reservation._id}:`, error);
          return {
            ...reservation.toObject(),
            tripDetails: null,
            driverName: "Error al cargar",
          };
        }
      })
    );

    res.status(200).json({
      reservations: reservationsWithDetails,
    });
  } catch (err) {
    console.error("❌ Error en GET /api/users/:userId/reservations:", err);
    res.status(500).json({
      message: "Error en servidor",
      error: err.message,
    });
  }
});

/**
 * @route POST /api/trips/:tripId/reserve
 * @description Crea una reserva para un viaje específico.
 * 
 * Cuando se crea una reserva:
 * 1. Se resta el número de cupos reservados del viaje
 * 2. Se crea una nueva reserva en el array de reservations del pasajero
 * 3. Se valida que haya suficientes cupos disponibles
 * 
 * @param {String} tripId - ID del viaje a reservar
 * @param {Object} req.body - Datos de la reserva
 * @param {String} req.body.userId - ID del pasajero
 * @param {Number} req.body.numberOfSeats - Número de cupos a reservar (default: 1)
 * @param {Array<String>} [req.body.pickupAddresses] - Array de direcciones de recogida (una por cupo)
 * @param {String} [req.body.pickupAddress] - Dirección de recogida (compatibilidad con versiones antiguas)
 * 
 * @returns {Object} { message: String, cuposActualizados: Number, reservation: Object }
 * @throws {400} Si faltan parámetros, no hay cupos suficientes o falta la dirección
 * @throws {404} Si el viaje o el pasajero no existen
 * @throws {500} Si hay un error en el servidor
 */
app.post("/api/trips/:tripId/reserve", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { userId, numberOfSeats, pickupAddresses, pickupAddress } = req.body || {};

    // Validar parámetros
    if (!tripId) {
      return res.status(400).json({ message: "Falta el ID del trip" });
    }

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del pasajero" });
    }

    // Validar numberOfSeats
    const seatsToReserve = numberOfSeats || 1;
    if (seatsToReserve < 1) {
      return res.status(400).json({ message: "Debes reservar al menos 1 cupo" });
    }

    // Convertir tripId a ObjectId
    let tripObjectId;
    if (mongoose.Types.ObjectId.isValid(tripId)) {
      tripObjectId = new mongoose.Types.ObjectId(tripId);
    } else {
      return res.status(400).json({ message: "ID de trip inválido" });
    }

    // Buscar el usuario conductor que tiene el trip
    const driver = await User.findOne({ "trips._id": tripObjectId });
    if (!driver) {
      return res.status(404).json({ message: "Trip no encontrado" });
    }

    // Encontrar el trip específico
    const trip = driver.trips.id(tripObjectId);
    if (!trip) {
      return res.status(404).json({ message: "Trip no encontrado en el conductor" });
    }

    // Verificar que haya cupos disponibles suficientes
    if (trip.cupos < seatsToReserve) {
      return res.status(400).json({ 
        message: `No hay suficientes cupos disponibles. Disponibles: ${trip.cupos}, Solicitados: ${seatsToReserve}` 
      });
    }

    // Preparar array de direcciones de recogida
    let addressesArray = [];
    if (pickupAddresses && Array.isArray(pickupAddresses) && pickupAddresses.length > 0) {
      // Si se envía un array de direcciones, usarlo
      addressesArray = pickupAddresses.slice(0, seatsToReserve); // Limitar al número de cupos
      // Si faltan direcciones, rellenar con la última dirección
      while (addressesArray.length < seatsToReserve) {
        addressesArray.push(addressesArray[addressesArray.length - 1] || "");
      }
    } else if (pickupAddress) {
      // Compatibilidad con reservas antiguas: usar pickupAddress para todos los cupos
      addressesArray = Array(seatsToReserve).fill(pickupAddress);
    } else {
      return res.status(400).json({ message: "Debes proporcionar al menos una dirección de recogida" });
    }

    // Restar los cupos reservados del viaje
    trip.cupos = trip.cupos - seatsToReserve;
    await driver.save();

    // Guardar la reserva en el pasajero
    const passenger = await User.findById(userId);
    if (!passenger) {
      return res.status(404).json({ message: "Usuario pasajero no encontrado" });
    }

    const reservation = {
      tripId: tripObjectId,
      driverUserId: driver._id,
      numberOfSeats: seatsToReserve,
      pickupAddresses: addressesArray,
      pickupAddress: addressesArray[0] || "", // Mantener para compatibilidad
      status: "Pendiente",
    };

    passenger.reservations.push(reservation);
    await passenger.save();

    res.status(200).json({
      message: `${seatsToReserve} cupo(s) reservado(s) exitosamente`,
      cuposActualizados: trip.cupos,
      reservation: passenger.reservations[passenger.reservations.length - 1],
    });
  } catch (err) {
    console.error("❌ Error en POST /api/trips/:tripId/reserve:", err);
    res.status(500).json({ 
      message: "Error en servidor", 
      error: err.message 
    });
  }
});

/**
 * @route DELETE /api/reservations/:reservationId
 * @description Elimina una reserva y devuelve los cupos al viaje.
 * 
 * IMPORTANTE: Siempre devuelve los cupos al viaje, independientemente del estado
 * de la reserva (Pendiente, Aceptada o Rechazada). Esto es porque los cupos fueron
 * restados cuando se creó la reserva.
 * 
 * @param {String} reservationId - ID de la reserva a eliminar
 * @param {String} req.body.userId - ID del pasajero que tiene la reserva
 * 
 * @returns {Object} { message: String, reservationId: String, cuposDevueltos: Number, cuposAnteriores: Number, cuposActuales: Number }
 * @throws {400} Si faltan parámetros o los IDs son inválidos
 * @throws {404} Si la reserva, el pasajero, el conductor o el viaje no existen
 * @throws {500} Si hay un error en el servidor
 */
app.delete("/api/reservations/:reservationId", async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { userId } = req.body || req.query;

    // Validar parámetros
    if (!reservationId) {
      return res.status(400).json({ message: "Falta el ID de la reserva" });
    }

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    // Convertir reservationId a ObjectId
    let reservationObjectId;
    if (mongoose.Types.ObjectId.isValid(reservationId)) {
      reservationObjectId = new mongoose.Types.ObjectId(reservationId);
    } else {
      return res.status(400).json({ message: "ID de reserva inválido" });
    }

    // Buscar el usuario pasajero
    const passenger = await User.findById(userId);
    if (!passenger) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Buscar la reserva
    const reservation = passenger.reservations.id(reservationObjectId);
    if (!reservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // Guardar información antes de eliminar
    const tripId = reservation.tripId;
    const driverUserId = reservation.driverUserId;
    const numberOfSeats = reservation.numberOfSeats || 1; // Por defecto 1 para compatibilidad
    const reservationStatus = reservation.status;

    console.log(`🗑️ Eliminando reserva ${reservationId}:`);
    console.log(`   - Estado: ${reservationStatus}`);
    console.log(`   - Cupos a devolver: ${numberOfSeats}`);
    console.log(`   - TripId: ${tripId}`);
    console.log(`   - DriverId: ${driverUserId}`);

    // Eliminar la reserva del pasajero
    passenger.reservations.pull(reservationObjectId);
    await passenger.save();

    // Buscar el conductor y devolver los cupos al viaje
    // IMPORTANTE: Siempre devolvemos los cupos, independientemente del estado
    // porque los cupos fueron restados cuando se creó la reserva
    const driver = await User.findById(driverUserId);
    if (!driver) {
      console.error(`❌ Conductor no encontrado: ${driverUserId}`);
      return res.status(404).json({ message: "Conductor no encontrado" });
    }

    // Convertir tripId a ObjectId si es necesario
    let tripObjectId;
    if (tripId instanceof mongoose.Types.ObjectId) {
      tripObjectId = tripId;
    } else if (mongoose.Types.ObjectId.isValid(tripId)) {
      tripObjectId = new mongoose.Types.ObjectId(tripId);
    } else {
      console.error(`❌ TripId inválido: ${tripId}`);
      return res.status(400).json({ message: "ID de trip inválido" });
    }

    // Buscar el trip en el conductor
    const trip = driver.trips.id(tripObjectId);
    if (!trip) {
      console.error(`❌ Trip no encontrado en el conductor: ${tripObjectId}`);
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    // Guardar los cupos antes de aumentar
    const cuposAntes = trip.cupos;
    
    // Aumentar los cupos según el número de cupos reservados
    trip.cupos = trip.cupos + numberOfSeats;
    await driver.save();

    console.log(`✅ Cupos devueltos: ${cuposAntes} → ${trip.cupos} (+${numberOfSeats})`);

    const message = reservationStatus === "Rechazada" 
      ? "Reserva borrada exitosamente. Los cupos han sido devueltos al viaje."
      : "Reserva cancelada exitosamente. Los cupos han sido devueltos al viaje.";

    res.status(200).json({
      message: message,
      reservationId: reservationId,
      cuposDevueltos: numberOfSeats,
      cuposAnteriores: cuposAntes,
      cuposActuales: trip.cupos,
    });
  } catch (err) {
    console.error("❌ Error en DELETE /api/reservations/:reservationId:", err);
    res.status(500).json({ 
      message: "Error en servidor", 
      error: err.message 
    });
  }
});

/**
 * @route GET /api/drivers/:driverId/pending-requests
 * @description Obtiene todas las solicitudes pendientes de un conductor.
 * 
 * Busca en todos los usuarios las reservas que:
 * - Tengan como driverUserId el ID del conductor
 * - Tengan status "Pendiente"
 * 
 * Para cada solicitud pendiente, incluye información del pasajero y del viaje.
 * 
 * @param {String} driverId - ID del conductor
 * @returns {Object} { requests: Array } - Lista de solicitudes pendientes
 * @throws {400} Si falta el ID del conductor o es inválido
 * @throws {500} Si hay un error en el servidor
 */
app.get("/api/drivers/:driverId/pending-requests", async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!driverId) {
      return res.status(400).json({ message: "Falta el ID del conductor" });
    }

    // Convertir driverId a ObjectId
    let driverObjectId;
    if (mongoose.Types.ObjectId.isValid(driverId)) {
      driverObjectId = new mongoose.Types.ObjectId(driverId);
    } else {
      return res.status(400).json({ message: "ID de conductor inválido" });
    }

    // Buscar todos los usuarios que tengan reservas con este driverUserId y status "Pendiente"
    const allUsers = await User.find({});
    const pendingRequests = [];

    for (const user of allUsers) {
      if (user.reservations && Array.isArray(user.reservations)) {
        for (const reservation of user.reservations) {
          // Verificar si la reserva es para este conductor y está pendiente
          if (
            reservation.driverUserId &&
            reservation.driverUserId.toString() === driverObjectId.toString() &&
            reservation.status === "Pendiente"
          ) {
            // Buscar el conductor para obtener los detalles del trip
            const driver = await User.findById(driverObjectId);
            if (!driver) continue;

            // Buscar el trip específico
            const trip = driver.trips.id(reservation.tripId);
            if (!trip) continue;

            // Construir el objeto de solicitud pendiente
            pendingRequests.push({
              _id: reservation._id,
              tripId: reservation.tripId,
              driverUserId: reservation.driverUserId,
              passengerId: user._id,
              passengerName: `${user.nombre || ""} ${user.apellido || ""}`.trim() || "Pasajero",
              passengerEmail: user.email || "",
              numberOfSeats: reservation.numberOfSeats || 1,
              pickupAddress: reservation.pickupAddress || reservation.pickupAddresses?.[0] || "No especificada",
              pickupAddresses: reservation.pickupAddresses || [],
              status: reservation.status,
              createdAt: reservation.createdAt,
              tripDetails: {
                desde: trip.fromLocation,
                para: trip.toLocation,
                horaSalida: trip.departureTime,
                valor: trip.price,
                sector: trip.sector,
              },
            });
          }
        }
      }
    }

    res.status(200).json({
      requests: pendingRequests,
    });
  } catch (err) {
    console.error("❌ Error en GET /api/drivers/:driverId/pending-requests:", err);
    res.status(500).json({
      message: "Error en servidor",
      error: err.message,
    });
  }
});

/**
 * @route PUT /api/reservations/:reservationId/status
 * @description Actualiza el estado de una reserva (Aceptada, Rechazada o Pendiente).
 * 
 * IMPORTANTE: Cuando se rechaza una reserva, NO se devuelven los cupos automáticamente.
 * Los cupos solo se devuelven cuando el pasajero borra manualmente la reserva rechazada.
 * Esto evita que se reinicien los cupos sin que el pasajero lo sepa.
 * 
 * @param {String} reservationId - ID de la reserva a actualizar
 * @param {Object} req.body - Datos de la actualización
 * @param {String} req.body.status - Nuevo estado: "Aceptada", "Rechazada" o "Pendiente"
 * @param {String} req.body.driverId - ID del conductor (para verificar permisos)
 * 
 * @returns {Object} { message: String, reservation: Object }
 * @throws {400} Si faltan parámetros, el estado es inválido o el ID es inválido
 * @throws {403} Si el conductor no tiene permiso para modificar la reserva
 * @throws {404} Si la reserva no existe
 * @throws {500} Si hay un error en el servidor
 */
app.put("/api/reservations/:reservationId/status", async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status, driverId } = req.body;

    // Validar parámetros
    if (!reservationId) {
      return res.status(400).json({ message: "Falta el ID de la reserva" });
    }

    if (!status) {
      return res.status(400).json({ message: "Falta el estado" });
    }

    if (!driverId) {
      return res.status(400).json({ message: "Falta el ID del conductor" });
    }

    // Validar que el estado sea válido
    const validStatuses = ["Aceptada", "Rechazada", "Pendiente"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    // Convertir reservationId a ObjectId
    let reservationObjectId;
    if (mongoose.Types.ObjectId.isValid(reservationId)) {
      reservationObjectId = new mongoose.Types.ObjectId(reservationId);
    } else {
      return res.status(400).json({ message: "ID de reserva inválido" });
    }

    // Buscar el usuario pasajero que tiene esta reserva
    const allUsers = await User.find({});
    let passenger = null;
    let reservation = null;

    for (const user of allUsers) {
      if (user.reservations && Array.isArray(user.reservations)) {
        const foundReservation = user.reservations.id(reservationObjectId);
        if (foundReservation) {
          passenger = user;
          reservation = foundReservation;
          break;
        }
      }
    }

    if (!passenger || !reservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // Verificar que el conductor sea el correcto
    if (reservation.driverUserId.toString() !== driverId) {
      return res.status(403).json({ message: "No tienes permiso para modificar esta reserva" });
    }

    // IMPORTANTE: Cuando se rechaza, NO devolvemos los cupos automáticamente
    // El pasajero debe borrar la reserva manualmente para que se devuelvan los cupos
    // Esto evita que se reinicien los cupos sin que el pasajero lo sepa

    // Si se acepta una reserva que estaba rechazada, no hacer nada con los cupos
    // porque cuando se rechazó, los cupos NO fueron devueltos (siguen restados)
    // Los cupos solo se devuelven cuando el pasajero borra la reserva rechazada

    // Si se acepta una reserva que estaba pendiente, no hacer nada con los cupos
    // porque ya fueron restados cuando se creó la reserva

    // Actualizar el estado de la reserva
    reservation.status = status;
    await passenger.save();

    res.status(200).json({
      message: `Solicitud ${status.toLowerCase()} exitosamente`,
      reservation: {
        _id: reservation._id,
        status: reservation.status,
      },
    });
  } catch (err) {
    console.error("❌ Error en PUT /api/reservations/:reservationId/status:", err);
    res.status(500).json({
      message: "Error en servidor",
      error: err.message,
    });
  }
});

// ============================================================================
// RUTA RAÍZ Y SERVIDOR
// ============================================================================

/**
 * @route GET /
 * @description Ruta raíz del servidor para verificar que está funcionando.
 * 
 * @returns {String} Mensaje de confirmación
 */
app.get("/", (req, res) => {
  res.send("✅ Backend funcionando 🚀");
});

/**
 * Inicia el servidor Express en el puerto especificado.
 * 
 * @listens {Number} PORT - Puerto en el que se ejecuta el servidor (default: 5000)
 */
app.listen(PORT, () =>
  console.log(`✅ Servidor backend corriendo en puerto ${PORT}`)
);
