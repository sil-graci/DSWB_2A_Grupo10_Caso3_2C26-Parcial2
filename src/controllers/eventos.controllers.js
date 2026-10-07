import mongoose from "mongoose";
import Evento from "../models/Evento.js";
import Salas from "../models/Salas.js";

const estadosValidos = ["activo", "lleno", "finalizado"];

// Actualizar automáticamente el estado de los eventos según fecha y hora
const actualizarEstados = async () => {
  const ahora = new Date();
  const activos = await Evento.find({ estado: "activo" });

  for (const evento of activos) {
    if (new Date(`${evento.fecha}T${evento.hora}`) < ahora) {
      evento.estado = "finalizado";
      await evento.save();
    }
  }
};

// GET ALL (API)
const obtenerEventos = async (req, res) => {
  try {
    await actualizarEstados();
    const eventos = await Evento.find();
    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener los eventos" });
  }
};

// GET BY ID (API)
const obtenerEventoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "El ID proporcionado no es válido",
      });
    }

    await actualizarEstados();
    const evento = await Evento.findById(id);

    if (!evento) {
      return res.status(404).json({
        mensaje: "Evento no encontrado",
      });
    }

    res.json(evento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener el evento" });
  }
};

// GET eventos próximos (consulta de negocio)
const obtenerEventosProximos = async (req, res) => {
  try {
    await actualizarEstados();
    const eventos = await Evento.find();

    const ahora = new Date();

    const proximos = eventos
      .filter((e) => new Date(`${e.fecha}T${e.hora}`) > ahora)
      .sort(
        (a, b) =>
          new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`),
      );

    res.json(proximos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener los eventos próximos" });
  }
};

// CREATE
const crearEvento = async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora, salaId, estado } = req.body ?? {};

    // Validar datos obligatorios
    if (!titulo || !descripcion || !fecha || !hora || !salaId || !estado) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios",
      });
    }

    // Validar el formato del ID de la sala
    if (!mongoose.isValidObjectId(salaId)) {
      return res.status(400).json({
        mensaje: "El ID de la sala no es válido",
      });
    }

    // Validar que la sala exista en la colección de salas
    const sala = await Salas.findById(salaId);

    if (!sala) {
      return res.status(404).json({
        mensaje: "La sala no existe",
      });
    }

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "El estado del evento no es válido",
      });
    }

    // Validar que no haya otro evento en la misma sala, fecha y hora
    const conflicto = await Evento.findOne({ salaId, fecha, hora });

    if (conflicto) {
      return res.status(400).json({
        mensaje: "Ya existe un evento en esa sala, fecha y hora",
      });
    }

    const nuevoEvento = await Evento.create({
      titulo,
      descripcion,
      fecha,
      hora,
      salaId,
      estado,
    });

    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/eventos/vista?creado=1");
    }

    res.status(201).json({
      mensaje: "Evento creado",
      evento: nuevoEvento,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al crear el evento" });
  }
};

// UPDATE
const actualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "El ID proporcionado no es válido",
      });
    }

    const evento = await Evento.findById(id);

    if (!evento) {
      return res.status(404).json({
        mensaje: "Evento no encontrado",
      });
    }

    const { titulo, descripcion, fecha, hora, salaId, estado } = req.body ?? {};

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
      if (!mongoose.isValidObjectId(salaId)) {
        return res.status(400).json({
          mensaje: "El ID de la sala no es válido",
        });
      }

      const sala = await Salas.findById(salaId);

      if (!sala) {
        return res.status(404).json({
          mensaje: "La sala no existe",
        });
      }
    }

    // Validar estado
    if (estado !== undefined && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "El estado del evento no es válido",
      });
    }

    // Validar que no exista otro evento con la misma sala, fecha y hora
    const nuevaSalaId = salaId ?? evento.salaId;
    const nuevaFecha = fecha ?? evento.fecha;
    const nuevaHora = hora ?? evento.hora;

    const conflicto = await Evento.findOne({
      _id: { $ne: id },
      salaId: nuevaSalaId,
      fecha: nuevaFecha,
      hora: nuevaHora,
    });

    if (conflicto) {
      return res.status(400).json({
        mensaje: "Ya existe otro evento en esa sala, fecha y hora",
      });
    }

    // Actualizar solo los campos que se proporcionan
    evento.titulo = titulo ?? evento.titulo;
    evento.descripcion = descripcion ?? evento.descripcion;
    evento.fecha = nuevaFecha;
    evento.hora = nuevaHora;
    evento.salaId = nuevaSalaId;
    evento.estado = estado ?? evento.estado;

    await evento.save();

    res.json({
      mensaje: "Evento actualizado exitosamente",
      evento,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar el evento" });
  }
};

// DELETE
const eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "El ID proporcionado no es válido",
      });
    }

    const eliminado = await Evento.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Evento no encontrado",
      });
    }

    res.json({
      mensaje: "Evento eliminado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al eliminar el evento" });
  }
};

// Mostrar vistas
const mostrarEventosVista = async (req, res) => {
  try {
    await actualizarEstados();
    const eventos = await Evento.find();

    // Nombres de las salas, para mostrarlos en lugar del ID
    const salas = await Salas.find();
    const nombresSalas = {};
    salas.forEach((sala) => {
      nombresSalas[String(sala._id)] = sala.nombre;
    });

    const mensaje =
      req.query.creado === "1" ? "Evento creado exitosamente." : null;
    res.render("eventos", { eventos, nombresSalas, mensaje });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar los eventos");
  }
};

const mostrarNuevoEventoVista = async (req, res) => {
  try {
    const salas = await Salas.find();
    res.render("nuevo_evento", { salas });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar el formulario");
  }
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
