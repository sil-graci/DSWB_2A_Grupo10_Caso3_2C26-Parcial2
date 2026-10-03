import fs from "fs";
import path from "path";
import Salas from "../models/Salas.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rutaArchivo = path.join(__dirname, "../../data/salas.json");


// Función leer archivo de salas
const leerSalas = () => {
  const data = fs.readFileSync(rutaArchivo, "utf-8");
  return JSON.parse(data);
};


// Función guardar archivo de salas
const guardarSalas = (salas) => {
  fs.writeFileSync(
    rutaArchivo,
    JSON.stringify(salas, null, 2)
  );
};


// GET ALL
const obtenerSalas = (req, res) => {
  const salas = leerSalas();
  res.json(salas);
};


// GET BY ID 
const obtenerSalaPorId = (req, res) => {
  const salas = leerSalas();
  const id = parseInt(req.params.id);
  const sala = salas.find((s) => s.id === id);

  if (!sala) {
    return res.status(404).json({
      mensaje: "Sala no encontrada",
    });
  }

  res.json(sala);
};


// CREATE
const crearSala = (req, res) => {
  const salas = leerSalas();

  const { nombre, capacidad } = req.body;

  // Validar datos obligatorios
  if (!nombre || !capacidad) {
    return res.status(400).json({
      mensaje: "Faltan datos obligatorios",
    });
  }

  // Generar automáticamente el próximo ID
  const nuevoId =
    salas.reduce(
      (mayor, sala) => (sala.id > mayor ? sala.id : mayor),
      0
    ) + 1;

  // Crear sala nueva
  const nuevaSala = new Salas(
    nuevoId,
    nombre,
    capacidad
  );

  salas.push(nuevaSala);

  guardarSalas(salas);

  if (req.headers.accept?.includes("text/html")) {
    return res.redirect("/salas/vista?creada=1");
  }

  res.status(201).json({
    mensaje: "Sala creada",
    sala: nuevaSala,
  });
};


// UPDATE
const actualizarSala = (req, res) => {
  const salas = leerSalas();
  const id = parseInt(req.params.id);
  const sala = salas.find((s) => s.id === id);

  if (!sala) {
    return res.status(404).json({
      mensaje: "Sala no encontrada",
    });
  }

  const { nombre, capacidad } = req.body;

  sala.nombre = nombre ?? sala.nombre;
  sala.capacidad = capacidad ?? sala.capacidad;

  guardarSalas(salas);

  res.json({
    mensaje: "Sala actualizada",
    sala,
  });
};


// DELETE
const eliminarSala = (req, res) => {
  const salas = leerSalas();
  const id = parseInt(req.params.id);
  const nuevasSalas = salas.filter((s) => s.id !== id);

  if (salas.length === nuevasSalas.length) {
    return res.status(404).json({
      mensaje: "Sala no encontrada",
    });
  }

  guardarSalas(nuevasSalas);

  res.json({
    mensaje: "Sala eliminada",
  });
};


// Mostrar vistas
const mostrarSalasVista = (req, res) => {
  const salas = leerSalas();
  const mensaje = req.query.creada === "1"
    ? "La sala se creó correctamente."
    : null;

  res.render("salas", { salas, mensaje });
};

const mostrarNuevaSalaVista = (req, res) => {
  res.render("nueva_sala");
}

export {
  obtenerSalas,
  obtenerSalaPorId,
  crearSala,
  actualizarSala,
  eliminarSala,
  mostrarSalasVista,
  mostrarNuevaSalaVista,
};