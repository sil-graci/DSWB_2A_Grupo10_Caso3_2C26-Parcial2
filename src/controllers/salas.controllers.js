import Salas from "../models/Salas.js";

// GET ALL
const obtenerSalas = async (req, res) => {
  try {
    const salas = await Salas.find();
    res.json(salas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener las salas",
      error: error.message,
    });
  }
};


// GET BY ID 
const obtenerSalaPorId = async (req, res) => {
  try {
    const sala = await Salas.findById(req.params.id);

    if (!sala) {
      return res.status(404).json({
        mensaje: "Sala no encontrada",
      });
    }

    res.json(sala);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener la sala",
      error: error.message,
    });
  }
};


// CREATE
const crearSala = async (req, res) => {
  try {
    const { nombre, capacidad } = req.body;

    if (!nombre || !capacidad) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios",
      });
    }

    const nuevaSala = new Salas({
      nombre,
      capacidad,
    });

    await nuevaSala.save();

    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/salas/vista?creada=1");
    }

    res.status(201).json({
      mensaje: "Sala creada",
      sala: nuevaSala,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear la sala",
      error: error.message,
    });
  }
};


// UPDATE
const actualizarSala = async (req, res) => {
  try {
    const { nombre, capacidad } = req.body;

    const sala = await Salas.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        capacidad,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!sala) {
      return res.status(404).json({
        mensaje: "Sala no encontrada",
      });
    }

    res.json({
      mensaje: "Sala actualizada",
      sala,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar la sala",
      error: error.message,
    });
  }
};


// DELETE
const eliminarSala = async (req, res) => {
  try {
    const sala = await Salas.findByIdAndDelete(req.params.id);

    if (!sala) {
      return res.status(404).json({
        mensaje: "Sala no encontrada",
      });
    }

    res.json({
      mensaje: "Sala eliminada",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar la sala",
      error: error.message,
    });
  }
};


// Mostrar vistas
const mostrarSalasVista = async (req, res) => {
  try {
    const salas = await Salas.find();

    const mensaje =
      req.query.creada === "1"
        ? "La sala se creó correctamente."
        : null;

    res.render("salas", {
      salas,
      mensaje,
    });
  } catch (error) {
    res.status(500).send("Error al cargar las salas");
  }
};

const mostrarNuevaSalaVista = (req, res) => {
  res.render("nueva_sala");
};

export {
  obtenerSalas,
  obtenerSalaPorId,
  crearSala,
  actualizarSala,
  eliminarSala,
  mostrarSalasVista,
  mostrarNuevaSalaVista,
};