import "dotenv/config";
import express from "express";
import path from "path";
import session from "express-session";
import conectarDB from "./src/config/db.js"; // Importar la función de conexión a la base de datos

import eventoRoutes from "./src/routes/eventos.routes.js";
import clienteRoutes from "./src/routes/clientes.routes.js";
import salasRoutes from "./src/routes/salas.routes.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const usuarios = [
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


app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src", "views"));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "mi-clave-secreta",
  resave: false,
  saveUninitialized: true
}));
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});


app.get("/", (req, res) => {
  res.render("inicio");
});

// Rutas

app.get("/login", (req, res) => {
  res.render("login");
});
//validación de login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const usuario = usuarios.find(
    u => u.email === email && u.password === password
  );

  if (!usuario) {
    return res.status(401).json({ mensaje: "Credenciales inválidas" });
  }

  req.session.usuario = {
    email: usuario.email,
    rol: usuario.rol
  };

  if (usuario.rol === "admin") {
    return res.redirect("/clientes/vista");
  }

  if (usuario.rol === "visitante") {
    return res.redirect("/eventos/vista");
  }

  return res.status(200).json({
    mensaje: "Login correcto",
    rol: usuario.rol
  });
});

const verificarRol = (rolPermitido) => {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ mensaje: "No estás logueado" });
    }

    if (req.session.usuario.rol !== rolPermitido) {
      return res.status(403).json({ mensaje: "No tenés permisos" });
    }

    next();
  };
};

app.use("/eventos", verificarRol("visitante"), eventoRoutes);
app.use("/clientes", verificarRol("admin"), clienteRoutes);
app.use("/salas", verificarRol("admin"), salasRoutes);

app.get("/eventos-publicos", (req, res) => {
  res.json({ mensaje: "Todos pueden ver esto" });
});

app.get("/salas-admin", verificarRol("admin"), (req, res) => {
  res.json({ mensaje: "Solo el admin puede ver salas" });
});

app.get("/clientes-admin", verificarRol("admin"), (req, res) => {
  res.json({ mensaje: "Solo el admin puede ver clientes" });
});



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

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });

};

iniciarServidor();