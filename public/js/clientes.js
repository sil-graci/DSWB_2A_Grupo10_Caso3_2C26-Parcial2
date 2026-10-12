const listaClientes = document.getElementById("lista-clientes");
const contadorClientes = document.getElementById("contador-clientes");
const formularioBusqueda = document.getElementById("form-busqueda");
const campoBusqueda = document.getElementById("buscar-cliente");
const mensajeClientes = document.getElementById("mensaje-clientes");

// Genera el HTML de una tarjeta de cliente
const crearTarjetaCliente = (cliente) => {
  const nombreCompleto = `${cliente.nombre || ""} ${cliente.apellido || ""}`
      .trim();

  const tituloCliente = nombreCompleto || cliente.dni;
  const telefonoCliente = cliente.telefono || "No informado";
  const dniFormateado =  cliente.dni.replace(
    /(\d{2})(\d{3})(\d{3})/,"$1.$2.$3");

  return `
    <article class="evento-card">
      <div class="evento-card__header">
        <span class="evento-card__estado">Cliente</span>
        <span class="evento-card__codigo">${cliente.email}</span>
      </div>

      <div class="evento-card__body">
        <h3 class="evento-card__titulo">${tituloCliente}</h3>

        <div class="evento-card__datos">
          <div class="dato">
            <span class="dato__label">DNI</span>
            <span class="dato__valor">${dniFormateado}</span>
          </div>

          <div class="dato">
            <span class="dato__label">Email</span>
            <span class="dato__valor">${cliente.email}</span>
          </div>

          <div class="dato">
            <span class="dato__label">Teléfono</span>
            <span class="dato__valor">${telefonoCliente}</span>
          </div>
          <div style="display:flex; justify-content:center; gap:12px; margin-top:20px;">
            <a class="boton boton-formulario" href="/clientes/nuevo?id=${cliente._id}"> Modificar </a>
            <button
              class="boton boton--secundario boton-eliminar" type="button" data-id="${cliente._id}">Eliminar
            </button>      
          </div>
          
        </div>
      </div>
    </article>
  `;
};

// Muestra en pantalla las tarjetas recibidas
const mostrarClientes = (clientes) => {
  listaClientes.innerHTML = "";
  contadorClientes.textContent =
    `${clientes.length} clientes registrados`;

  if (clientes.length === 0) {
    mensajeClientes.textContent = "No se encontraron clientes.";
    return;
  }
  mensajeClientes.textContent = "";
  const tarjetas = clientes
    .map((cliente) => crearTarjetaCliente(cliente))
    .join("");

  listaClientes.innerHTML = tarjetas;
};

// Obtiene los clientes desde el backend
const cargarClientes = async (buscar = "") => {
  try {
    mensajeClientes.textContent = "Cargando clientes...";

    const url = buscar.trim()
      ? `/clientes?buscar=${buscar.trim()}`
      : "/clientes";

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(
        `Error al cargar los clientes: ${respuesta.status}`
      );
    }

    const clientes = await respuesta.json();
    mostrarClientes(clientes);

  } catch (error) {
    console.error(error);

    contadorClientes.textContent = "No se pudo obtener la cantidad de clientes.";
    mensajeClientes.textContent =  "No se pudieron cargar los clientes.";
    listaClientes.innerHTML = "";
  }
};

// Elimina físicamente un cliente
const eliminarCliente = async (id) => {
  if (!confirm("¿Seguro que querés eliminar este cliente?")) return;
  try {
    mensajeClientes.textContent = "Eliminando cliente...";

    const respuesta = await fetch(`/clientes/${id}`, { method: "DELETE" });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje ||
        "No se pudo eliminar el cliente"
      );
    }
    mensajeClientes.textContent = resultado.mensaje;

    // Actualiza las tarjetas sin recargar la página
    await cargarClientes(campoBusqueda.value);
  } catch (error) {
    console.error(error);
    mensajeClientes.textContent = error.message;
  }
};

// Detecta clics en los botones Eliminar
listaClientes.addEventListener( "click",(evento) => {
    const botonEliminar = evento.target.closest(".boton-eliminar");
    if (botonEliminar) {eliminarCliente(botonEliminar.dataset.id);}
  }
);

// Busca clientes sin recargar la página
formularioBusqueda.addEventListener(
  "submit",
  (evento) => {evento.preventDefault();
    cargarClientes(campoBusqueda.value);
  }
);

// Carga inicialmente todos los clientes
cargarClientes();