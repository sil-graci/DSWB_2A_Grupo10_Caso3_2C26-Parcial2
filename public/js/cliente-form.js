const formularioCliente = document.getElementById("form-cliente");
const mensajeFormulario = document.getElementById("mensaje-formulario");

//  Si estamos editando, obtener el ID del cliente de la URL
const clienteId =
  new URLSearchParams(window.location.search).get("id");
  async function precargarCliente() {
  try {
    const respuesta = await fetch(`/clientes/${clienteId}`);
    const cliente = await respuesta.json();

    if (!respuesta.ok) {
      mensajeFormulario.textContent = cliente.mensaje || "No se pudo cargar el cliente";
      return;
    }

    document.getElementById("nombre").value = cliente.nombre || "";
    document.getElementById("apellido").value = cliente.apellido || "";
    document.getElementById("dni").value = cliente.dni;
    document.getElementById("email").value = cliente.email;
    document.getElementById("telefono").value = cliente.telefono || "";

  } catch (error) {

    console.error(error);

    mensajeFormulario.textContent = "Error al cargar el cliente";
  }
}

// Envía el formulario mediante fetch
formularioCliente.addEventListener( "submit",
  async (evento) => {evento.preventDefault();

    const datosCliente = {
      nombre: document.getElementById("nombre").value.trim(),
      apellido: document.getElementById("apellido").value.trim(),
      dni: document.getElementById("dni").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
    };

    try {
     
      const url = clienteId ? `/clientes/${clienteId}` : "/clientes";
      const metodo = clienteId ? "PUT" : "POST";

      const respuesta = await fetch(url, {method: metodo,
        headers: {
          "Content-Type": "application/json",
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

      // Vuelve a la vista si es un administrador o al login si es un visitante
      window.location.href =  clienteId
          ? "/clientes/vista?actualizado=1"
          : resultado.redireccion;
      
      } catch (error) {
      console.error(error);

      mensajeFormulario.textContent = error.message;
    }
  }
);

// Si estamos editando, cargar los datos del cliente
if (clienteId) {
  precargarCliente();
}

// Limpiar el mensaje de error cuando el usuario hace click en un campo
const campos =  document.querySelectorAll("#form-cliente input"  );
campos.forEach((campo) => { campo.addEventListener("click", () => {
    mensajeFormulario.textContent = "";
  });
});