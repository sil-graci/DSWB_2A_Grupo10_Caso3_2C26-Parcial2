const formularioCliente =
  document.getElementById("form-cliente");

const mensajeFormulario =
  document.getElementById("mensaje-formulario");
//
const clienteId =
  new URLSearchParams(window.location.search).get("id");
  async function precargarCliente() {
  try {

    const respuesta =
      await fetch(`/clientes/${clienteId}`);

    const cliente =
      await respuesta.json();

    if (!respuesta.ok) {
      mensajeFormulario.textContent =
        cliente.mensaje ||
        "No se pudo cargar el cliente";

      return;
    }

    document.querySelector(
      ".section-title"
    ).textContent =
      "Modificar cliente";

    document.getElementById("nombre").value =
      cliente.nombre;

    document.getElementById("apellido").value =
      cliente.apellido;

    document.getElementById("email").value =
      cliente.email;

    document.getElementById("telefono").value =
      cliente.telefono;

  } catch (error) {

    console.error(error);

    mensajeFormulario.textContent =
      "Error al cargar el cliente";
  }
}

// Envía el formulario mediante fetch
formularioCliente.addEventListener(
  "submit",
  async (evento) => {
    evento.preventDefault();

    const datosCliente = {
      nombre:
        document.getElementById("nombre").value.trim(),

      apellido:
        document.getElementById("apellido").value.trim(),

      email:
        document.getElementById("email").value.trim(),

      telefono:
        document.getElementById("telefono").value.trim(),
    };

    try {
      mensajeFormulario.textContent =
        "Guardando cliente...";

      const url = clienteId
        ? `/clientes/${clienteId}`
        : "/clientes";

      const metodo = clienteId
        ? "PUT"
        : "POST";

      const respuesta = await fetch(url, {
        method: metodo,

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(datosCliente),
      });
      
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje ||
          "No se pudo guardar el cliente"
        );
      }

      // Vuelve al listado después de guardar
      window.location.href =clienteId
          ? "/clientes/vista?actualizado=1"
          : "/clientes/vista?creado=1";
       
    } catch (error) {
      console.error(error);

      mensajeFormulario.textContent =
        error.message;
    }
  }
);

// Si estamos editando, cargar los datos del cliente
if (clienteId) {
  precargarCliente();
}