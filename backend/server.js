// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Configuración CORS
const allowedOrigins = [
  "https://proyecto9-c03h.onrender.com",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("No permitido por CORS"));
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Conexión MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error al conectar MongoDB:", err));

// ✅ Schema: Usuario + Carro + Trips
const userSchema = new mongoose.Schema(
  {
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

    // ✅ Lista de trips del conductor
    trips: [
      {
        departureTime: { type: String, required: true },
        fromLocation: { type: String, required: true },
        toLocation: { type: String, required: true },
        price: { type: Number, required: true },
        sector: { type: String, required: true },
        cupos: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ✅ Lista de reservas del pasajero
    reservations: [
      {
        tripId: { type: mongoose.Schema.Types.ObjectId, required: true },
        driverUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
        numberOfSeats: { type: Number, required: true, default: 1 },
        pickupAddresses: [{ type: String, required: true }], // Array de direcciones, una por cada cupo
        status: { type: String, default: "Pendiente" },
        createdAt: { type: Date, default: Date.now },
        // Mantener pickupAddress para compatibilidad con reservas antiguas
        pickupAddress: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// ✅ Validación de placa
app.get("/api/users/placa/:placa", async (req, res) => {
  try {
    const existing = await User.findOne({ placa: req.params.placa });
    res.json({ exists: !!existing });
  } catch (err) {
    res.status(500).json({ message: "Error al verificar placa" });
  }
});

// ✅ Registro
app.post("/api/users/register", async (req, res) => {
  try {
    const { nombre, apellido, idUniversidad, email, telefono, password } =
      req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const existente = await User.findOne({ email });
    if (existente)
      return res.status(400).json({ message: "El correo ya está registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

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

// ✅ Login
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });

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

// ✅ Obtener usuario por email
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

// ✅ Editar usuario + Validación de placa duplicada
app.put("/api/users/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (req.body.placa) {
      const existingCar = await User.findOne({ placa: req.body.placa });
      if (existingCar && existingCar.email !== req.params.email) {
        return res
          .status(400)
          .json({ message: "La placa ya está registrada por otro usuario" });
      }
    }

    Object.assign(user, req.body);
    await user.save();

    res.json({ message: "Usuario actualizado correctamente", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ✅ Crear un trip
app.post("/api/trips", async (req, res) => {
  try {
    const { userId, departureTime, fromLocation, toLocation, price, sector, cupos } = req.body;

    if (!userId || !departureTime || !fromLocation || !toLocation || !price || !sector || !cupos) {
      return res.status(400).json({ message: "Faltan datos del tramo" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

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

// ✅ Obtener todos los trips de todos los usuarios (para pasajeros)
// IMPORTANTE: Esta ruta debe estar ANTES de /api/trips/:userId para que Express la reconozca
app.get("/api/trips", async (req, res) => {
  try {
    console.log("✅ GET /api/trips - Iniciando consulta...");
    
    // Obtener todos los usuarios (luego filtramos los que tienen trips)
    const users = await User.find({});
    
    console.log(`✅ Total de usuarios encontrados: ${users.length}`);
    
    const allTrips = [];
    
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

// ✅ Obtener todos los trips de un usuario específico
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

// ✅ Obtener reservas de un usuario con información completa del viaje
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

// ✅ Restar cupos de un trip cuando se reserva
app.post("/api/trips/:tripId/reserve", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { userId, numberOfSeats, pickupAddresses, pickupAddress } = req.body || {};

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

    // Restar los cupos reservados
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

// ✅ Cancelar una reserva (eliminar reserva y aumentar cupos)
app.delete("/api/reservations/:reservationId", async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { userId } = req.body || req.query;

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

    // Guardar el tripId, driverUserId, numberOfSeats y status antes de eliminar
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

    // Buscar el conductor y aumentar los cupos del viaje
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

// ✅ Obtener solicitudes pendientes de un conductor
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

// ✅ Actualizar el estado de una reserva (aceptar o rechazar)
app.put("/api/reservations/:reservationId/status", async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status, driverId } = req.body;

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

// ✅ Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ Backend funcionando 🚀");
});

// ✅ Servidor activo
app.listen(PORT, () =>
  console.log(`✅ Servidor backend corriendo en puerto ${PORT}`)
);
