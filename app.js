import "dotenv/config";
import express from "express";
import path from "path";
import session from "express-session";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

import conectarDB from "./src/config/db.js";
import Usuario from "./src/models/Usuario.js";

import inicioRoutes from "./src/routes/inicio.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import eventoRoutes from "./src/routes/eventos.routes.js";
import clienteRoutes from "./src/routes/clientes.routes.js";
import salasRoutes from "./src/routes/salas.routes.js";
import entradasRoutes from "./src/routes/entradas.routes.js";

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
      password: "admin123",
      rol: "admin",
    },
    {
      email: "visitante@urbanacult.com",
      password: "visitante123",
      rol: "visitante",
    },
  ];

  for (const usuario of usuariosIniciales) {
    const existe = await Usuario.findOne({
      email: usuario.email,
    });

    if (!existe) {
      const passwordHash = await bcrypt.hash(
        usuario.password,
        10
      );

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

app.use(
  session({
    secret: "mi-clave-secreta",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutos
    },
  })
);

// Variables disponibles en las vistas Pug
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.usuario = req.session.usuario || null;
  next();
});

// Portada pública con carrusel de eventos activos
app.use("/", inicioRoutes);

// Login y cierre de sesión
app.use("/", authRoutes);

// Verificación de rol: acepta uno o varios roles
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({
        mensaje: "No estás logueado",
      });
    }

    if (!rolesPermitidos.includes(req.session.usuario.rol)) {
      return res.status(403).json({
        mensaje: "No tenés permisos",
      });
    }

    next();
  };
};

// Eventos: consultas para admin y visitante.
// Crear, editar y borrar solo para admin.
app.use(
  "/eventos",
  (req, res, next) => {
    const soloLectura =
      req.method === "GET" && req.path !== "/nuevo";

    return verificarRol(
      ...(soloLectura ? ["admin", "visitante"] : ["admin"])
    )(req, res, next);
  },
  eventoRoutes
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
  clienteRoutes
);

// Salas: el visitante puede consultar la lista JSON.
// Las demás operaciones requieren admin.
app.use(
  "/salas",
  (req, res, next) => {
    const listaParaVisitante =
      req.method === "GET" && req.path === "/";

    return verificarRol(
      ...(listaParaVisitante
        ? ["admin", "visitante"]
        : ["admin"])
    )(req, res, next);
  },
  salasRoutes
);

// Entradas: acceso actual para visitante y admin
app.use(
  "/entradas",
  verificarRol("visitante", "admin"),
  entradasRoutes
);

// Manejador 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada",
  });
});

console.log(
  "Archivo ejecutado:",
  fileURLToPath(import.meta.url)
);

// Iniciar el servidor después de conectar a MongoDB
const iniciarServidor = async () => {
  try {
    await conectarDB();
    await cargarUsuariosIniciales();

    const servidor = app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });

    servidor.on("error", (error) => {
      console.error(
        "Error al escuchar en el puerto:",
        error.message
      );
      process.exit(1);
    });
  } catch (error) {
    console.error(
      "Error al iniciar la aplicación:",
      error.message
    );
    process.exit(1);
  }
};

iniciarServidor();