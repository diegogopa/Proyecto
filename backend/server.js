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

// ✅ Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ Backend funcionando 🚀");
});

// ✅ Servidor activo
app.listen(PORT, () =>
  console.log(`✅ Servidor backend corriendo en puerto ${PORT}`)
);
