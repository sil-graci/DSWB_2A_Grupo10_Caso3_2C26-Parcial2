import fs from "fs";
import path from "path";
import Evento from "../models/Evento.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rutaArchivo = path.join(__dirname, "../../data/eventos.json");
const rutaSalas = path.join(__dirname, "../../data/salas.json");

// Función leer archivo de eventos
const leerEventos = () => {
  const data = fs.readFileSync(rutaArchivo, "utf-8");
  return JSON.parse(data);
};

// Función guardar archivo de eventos
const guardarEventos = (eventos) => {
  fs.writeFileSync(rutaArchivo, JSON.stringify(eventos, null, 2));
};

// Función leer salas
const leerSalas = () => {
  const data = fs.readFileSync(rutaSalas, "utf-8");
  return JSON.parse(data);
};

// Actualizar automáticamente el estado de los eventos según fecha y hora
const actualizarEstados = (eventos) => {
  const ahora = new Date();

  let huboCambios = false;

  eventos.forEach((evento) => {
    const fechaHoraEvento = new Date(`${evento.fecha}T${evento.hora}`);

    if (fechaHoraEvento < ahora && evento.estado === "activo") {
      evento.estado = "finalizado";
      huboCambios = true;
    }
  });

  if (huboCambios) {
    guardarEventos(eventos);
  }

  return eventos;
};

// GET ALL (API)
const obtenerEventos = (req, res) => {
  const eventos = leerEventos();
  actualizarEstados(eventos);
  res.json(eventos);
};

// GET eventos próximos (consulta de negocio)
const obtenerEventosProximos = (req, res) => {
  const eventos = leerEventos();
  actualizarEstados(eventos);

  const ahora = new Date();

  const proximos = eventos
    .filter((e) => new Date(`${e.fecha}T${e.hora}`) > ahora)
    .sort(
      (a, b) =>
        new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`),
    );

  res.json(proximos);
};

// GET BY ID (API)
const obtenerEventoPorId = (req, res) => {
  const eventos = leerEventos();
  actualizarEstados(eventos);
  const id = parseInt(req.params.id);
  const evento = eventos.find((e) => e.id === id);

  if (!evento) {
    return res.status(404).json({
      mensaje: "Evento no encontrado",
    });
  }

  res.json(evento);
};

// CREATE
const crearEvento = (req, res) => {
  const eventos = leerEventos();
  const salas = leerSalas();

  const { titulo, descripcion, fecha, hora, salaId, estado } = req.body;

  // Validar datos obligatorios
  if (!titulo || !descripcion || !fecha || !hora || !salaId || !estado) {
    return res.status(400).json({
      mensaje: "Faltan datos obligatorios",
    });
  }

  // Convertir salaId a número
  const idSala = Number(salaId);

  // Validar que la sala exista
  const sala = salas.find((s) => s.id === idSala);

  if (!sala) {
    return res.status(404).json({
      mensaje: "La sala no existe",
    });
  }

  const estadosValidos = ["activo", "lleno", "finalizado"];

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      mensaje: "El estado del evento no es válido",
    });
  }

  // Validar que no haya otro evento en la misma sala, fecha y hora
  const conflicto = eventos.find(
    (evento) =>
      evento.salaId === idSala &&
      evento.fecha === fecha &&
      evento.hora === hora,
  );

  if (conflicto) {
    return res.status(400).json({
      mensaje: "Ya existe un evento en esa sala, fecha y hora",
    });
  }

  // Generar automáticamente el próximo ID
  const nuevoId =
    eventos.reduce(
      (mayor, evento) => (evento.id > mayor ? evento.id : mayor),
      0,
    ) + 1;

  // Crear evento nuevo
  const nuevoEvento = new Evento(
    nuevoId,
    titulo,
    descripcion,
    fecha,
    hora,
    idSala,
    estado,
  );

  eventos.push(nuevoEvento);

  guardarEventos(eventos);

  if (req.headers.accept?.includes("text/html")) {
    return res.redirect("/eventos/vista?creado=1");
  }

  res.status(201).json({
    mensaje: "Evento creado",
    evento: nuevoEvento,
  });
};

// UPDATE
const actualizarEvento = (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      mensaje: "El ID proporcionado no es válido",
    });
  }

  const eventos = leerEventos();
  const evento = eventos.find((e) => e.id === id);

  if (!evento) {
    return res.status(404).json({
      mensaje: "Evento no encontrado",
    });
  }

  const { titulo, descripcion, fecha, hora, salaId, estado } = req.body;

  // Validar que al menos se envíe un campo para actualizar
  if (
    !titulo &&
    !descripcion &&
    !fecha &&
    !hora &&
    salaId === undefined &&
    !estado
  ) {
    return res.status(400).json({
      mensaje:
        "Debe enviar al menos un campo para actualizar (titulo, descripcion, fecha, hora, salaId o estado)",
    });
  }

  // Validar que los campos de texto no estén vacíos
  if (
    (titulo !== undefined && titulo.trim() === "") ||
    (descripcion !== undefined && descripcion.trim() === "") ||
    (fecha !== undefined && fecha.trim() === "") ||
    (hora !== undefined && hora.trim() === "") ||
    (estado !== undefined && estado.trim() === "")
  ) {
    return res.status(400).json({
      mensaje: "Los campos a actualizar no pueden contener valores vacíos",
    });
  }

  // Validar que la sala exista
  if (salaId !== undefined) {
    const salas = leerSalas();
    const idSala = Number(salaId);

    const sala = salas.find((s) => s.id === idSala);

    if (!sala) {
      return res.status(404).json({
        mensaje: "La sala no existe",
      });
    }
  }

  // Validar estado
  if (estado !== undefined) {
    const estadosValidos = ["activo", "lleno", "finalizado"];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "El estado del evento no es válido",
      });
    }
  }

  // Validar que no exista otro evento con la misma sala, fecha y hora
  const nuevaSalaId = salaId !== undefined ? Number(salaId) : evento.salaId;
  const nuevaFecha = fecha !== undefined ? fecha : evento.fecha;
  const nuevaHora = hora !== undefined ? hora : evento.hora;

  const conflicto = eventos.find(
    (e) =>
      e.id !== id &&
      e.salaId === nuevaSalaId &&
      e.fecha === nuevaFecha &&
      e.hora === nuevaHora,
  );

  if (conflicto) {
    return res.status(400).json({
      mensaje: "Ya existe otro evento en esa sala, fecha y hora",
    });
  }

  // Actualizar solo los campos que se proporcionan
  evento.titulo = titulo ?? evento.titulo;
  evento.descripcion = descripcion ?? evento.descripcion;
  evento.fecha = fecha ?? evento.fecha;
  evento.hora = hora ?? evento.hora;
  evento.salaId = salaId !== undefined ? Number(salaId) : evento.salaId;
  evento.estado = estado ?? evento.estado;

  guardarEventos(eventos);

  res.json({
    mensaje: "Evento actualizado exitosamente",
    evento,
  });
};

// DELETE
const eliminarEvento = (req, res) => {
  const eventos = leerEventos();
  const id = parseInt(req.params.id);
  const nuevosEventos = eventos.filter((e) => e.id !== id);

  if (eventos.length === nuevosEventos.length) {
    return res.status(404).json({
      mensaje: "Evento no encontrado",
    });
  }

  guardarEventos(nuevosEventos);

  res.json({
    mensaje: "Evento eliminado",
  });
};

//Mostrar vistas
const mostrarEventosVista = (req, res) => {
  const eventos = leerEventos();
  const mensaje =
    req.query.creado === "1" ? "Evento creado exitosamente." : null;
  res.render("eventos", { eventos, mensaje });
};

const mostrarNuevoEventoVista = (req, res) => {
  const salas = leerSalas();

  res.render("nuevo_evento", { salas });
};

export {
  obtenerEventos,
  obtenerEventoPorId,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  mostrarEventosVista,
  mostrarNuevoEventoVista,
  obtenerEventosProximos,
};
