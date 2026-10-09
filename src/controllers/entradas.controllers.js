import mongoose from "mongoose";
import Entrada from "../models/Entrada.js";
import Evento from "../models/Evento.js";
import Cliente from "../models/Cliente.js";

const estadosValidos = ["activa", "cancelada"];

// GET ALL (API) 
const obtenerEntradas = async (req, res) => {
  try {
    const entradas = await Entrada.find()
      .populate("eventoId")
      .populate("clienteId");

    res.json(entradas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las entradas" });
  }
};

// GET BY ID (API)
const obtenerEntradaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "El ID proporcionado no es válido" });
    }

    const entrada = await Entrada.findById(id)
      .populate("eventoId")
      .populate("clienteId");

    if (!entrada) {
      return res.status(404).json({ mensaje: "Entrada no encontrada" });
    }

    res.json(entrada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener la entrada" });
  }
};

// CREATE
const crearEntrada = async (req, res) => {
  try {
    const { eventoId, clienteId, estado } = req.body ?? {};

    if (!eventoId || !clienteId) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    if (!mongoose.isValidObjectId(eventoId) || !mongoose.isValidObjectId(clienteId)) {
      return res.status(400).json({ mensaje: "El ID de evento o cliente no es válido" });
    }

    if (estado !== undefined && !estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: "El estado de la entrada no es válido" });
    }

    const [evento, cliente] = await Promise.all([
      Evento.findById(eventoId),
      Cliente.findById(clienteId),
    ]);

    if (!evento) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const entrada = await Entrada.create({
      eventoId,
      clienteId,
      estado: estado ?? "activa",
    });

    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/eventos/vista?comprada=1");
    }

    res.status(201).json({
      mensaje: "Entrada creada",
      entrada,
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear la entrada" });
  }
};

// UPDATE
const actualizarEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventoId, clienteId, estado } = req.body ?? {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "El ID proporcionado no es válido" });
    }

    if (eventoId === undefined && clienteId === undefined && estado === undefined) {
      return res.status(400).json({ mensaje: "Debe enviar al menos un campo para actualizar" });
    }

    if (eventoId !== undefined) {
      if (!mongoose.isValidObjectId(eventoId)) {
        return res.status(400).json({ mensaje: "El ID del evento no es válido" });
      }

      if (!(await Evento.findById(eventoId))) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
      }
    }

    if (clienteId !== undefined) {
      if (!mongoose.isValidObjectId(clienteId)) {
        return res.status(400).json({ mensaje: "El ID del cliente no es válido" });
      }

      if (!(await Cliente.findById(clienteId))) {
        return res.status(404).json({ mensaje: "Cliente no encontrado" });
      }
    }

    if (estado !== undefined && !estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: "El estado de la entrada no es válido" });
    }

    const entrada = await Entrada.findByIdAndUpdate(
      id,
      { eventoId, clienteId, estado },
      { new: true, runValidators: true },
    );

    if (!entrada) {
      return res.status(404).json({ mensaje: "Entrada no encontrada" });
    }

    res.json({
      mensaje: "Entrada actualizada",
      entrada,
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la entrada" });
  }
};

// DELETE
const eliminarEntrada = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "El ID proporcionado no es válido" });
    }

    const entrada = await Entrada.findByIdAndDelete(id);

    if (!entrada) {
      return res.status(404).json({ mensaje: "Entrada no encontrada" });
    }

    res.json({ mensaje: "Entrada eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la entrada" });
  }
};

// Mostrar formulario para comprar una entrada de un evento
const mostrarNuevaEntradaVista = async (req, res) => {
  try {
    const { eventoId } = req.params;

    if (!mongoose.isValidObjectId(eventoId)) {
      return res.status(400).send("El ID del evento no es válido");
    }

    const [evento, clientes] = await Promise.all([
      Evento.findById(eventoId).lean(),
      Cliente.find().sort({ apellido: 1, nombre: 1 }).lean(),
    ]);

    if (!evento) {
      return res.status(404).send("Evento no encontrado");
    }

    if (evento.estado !== "activo") {
      return res.status(400).send("Este evento no está disponible para comprar entradas");
    }

    res.render("nueva_entrada", { evento, clientes });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar el formulario de compra");
  }
};

export {
  obtenerEntradas,
  obtenerEntradaPorId,
  crearEntrada,
  actualizarEntrada,
  eliminarEntrada,
  mostrarNuevaEntradaVista,
};
