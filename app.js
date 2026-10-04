import "dotenv/config";
import express from "express";
import path from "path";
import conectarDB from "./src/config/db.js"; // Importar la función de conexión a la base de datos

import eventoRoutes from "./src/routes/eventos.routes.js";
import clienteRoutes from "./src/routes/clientes.routes.js";
import salasRoutes from "./src/routes/salas.routes.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src", "views"));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});


app.get("/", (req, res) => {
    res.send("Urbana Cult");
});


// Rutas
app.use("/eventos", eventoRoutes);
app.use("/clientes", clienteRoutes);
app.use("/salas", salasRoutes);


// Manejador 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada"
  });
});



// Función para iniciar el servidor después de conectar a la base de datos
const iniciarServidor = async () => {
  await conectarDB();
  
  app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
  });
  
};

iniciarServidor();