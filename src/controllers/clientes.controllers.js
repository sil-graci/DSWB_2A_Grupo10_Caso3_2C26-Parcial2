import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Cliente from "../models/Cliente.js";
import Usuario from "../models/Usuario.js";

// GET ALL
const obtenerClientes = async (req, res) => {
  try {
    const { buscar } = req.query;

    const filtro = buscar
      ? {
          $or: [
            {nombre: {$regex: buscar, $options: "i", },},
            {apellido: {$regex: buscar, $options: "i", },},
            {dni: {$regex: buscar, $options: "i", },},
            {email: {$regex: buscar, $options: "i", },},     
          ],
        }
      : {};

    const clientes = await Cliente.find(filtro);

    res.json(clientes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener los clientes",
    });
  }
};

// GET BY ID
const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del cliente desde los parámetros de la solicitud
    // Validar que el ID sea un ObjectId válido de MongoDB
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "El ID proporcionado no es válido",
      });
    }
    // Buscar el cliente por su ID en la base de datos
    const cliente = await Cliente.findById(id);

    if (!cliente) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado",
      });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener el cliente",
    });
  }
};

// CREATE
const crearCliente = async (req, res) => {
  try {
    const { nombre, apellido, dni, email, telefono } = req.body ?? {};
    // Validar datos obligatorios y cadenas vacías
    if (
      !dni ||
      !email ||
      dni.trim() === "" ||
      email.trim() === ""
    ){
      return res.status(400).json({
        mensaje:
          "Faltan datos obligatorios o contienen valores vacíos",
      });
    }

    const nomLimpio = nombre?.trim() || "";
    const apeLimpio = apellido?.trim() || "";
    const dniLimpio = dni.trim();
    const emailLimpio = email.trim().toLowerCase();
    const telLimpio = telefono?.trim() || "";

    // Validar que el DNI sea estrictamente numérico y tenga 8 dígitos
    const dniValido = /^\d{8}$/;
    if (!dniValido.test(dniLimpio)) {
      return res.status(400).json({
        mensaje:
          "El DNI debe contener 8 dígitos numéricos",
      });
    }

    // Validar clientes con el mismo DNI
    const clienteExistente = await Cliente.findOne({dni: dniLimpio,});
      if (clienteExistente) {
        return res.status(400).json({
          mensaje:
            "Ya existe un cliente registrado con ese DNI",
        });
      }
    
    //Validar usuarios con el mismo email
    const usuarioExistente =  await Usuario.findOne({email: emailLimpio, });
      if (usuarioExistente) {
        return res.status(400).json({
          mensaje:
            "Ya existe un usuario registrado con ese email",
        });
      }
    
    // Validar que el teléfono sea estrictamente numérico
    const telefonoValido = /^\d{8,15}$/;
    if (telLimpio !== "" && !telefonoValido.test(telLimpio)) {
      return res.status(400).json({
        mensaje:
          "El teléfono debe contener entre 8 y 15 números",
      });
    }

    //Guardar cliente y usuario en la base de datos
   const nuevoCliente = await Cliente.create({
      nombre: nomLimpio,
      apellido: apeLimpio,
      dni: dniLimpio,
      email: emailLimpio,
      telefono: telLimpio,
    });

    try {
      const passwordHash = await bcrypt.hash("1234", 10);

      await Usuario.create({
        email: emailLimpio,
        passwordHash,
        rol: "visitante",
        clienteId: nuevoCliente._id,
      });

    } catch (error) {
      await Cliente.findByIdAndDelete(
        nuevoCliente._id
      );

      throw error;
    }
    
    const redireccion = req.session?.usuario?.rol === "admin"
        ? "/clientes/vista?creado=1"
        : "/login?registrado=1";

    return res.status(201).json({ mensaje:"Cliente y usuario creados exitosamente",
      cliente: nuevoCliente, redireccion,
    });


  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al crear el cliente",
    });
  }
};

// UPDATE
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "El ID proporcionado no es válido",
      });
    }
    const cliente = await Cliente.findById(id);

    if (!cliente) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado",
      });
    }

    const { nombre, apellido,dni , email, telefono } =
      req.body ?? {};

    // Validar que al menos se envíe un campo
    if (
      nombre === undefined &&
      apellido === undefined &&
      dni === undefined &&
      email === undefined &&
      telefono === undefined
    ) {
      return res.status(400).json({
        mensaje:
          "Debe enviar al menos un campo para actualizar",
      });
    }

    // DNI y email son obligatorios y no pueden quedar vacíos
    if (
      (dni !== undefined && dni.trim() === "") ||
      (email !== undefined && email.trim() === "")
    ) {
      return res.status(400).json({
        mensaje:
          "El DNI y el email no pueden contener valores vacíos",
      });
    }

    // Validar el teléfono solamente si fue informado
    if (telefono !== undefined) {
      const telefonoLimpio = telefono.trim();
      const telefonoValido = /^\d{8,15}$/;

      if (telefonoLimpio !== "" &&
        !telefonoValido.test(telefonoLimpio)
      ) {
        return res.status(400).json({
          mensaje:
            "El teléfono debe contener entre 8 y 15 números",
        });
      }
    }
    
    // Validar el DNI solamente si fue informado
    if (dni !== undefined &&
      !/^\d{8}$/.test(dni.trim())
    ) {
      return res.status(400).json({
        mensaje:
          "El DNI debe contener 8 dígitos numéricos",
      });
    }

    // Actualizar únicamente los campos proporcionados
    cliente.nombre = nombre !== undefined ? nombre.trim() : cliente.nombre;
    cliente.apellido = apellido !== undefined  ? apellido.trim()  : cliente.apellido;
    cliente.dni =  dni !== undefined ? dni.trim() : cliente.dni;
    cliente.email = email !== undefined ? email.trim().toLowerCase() : cliente.email;
    cliente.telefono =  telefono !== undefined ? telefono.trim() : cliente.telefono;

    await cliente.save();

    res.json({
      mensaje: "Cliente actualizado exitosamente",cliente,});
  } catch (error) {
    console.error(error);

    res.status(500).json({ mensaje: "Error al actualizar el cliente",});
  }
};

// DELETE
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        mensaje: "El ID proporcionado no es válido",
      });
    }

    const eliminado = await Cliente.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado",
      });
    }

    res.json({
      mensaje: "Cliente eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al eliminar el cliente",
    });
  }
};

// MOSTRAR VISTA DE CLIENTES
const mostrarClientesVista = async (req, res) => {
  try {

    const clientes = await Cliente.find();
    let mensaje = null;

    if (req.query.creado === "1") {mensaje = "Cliente registrado exitosamente.";}
    
    if (req.query.actualizado === "1") {mensaje = "Cliente actualizado exitosamente.";}
            
    res.render("clientes", {clientes,mensaje});

  } catch (error) {

    console.error(error);

    res.status(500).send("Error al cargar los clientes");
  }
};

// MOSTRAR VISTAS
const mostrarNuevoClienteVista = (req, res) => {
  res.render("nuevo_cliente", {
    cliente: null, // No hay cliente existente para editar
  });
};



// EXPORTAR FUNCIONES
export {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  mostrarClientesVista,
  mostrarNuevoClienteVista,
};
