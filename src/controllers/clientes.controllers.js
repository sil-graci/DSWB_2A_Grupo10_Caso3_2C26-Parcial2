import mongoose from "mongoose";
import Cliente from "../models/Cliente.js";

// GET ALL
const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();// Obtener todos los clientes de la base de datos

    res.json(clientes);
  } catch (error) {
    console.error(error);
    // Manejar errores y enviar una respuesta de error al cliente
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
    const { nombre, apellido, email, telefono } = req.body ?? {};

    // Validar datos obligatorios y cadenas vacías
    if (
      !nombre ||
      !apellido ||
      !email ||
      !telefono ||
      nombre.trim() === "" ||
      apellido.trim() === "" ||
      email.trim() === "" ||
      telefono.trim() === ""
    ) {
      return res.status(400).json({
        mensaje:
          "Faltan datos obligatorios o contienen valores vacíos",
      });
    }

    const nomLimpio = nombre.trim();
    const apeLimpio = apellido.trim();
    const emailLimpio = email.trim().toLowerCase();
    const telLimpio = telefono.trim();

    // Validar que el teléfono sea estrictamente numérico
    const telefonoValido = /^\d{8,15}$/;

    if (!telefonoValido.test(telLimpio)) {
      return res.status(400).json({
        mensaje:
          "El teléfono debe contener entre 8 y 15 números",
      });
    }

    const nuevoCliente = await Cliente.create({
      nombre: nomLimpio,
      apellido: apeLimpio,
      email: emailLimpio,
      telefono: telLimpio,
    });

    // Redirección si la solicitud proviene del formulario Pug
    if (req.headers.accept?.includes("text/html")) {
      return res.redirect("/clientes/vista?creado=1");
    }

    res.status(201).json({
      mensaje: "Cliente creado exitosamente",
      cliente: nuevoCliente,
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

    const { nombre, apellido, email, telefono } =
      req.body ?? {};

    // Validar que al menos se envíe un campo
    if (
      nombre === undefined &&
      apellido === undefined &&
      email === undefined &&
      telefono === undefined
    ) {
      return res.status(400).json({
        mensaje:
          "Debe enviar al menos un campo para actualizar (nombre, apellido, email o telefono)",
      });
    }

    // Validar que no se envíen campos vacíos
    if (
      (nombre !== undefined && nombre.trim() === "") ||
      (apellido !== undefined && apellido.trim() === "") ||
      (email !== undefined && email.trim() === "") ||
      (telefono !== undefined && telefono.trim() === "")
    ) {
      return res.status(400).json({
        mensaje:
          "Los campos a actualizar no pueden contener valores vacíos",
      });
    }

    // Validar teléfono numérico
    if (telefono !== undefined) {
      const telefonoValido = /^\d{8,15}$/;
      const telefonoLimpio = telefono.trim();

      if (!telefonoValido.test(telefonoLimpio)) {
        return res.status(400).json({
          mensaje:
            "El teléfono debe contener entre 8 y 15 números",
        });
      }
    }

    // Actualizar únicamente los campos proporcionados
    cliente.nombre =
      nombre !== undefined
        ? nombre.trim()
        : cliente.nombre;

    cliente.apellido =
      apellido !== undefined
        ? apellido.trim()
        : cliente.apellido;

    cliente.email =
      email !== undefined
        ? email.trim().toLowerCase()
        : cliente.email;

    cliente.telefono =
      telefono !== undefined
        ? telefono.trim()
        : cliente.telefono;

    await cliente.save();

    res.json({
      mensaje: "Cliente actualizado exitosamente",
      cliente,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al actualizar el cliente",
    });
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

// MOSTRAR LISTADO EN PUG
// const mostrarClientesVista = async (req, res) => {
//   try {
//     const clientes = await Cliente.find();

//     const mensaje =
//       req.query.creado === "1"
//         ? "Cliente registrado exitosamente."
//         : null;

//     res.render("clientes", {
//       clientes,
//       mensaje
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).send(
//       "Error al cargar los clientes"
//     );
//   }
// };

const mostrarClientesVista = async (req, res) => {
  try {

    const { buscar } = req.query;

    let clientes;

    if (buscar) {

      clientes = await Cliente.find({
        $or: [
          {
            nombre: {
              $regex: buscar,
              $options: "i"
            }
          },
          {
            apellido: {
              $regex: buscar,
              $options: "i"
            }
          },
          {
            email: {
              $regex: buscar,
              $options: "i"
            }
          }
        ]
      });

    } else {

      clientes = await Cliente.find();

    }

    const mensaje =
      req.query.creado === "1"
        ? "Cliente registrado exitosamente."
        : null;

    res.render("clientes", {
      clientes,
      mensaje
    });

  } catch (error) {

    console.error(error);

    res.status(500).send(
      "Error al cargar los clientes"
    );
  }
};

// MOSTRAR VISTAS
const mostrarNuevoClienteVista = (req, res) => {
  res.render("nuevo_cliente");
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




// import fs from "fs";
// import path from "path";

// import Cliente from "../models/Cliente.js";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const rutaArchivo = path.join(__dirname, "../../data/clientes.json");

// // función leer archivo
// const leerClientes = () => {
//     const data = fs.readFileSync(rutaArchivo, "utf-8");
//     return JSON.parse(data);
// };

// // función guardar archivo
// const guardarClientes = (clientes) => {
//   fs.writeFileSync(rutaArchivo, JSON.stringify(clientes, null, 2));
// };

// // GET ALL
// const obtenerClientes = (req, res) => {
//     const clientes = leerClientes();
//     res.json(clientes);
// };

// // GET BY ID
// const obtenerClientePorId = (req, res) => {
//   const id = parseInt(req.params.id);

//   if (isNaN(id)) {
//     return res.status(400).json({
//       mensaje: "El ID proporcionado no es válido",
//     });
//   }

//   const clientes = leerClientes();
//   const cliente = clientes.find((p) => p.id === id);

//   if (!cliente) {
//     return res.status(404).json({
//       mensaje: "Cliente no encontrado",
//     });
//   }

//   res.json(cliente);
// };

// // CREATE
// const crearCliente = (req, res) => {
//   const clientes = leerClientes();
//   const { nombre, apellido, email, telefono} = req.body;
    
//     // Validar datos obligatorios y cadenas vacías
//   if (
//       !nombre ||
//       !apellido ||
//       !email ||
//       !telefono ||
//       nombre.trim() === "" ||
//       apellido.trim() === "" ||
//       email.trim() === "" ||
//       telefono.trim() === ""
//     ) {
//       return res.status(400).json({
//         mensaje: "Faltan datos obligatorios o contienen valores vacíos",
//       });
//     }
//   const nomLimpio = nombre.trim();
//   const apeLimpio = apellido.trim();
//   const emailLimpio = email.trim().toLowerCase();
//   const telLimpio = telefono.trim();

//   // Validar que el teléfono sea estrictamente numérico
//   const soloNumeros = /^\d+$/;
//   if (!soloNumeros.test(telLimpio)) {
//     return res.status(400).json({
//       mensaje: "El teléfono debe contener únicamente números",
//     });
//   }

//   // Generar ID incremental seguro
//   const nuevoId =
//     clientes.reduce(
//       (mayor, cliente) => (cliente.id > mayor ? cliente.id : mayor),
//       0
//     ) + 1;

//   // Instanciar pasando directamente las variables procesadas
//   const nuevoCliente = new Cliente(
//     nuevoId,
//     nomLimpio,
//     apeLimpio,
//     emailLimpio,
//     telLimpio
//   );

//   clientes.push(nuevoCliente);
//   guardarClientes(clientes);

//   // Redirección si la solicitud proviene del formulario Pug
//   if (req.headers.accept?.includes("text/html")) {
//     return res.redirect("/clientes/vista?creado=1");
//   }

//   res.status(201).json({
//     mensaje: "Cliente creado exitosamente",
//     cliente: nuevoCliente,
//   });
// };

// // UPDATE
// const actualizarCliente = (req, res) => {
//   const id = parseInt(req.params.id);

//   if (isNaN(id)) {
//     return res.status(400).json({
//       mensaje: "El ID proporcionado no es válido",
//     });
//   }

//   const clientes = leerClientes();
//   const cliente = clientes.find((p) => p.id === id);

//   if (!cliente) {
//     return res.status(404).json({
//       mensaje: "Cliente no encontrado",
//     });
//   }

//   const { nombre, apellido, email, telefono } = req.body;

//   // Validar que al menos se envíe un campo para actualizar
//   if (!nombre && !apellido && !email && !telefono) {
//     return res.status(400).json({
//       mensaje:
//         "Debe enviar al menos un campo para actualizar (nombre, apellido, email o telefono)",
//     });
//   }

//   // Validar que no se envíen campos en blanco
//   if (
//     (nombre !== undefined && nombre.trim() === "") ||
//     (apellido !== undefined && apellido.trim() === "") ||
//     (email !== undefined && email.trim() === "") ||
//     (telefono !== undefined && telefono.trim() === "")
//   ) {
//     return res.status(400).json({
//       mensaje: "Los campos a actualizar no pueden contener valores vacíos",
//     });
//   }

//   // Validar teléfono numérico 
//   if (telefono !== undefined) {
//     const soloNumeros = /^\d+$/;
//     if (!soloNumeros.test(telefono.trim())) {
//       return res.status(400).json({
//         mensaje: "El teléfono debe contener únicamente números",
//       });
//     }
//   }

//   // Actualizar los campos del cliente solo si se proporcionan
//   cliente.nombre = nombre ? nombre.trim() : cliente.nombre;
//   cliente.apellido = apellido ? apellido.trim() : cliente.apellido;
//   cliente.email = email ? email.trim().toLowerCase() : cliente.email;
//   cliente.telefono = telefono ? telefono.trim() : cliente.telefono;

//   guardarClientes(clientes);

//   res.json({
//     mensaje: "Cliente actualizado exitosamente",
//     cliente,
//   });
// };

// // DELETE
// const eliminarCliente = (req, res) => {
//   const id = parseInt(req.params.id);

//   if (isNaN(id)) {
//     return res.status(400).json({
//       mensaje: "El ID proporcionado no es válido",
//     });
//   }

//   const clientes = leerClientes();
//   const nuevosClientes = clientes.filter((p) => p.id !== id);
//  // Validar si se eliminó algún cliente
//   if (clientes.length === nuevosClientes.length) {
//     return res.status(404).json({
//       mensaje: "Cliente no encontrado",
//     });
//   }

//   guardarClientes(nuevosClientes);

//   res.json({
//     mensaje: "Cliente eliminado exitosamente",
//   });
// };

// //Mostrar vistas
// const mostrarClientesVista = (req, res) => {
//   const clientes = leerClientes();
//   const mensaje = req.query.creado === "1" ? "Cliente registrado exitosamente." : null;
//   res.render("clientes", { clientes, mensaje });
// };

// const mostrarNuevoClienteVista = (req, res) => {
//   res.render("nuevo_cliente");
// }

// // exportar funciones
// export {
//     obtenerClientes,
//     obtenerClientePorId,
//     crearCliente,
//     actualizarCliente,
//     eliminarCliente,
//     mostrarClientesVista,
//     mostrarNuevoClienteVista,
// };