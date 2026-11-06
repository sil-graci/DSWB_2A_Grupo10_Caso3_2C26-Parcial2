import mongoose from "mongoose";
import Evento from "../models/Evento.js";
import Salas from "../models/Salas.js";
import { emitirEvento } from "../sockets/index.js";

const estadosValidos = ["activo", "lleno", "finalizado"];

// El precio es opcional; si viene, tiene que ser un número mayor o igual a 0
const precioInvalido = (precio) =>
  precio !== undefined &&
  (typeof precio !== "number" || !Number.isFinite(precio) || precio < 0);

// Marca como finalizados los eventos activos cuya fecha y hora ya pasaron.
// Una sola operación en MongoDB, sin traer los eventos a Node.
// Si cambió alguno, avisa por socket a los clientes conectados.
const actualizarEstados = async () => {
  const resultado = await Evento.updateMany(
    { estado: "activo", fechaHora: { $lt: new Date() } },
    { estado: "finalizado" },
  );

  // Solo avisamos si realmente cambió algún evento
  if (resultado.modifiedCount > 0) {
    emitirEvento("eventos:estados-actualizados", {
      cantidad: resultado.modifiedCount,
    });
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
    res.status(500).json({
      mensaje: "Error al obtener los eventos",
    });
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
    res.status(500).json({
      mensaje: "Error al obtener el evento",
    });
  }
};

// GET eventos próximos
const obtenerEventosProximos = async (req, res) => {
  try {
    await actualizarEstados();

    // El filtro y el orden los hace MongoDB
    const proximos = await Evento.find({
      fechaHora: { $gt: new Date() },
    }).sort({ fechaHora: 1 });

    res.json(proximos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al obtener los eventos próximos",
    });
  }
};

// CREATE
const crearEvento = async (req, res) => {
  try {
    const { titulo, descripcion, imagen, fecha, hora, precio, salaId, estado } =
      req.body ?? {};

    if (!titulo || !descripcion || !fecha || !hora || !salaId || !estado) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios",
      });
    }

    if (imagen !== undefined && typeof imagen !== "string") {
      return res.status(400).json({
        mensaje: "La imagen debe ser una ruta de texto",
      });
    }
    if (precioInvalido(precio)) {
      return res.status(400).json({
        mensaje: "El precio debe ser un número mayor o igual a 0",
      });
    }

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

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "El estado del evento no es válido",
      });
    }

    const conflicto = await Evento.findOne({
      salaId,
      fecha,
      hora,
    });

    if (conflicto) {
      return res.status(400).json({
        mensaje: "Ya existe un evento en esa sala, fecha y hora",
      });
    }

    const nuevoEvento = await Evento.create({
      titulo,
      descripcion,
      imagen: imagen?.trim() || "/portada.png",
      fecha,
      hora,
      precio: precio ?? 0,
      salaId,
      estado,
    });

    emitirEvento("evento:creado", {
      id: String(nuevoEvento._id),
      titulo: nuevoEvento.titulo,
    });

    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/eventos/vista?creado=1");
    }

    res.status(201).json({
      mensaje: "Evento creado",
      evento: nuevoEvento,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        mensaje: Object.values(error.errors)
          .map((e) => e.message)
          .join(". "),
      });
    }

    console.error(error);
    res.status(500).json({
      mensaje: "Error al crear el evento",
    });
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

    const { titulo, descripcion, imagen, fecha, hora, precio, salaId, estado } =
      req.body ?? {};

    const campos = {
      titulo,
      descripcion,
      imagen,
      fecha,
      hora,
      precio,
      salaId,
      estado,
    };

    if (Object.values(campos).every((valor) => valor === undefined)) {
      return res.status(400).json({
        mensaje:
          "Debe enviar al menos un campo para actualizar (titulo, descripcion, imagen, fecha, hora, precio, salaId o estado)",
      });
    }

    // Validar los campos de texto recibidos
    const camposTexto = {
      titulo,
      descripcion,
      imagen,
      fecha,
      hora,
      estado,
    };

    for (const [campo, valor] of Object.entries(camposTexto)) {
      if (
        valor !== undefined &&
        (typeof valor !== "string" || valor.trim() === "")
      ) {
        return res.status(400).json({
          mensaje: `El campo ${campo} debe contener texto y no puede estar vacío`,
        });
      }
    }

    if (precioInvalido(precio)) {
      return res.status(400).json({
        mensaje: "El precio debe ser un número mayor o igual a 0",
      });
    }

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

    if (estado !== undefined && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "El estado del evento no es válido",
      });
    }

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

    evento.titulo = titulo ?? evento.titulo;
    evento.descripcion = descripcion ?? evento.descripcion;
    evento.fecha = nuevaFecha;
    evento.hora = nuevaHora;
    evento.salaId = nuevaSalaId;
    evento.estado = estado ?? evento.estado;
    evento.precio = precio ?? evento.precio;

    if (imagen !== undefined) {
      evento.imagen = imagen.trim();
    }

    await evento.save();

    emitirEvento("evento:actualizado", {
      id: String(evento._id),
      titulo: evento.titulo,
      estado: evento.estado,
    });

    res.json({
      mensaje: "Evento actualizado exitosamente",
      evento,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        mensaje: Object.values(error.errors)
          .map((e) => e.message)
          .join(". "),
      });
    }

    console.error(error);
    res.status(500).json({
      mensaje: "Error al actualizar el evento",
    });
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

    emitirEvento("evento:eliminado", {
      id: String(eliminado._id),
      titulo: eliminado.titulo,
    });

    res.json({
      mensaje: "Evento eliminado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al eliminar el evento",
    });
  }
};

// Mostrar eventos en la vista Pug
const mostrarEventosVista = async (req, res) => {
  try {
    await actualizarEstados();

    const eventos = await Evento.find().lean();

    const salas = await Salas.find();
    const nombresSalas = {};

    salas.forEach((sala) => {
      nombresSalas[String(sala._id)] = sala.nombre;
    });

    const mensaje =
      req.query.creado === "1" ? "Evento creado exitosamente." : null;

    res.render("eventos", {
      eventos,
      nombresSalas,
      mensaje,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar los eventos");
  }
};

// Mostrar formulario para crear un evento
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
