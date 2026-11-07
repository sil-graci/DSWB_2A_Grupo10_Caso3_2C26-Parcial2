const listaClientes = document.getElementById("lista-clientes");
const contadorClientes = document.getElementById("contador-clientes");
const campoBusqueda = document.getElementById("buscar-cliente");
let estadoActual = "activos";
const botonActivos = document.getElementById("btn-activos");
const botonTodos =  document.getElementById("btn-todos");
const mensajeClientes = document.getElementById("mensaje-clientes");

// Genera el HTML de una tarjeta de cliente
const crearTarjetaCliente = (cliente) => {
  const nombreCompleto = `${cliente.nombre || ""} ${cliente.apellido || ""}`
      .trim();

  const tituloCliente = nombreCompleto || cliente.dni;
  const telefonoCliente = cliente.telefono || "No informado";
  const dniFormateado =  cliente.dni.replace(
    /(\d{2})(\d{3})(\d{3})/,"$1.$2.$3");
  
  const acciones = cliente.activo
    ? `
        <a
          class="boton boton-formulario"
          href="/clientes/nuevo?id=${cliente._id}"
        >
          Modificar
        </a>

        <button
          class="boton boton--secundario boton-eliminar"
          type="button"
          data-id="${cliente._id}"
        >
          Dar de baja
        </button>
      `
    : `
        <button
          class="boton boton-formulario boton-reactivar"
          type="button"
          data-id="${cliente._id}"
        >
          Reactivar
        </button>
      `;

  return `
    <article class="evento-card">
      <div class="evento-card__header">
        <span class="evento-card__estado">${cliente.activo ? "Activo" : "Inactivo"}</span>
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
            ${acciones}
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
const cargarClientes = async (buscar = "",estado = "activos") => {
  try {
    mensajeClientes.textContent = "Cargando clientes...";

    let url = "/clientes";

    if (estado === "todos") {url += "?estado=todos";}

    if (buscar.trim()) {const separador = estado === "todos" ? "&" : "?";

      url +=`${separador}buscar=${buscar.trim()}`;}


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

// Da de baja lógicamente un cliente
const eliminarCliente = async (id) => {
  if (!confirm("¿Seguro que querés dar de baja este cliente?")) return;
  try {
    mensajeClientes.textContent = "Dando de baja al cliente...";

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
    await actualizarListado();

    } catch (error) {
    console.error(error);

    mensajeClientes.textContent =
      error.message;

    mensajeClientes.classList.add(
      "mensaje-aviso"
    );

    setTimeout(() => {
      mensajeClientes.textContent = "";

      mensajeClientes.classList.remove(
        "mensaje-aviso"
      );
    }, 4000);
  }
};


// Reactiva un cliente
const reactivarCliente = async (id) => {
  try {
    mensajeClientes.textContent =
      "Reactivando cliente...";

    const respuesta = await fetch(
      `/clientes/${id}/reactivar`,
      {
        method: "PATCH",
      }
    );

    const resultado =
      await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje ||
        "No se pudo reactivar el cliente"
      );
    }

    mensajeClientes.textContent =
      resultado.mensaje;

    await actualizarListado();
    mensajeClientes.textContent = "Cliente reactivado exitosamente.";

    mensajeClientes.classList.add( "mensaje-exito"    );

    setTimeout(() => {
      mensajeClientes.textContent = "";
      mensajeClientes.classList.remove(
        "mensaje-exito"
      );
    }, 4000);

  } catch (error) {
    console.error(error);

    mensajeClientes.textContent =
      error.message;
  }
};

// Detecta clics en Dar de baja y Reactivar
listaClientes.addEventListener( "click",(evento) => {
    const botonEliminar = evento.target.closest(".boton-eliminar");
    if (botonEliminar) {eliminarCliente(botonEliminar.dataset.id);}

    const botonReactivar =  evento.target.closest(".boton-reactivar");

    if (botonReactivar) {reactivarCliente(botonReactivar.dataset.id);}
  }
);


// Actualiza el listado de clientes según el estado y la búsqueda
const actualizarListado = () => {
  return cargarClientes(
    campoBusqueda.value,
    estadoActual
  );
};

// Cambia el filtro por estado 
const cambiarEstado = (estado) => {
  estadoActual = estado;
  actualizarListado();
};

// Filtra clientes activos
botonActivos.addEventListener(
  "click",
  () => cambiarEstado("activos")
);

// Muestra todos los clientes
botonTodos.addEventListener(
  "click",
  () => cambiarEstado("todos")
);

// Filtra mientras el usuario escribe
campoBusqueda.addEventListener(
  "input",
  actualizarListado
);

// Carga inicialmente los clientes activos
cargarClientes();