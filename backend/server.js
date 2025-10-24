// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------
// ✅ 1. Configuración CORS
// ----------------------------------------------------
const allowedOrigins = [
  "https://proyecto9-c03h.onrender.com", // frontend desplegado
  "http://localhost:5173" // desarrollo local
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

// ----------------------------------------------------
// ✅ 2. Conexión a MongoDB Atlas
// ----------------------------------------------------
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error al conectar con MongoDB:", err));

// ----------------------------------------------------
// ✅ 3. Esquema y modelo de usuarios
// ----------------------------------------------------
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  idUniversidad: String,
  email: { type: String, required: true, unique: true },
  telefono: String,
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ----------------------------------------------------
// ✅ 4. Rutas de usuarios
// ----------------------------------------------------

// Registro
app.post("/api/users/register", async (req, res) => {
  try {
    const { nombre, apellido, idUniversidad, email, telefono, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const userExistente = await User.findOne({ email });
    if (userExistente) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const nuevoUsuario = new User({
      nombre,
      apellido,
      idUniversidad,
      email,
      telefono,
      password,
    });

    await nuevoUsuario.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Login
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Faltan campos" });

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    res.status(200).json({
      message: "Login exitoso",
      user: {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        idUniversidad: user.idUniversidad,
        telefono: user.telefono,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Obtener usuario
app.get("/api/users/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Editar usuario
app.put("/api/users/:email", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario actualizado correctamente", user });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Raíz
app.get("/", (req, res) => {
  res.send("✅ Backend funcionando correctamente 🚀");
});

// ----------------------------------------------------
// ✅ 5. Servidor
// ----------------------------------------------------
app.listen(PORT, () =>
  console.log(`✅ Servidor backend corriendo en puerto ${PORT}`)
);
