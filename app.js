import "dotenv/config";
import express from "express";
import path from "path";
import {
  autenticarJWT,
  verificarRol,
} from "./src/middlewares/auth.middleware.js";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import http from "http";
import { iniciarSockets } from "./src/sockets/index.js";

import conectarDB from "./src/config/db.js";
import Usuario from "./src/models/Usuario.js";

import inicioRoutes from "./src/routes/inicio.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import eventoRoutes from "./src/routes/eventos.routes.js";
import clienteRoutes from "./src/routes/clientes.routes.js";
import salasRoutes from "./src/routes/salas.routes.js";
import entradasRoutes from "./src/routes/entradas.routes.js";
import reservasRoutes from "./src/routes/reservas.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Vistas Pug y archivos públicos
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src", "views"));
app.use(express.static(path.join(__dirname, "public")));

// Usuarios iniciales de prueba
const cargarUsuariosIniciales = async () => {
  const usuariosIniciales = [
    {
      email: "admin@urbanacult.com",
      password: process.env.ADMIN_PASSWORD,
      rol: "admin",
    },
    {
      email: "visitante@urbanacult.com",
      password: process.env.VISITANTE_PASSWORD,
      rol: "visitante",
    },
  ];

  for (const usuario of usuariosIniciales) {
    const existe = await Usuario.findOne({
      email: usuario.email,
    });

    if (!existe && usuario.password) {
      const passwordHash = await bcrypt.hash(usuario.password, 10);

      await Usuario.create({
        email: usuario.email,
        passwordHash,
        rol: usuario.rol,
      });
    }
  }
};

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(autenticarJWT);

// Portada pública con carrusel de eventos activos
app.use("/", inicioRoutes);

// Login y cierre de sesión
app.use("/", authRoutes);

// Eventos: consultas para admin y visitante.
// Crear, editar y borrar solo para admin.
app.use(
  "/eventos",
  (req, res, next) => {
    const soloLectura = req.method === "GET" && req.path !== "/nuevo";

    return verificarRol(...(soloLectura ? ["admin", "visitante"] : ["admin"]))(
      req,
      res,
      next,
    );
  },
  eventoRoutes,
);

// Clientes: registro público.
// Las demás operaciones requieren admin.
app.use(
  "/clientes",
  (req, res, next) => {
    const registroPublico =
      (req.method === "GET" && req.path === "/nuevo") ||
      (req.method === "POST" && req.path === "/");

    if (registroPublico) {
      return next();
    }

    return verificarRol("admin")(req, res, next);
  },
  clienteRoutes,
);

// Salas: el visitante puede consultar la lista JSON.
// Las demás operaciones requieren admin.
app.use(
  "/salas",
  (req, res, next) => {
    const listaParaVisitante = req.method === "GET" && req.path === "/";

    return verificarRol(
      ...(listaParaVisitante ? ["admin", "visitante"] : ["admin"]),
    )(req, res, next);
  },
  salasRoutes,
);

// Entradas: acceso actual para visitante y admin
app.use("/entradas", verificarRol("visitante", "admin"), entradasRoutes);
app.use("/reservas", verificarRol("admin"), reservasRoutes);

// Manejador 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada",
  });
});

console.log("Archivo ejecutado:", fileURLToPath(import.meta.url));

// Iniciar el servidor después de conectar a MongoDB
const iniciarServidor = async () => {
  try {
    await conectarDB();
    await cargarUsuariosIniciales();

    const servidor = http.createServer(app);
    iniciarSockets(servidor);

    servidor.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });

    servidor.on("error", (error) => {
      console.error("Error al escuchar en el puerto:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Error al iniciar la aplicación:", error.message);
    process.exit(1);
  }
};

iniciarServidor();
