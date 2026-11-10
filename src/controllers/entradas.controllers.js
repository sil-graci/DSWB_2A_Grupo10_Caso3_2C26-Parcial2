import mongoose from "mongoose";
import Entrada from "../models/Entrada.js";
import Evento from "../models/Evento.js";
import Cliente from "../models/Cliente.js";
import Sala from "../models/Salas.js";

const estadosValidos = ["activa", "cancelada", "usada"];

// Marca como usadas las entradas activas de eventos cuya fecha y hora ya pasaron.
const actualizarEstado = async () => {
  const ahora = new Date();
  const eventosPasados = await Evento.find({ fechaHora: { $lt: ahora } })
    .select("_id")
    .lean();

  if (eventosPasados.length === 0) return;

  await Entrada.updateMany(
    {
      eventoId: { $in: eventosPasados.map((evento) => evento._id) },
      estado: "activa",
    },
    { $set: { estado: "usada" } },
  );
};

const filtroEntradasUsuario = (usuario) =>
  usuario.rol === "admin"
    ? {}
    : usuario.clienteId
      ? { clienteId: usuario.clienteId }
      : { _id: null };

// GET ALL (API) 
const obtenerEntradas = async (req, res) => {
  try {
    await actualizarEstado();

    if (req.usuario.rol !== "admin" && !req.usuario.clienteId) {
      return res.json([]);
    }

    const entradas = await Entrada.find(filtroEntradasUsuario(req.usuario))
      .sort({ createdAt: -1 })
      .populate("eventoId")
      .populate("clienteId")
      .lean();

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

    await actualizarEstado();

    const filtro = {
      _id: id,
      ...filtroEntradasUsuario(req.usuario),
    };
    const entrada = await Entrada.findOne(filtro)
      .populate("eventoId")
      .populate("clienteId")
      .lean();

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
    const cantidad = Number(req.body?.cantidad ?? 1);

    if (!eventoId || !clienteId) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    if (!mongoose.isValidObjectId(eventoId) || !mongoose.isValidObjectId(clienteId)) {
      return res.status(400).json({ mensaje: "El ID de evento o cliente no es válido" });
    }

    if (estado !== undefined && !estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: "El estado de la entrada no es válido" });
    }

    if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
      return res.status(400).json({ mensaje: "La cantidad debe ser un entero mayor que cero" });
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

    if (!cliente.activo) {
      return res.status(400).json({ mensaje: "No se puede asignar una entrada a un cliente inactivo" });
    }
    
    const sala = await Sala.findById(evento.salaId);

    if (!sala) {
      return res.status(404).json({ mensaje: "La sala del evento no fue encontrada" });
    }

    const entradasActivas = await Entrada.countDocuments({
      eventoId,
      estado: "activa",
    });
    const disponibles = Math.max(sala.capacidad - entradasActivas, 0);

    if (cantidad > disponibles) {
      return res.status(400).json({
        mensaje: `No hay suficientes lugares. Quedan ${disponibles} entrada(s) disponible(s).`,
      });
    }

    const entradas = await Entrada.insertMany(
      Array.from({ length: cantidad }, () => ({
        eventoId,
        clienteId,
        estado: estado ?? "activa",
      })),
    );

    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/eventos/vista?comprada=1");
    }

    res.status(201).json({
      mensaje: `${cantidad} entrada(s) creada(s)`,
      entradas,
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

    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "Solo un administrador puede editar entradas" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "El ID proporcionado no es válido" });
    }

    const entradaActual = await Entrada.findById(id);

    if (!entradaActual) {
      return res.status(404).json({ mensaje: "Entrada no encontrada" });
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
        return res.status(400).json({
          mensaje: "El ID del cliente no es válido"
        });
      }

      const cliente =
        await Cliente.findById(clienteId);

      if (!cliente) {
        return res.status(404).json({
          mensaje: "Cliente no encontrado"
        });
      }

      if (!cliente.activo) {
        return res.status(400).json({
          mensaje:
            "No se puede asignar una entrada a un cliente inactivo",
        });
      }
    }

    if (estado !== undefined && !estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: "El estado de la entrada no es válido" });
    }

    const eventoDestinoId = eventoId ?? entradaActual.eventoId;
    const estadoDestino = estado ?? entradaActual.estado;
    const cambiaEvento = String(eventoDestinoId) !== String(entradaActual.eventoId);

    if (estadoDestino === "activa" && (entradaActual.estado !== "activa" || cambiaEvento)) {
      const eventoDestino = await Evento.findById(eventoDestinoId);
      const salaDestino = eventoDestino
        ? await Sala.findById(eventoDestino.salaId)
        : null;

      if (!eventoDestino || !salaDestino) {
        return res.status(404).json({ mensaje: "No se encontró el evento o la sala" });
      }

      const entradasActivas = await Entrada.countDocuments({
        eventoId: eventoDestinoId,
        estado: "activa",
        _id: { $ne: id },
      });
      const disponibles = Math.max(salaDestino.capacidad - entradasActivas, 0);

      if (disponibles < 1) {
        return res.status(400).json({
          mensaje: "No quedan lugares disponibles para activar esta entrada.",
        });
      }
    }

    const cambios = {};
    if (eventoId !== undefined) cambios.eventoId = eventoId;
    if (clienteId !== undefined) cambios.clienteId = clienteId;
    if (estado !== undefined) cambios.estado = estado;

    const entrada = await Entrada.findByIdAndUpdate(id, cambios, {
      new: true,
      runValidators: true,
    });

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

    const entrada = await Entrada.findOneAndDelete({
      _id: id,
      ...filtroEntradasUsuario(req.usuario),
    });

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

    const evento = await Evento.findById(eventoId).lean();

    if (!evento) {
      return res.status(404).send("Evento no encontrado");
    }

    if (evento.estado !== "activo") {
      return res.status(400).send("Este evento no está disponible para comprar entradas");
    }

    const esAdmin = req.usuario.rol === "admin";
    const [clientes, cliente] = await Promise.all([
      esAdmin ? Cliente.find({activo: true,}).sort({ apellido: 1, nombre: 1 }).lean() : [],
      !esAdmin && req.usuario.clienteId
        ? Cliente.findById(req.usuario.clienteId).lean()
        : null,
    ]);

    res.render("nueva_entrada", { evento, clientes, cliente });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar el formulario de compra");
  }
};

//Mostrar el formulario para ver las entradas
const mostrarEntradasVista = async (req, res) => {
  try {
    res.render("entradas");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar las entradas");
  }
}

export {
  obtenerEntradas,
  obtenerEntradaPorId,
  crearEntrada,
  actualizarEntrada,
  eliminarEntrada,
  mostrarNuevaEntradaVista,
  mostrarEntradasVista,
};
