import "dotenv/config";
import express from "express";
import path from "path";
import session from "express-session";
import conectarDB from "./src/config/db.js"; // Importar la función de conexión a la base de datos
import bcrypt from "bcryptjs";
import Usuario from "./src/models/Usuario.js";
import authRoutes from "./src/routes/auth.routes.js";
import eventoRoutes from "./src/routes/eventos.routes.js";
import clienteRoutes from "./src/routes/clientes.routes.js";
import salasRoutes from "./src/routes/salas.routes.js";
import entradasRoutes from "./src/routes/entradas.routes.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src", "views"));
app.use(express.static(path.join(__dirname, "public")));

const cargarUsuariosIniciales = async () => {
  const usuariosIniciales = [
    {
      email: "admin@urbanacult.com",
      password: "admin123",
      rol: "admin"
    },
    {
      email: "visitante@urbanacult.com",
      password: "visitante123",
      rol: "visitante"
    }
  ];

  for (const usuario of usuariosIniciales) {
    const existe = await Usuario.findOne({ email: usuario.email });

    if (!existe) {
      const passwordHash = await bcrypt.hash(usuario.password, 10);

      await Usuario.create({
        email: usuario.email,
        passwordHash,
        rol: usuario.rol
      });
    }
  }
};
const PORT = process.env.PORT || 3000


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "mi-clave-secreta",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000 // 30 minutos
  }
}));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.usuario = req.session.usuario || null;
  next();
});



app.get("/", (req, res) => {
  res.render("inicio", {
    usuario: req.session.usuario || null
  });
});

app.use(authRoutes);


// verificación de rol (acepta uno o varios roles)
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ mensaje: "No estás logueado" });
    }

    if (!rolesPermitidos.includes(req.session.usuario.rol)) {
      return res.status(403).json({ mensaje: "No tenés permisos" });
    }

    next();
  };
};

// Rutas

// Eventos: el visitante solo puede ver la lista; crear, editar y borrar es del admin
app.use(
  "/eventos",
  (req, res, next) => {
    const soloLectura = req.method === "GET" && req.path !== "/nuevo";
    verificarRol(...(soloLectura ? ["admin", "visitante"] : ["admin"]))(req, res, next);
  },
  eventoRoutes
);

app.use("/clientes", verificarRol("admin"), clienteRoutes);

// Salas: el visitante solo puede pedir la lista (para mostrar los nombres en eventos)
app.use(
  "/salas",
  (req, res, next) => {
    const listaParaVisitante = req.method === "GET" && req.path === "/";
    verificarRol(...(listaParaVisitante ? ["admin", "visitante"] : ["admin"]))(req, res, next);
  },
  salasRoutes
);
app.use("/entradas", verificarRol("visitante"), entradasRoutes);


// Manejador 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada"
  });
});

console.log("Archivo ejecutado:", fileURLToPath(import.meta.url));

// Función para iniciar el servidor después de conectar a la base de datos
const iniciarServidor = async () => {
  await conectarDB();
  await cargarUsuariosIniciales();

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
};

iniciarServidor();
