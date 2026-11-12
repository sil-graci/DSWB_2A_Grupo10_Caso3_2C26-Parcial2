const listaEntradas = document.getElementById("listaEntradas");
const mensajeEntradas = document.getElementById("mensajeEntradas");
const sinEntradas = document.getElementById("sinEntradas");
const esAdmin = listaEntradas.dataset.rol === "admin";

let entradas = [];
let mostrarSoloEventosActivos = false;
let entradaEditandoId = null;
let abrirEditor = null;

const escaparHTML = (valor) =>
  String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const mostrarMensaje = (texto = "", tipo = "aviso") => {
  mensajeEntradas.textContent = texto;
  mensajeEntradas.className = texto
    ? tipo === "exito"
      ? "mensaje-exito"
      : "mensaje-aviso"
    : "";
};

const crearTarjeta = (entrada) => {
  const evento = entrada.eventoId || {};
  const cliente = entrada.clienteId || {};
  const nombreCliente = [cliente.nombre, cliente.apellido]
    .filter(Boolean)
    .join(" ") || "No disponible";
  const dni = cliente.dni || "";
  const id = escaparHTML(entrada._id);

  return `
    <article class="evento-card evento-card--foto"
      data-dni="${escaparHTML(dni)}"
      data-evento-estado="${escaparHTML(evento.estado || "")}">
      <img class="evento-card__fondo" src="${escaparHTML(evento.imagen || "/portada.png")}" alt="" loading="lazy"
        onerror="this.onerror=null;this.src='/portada.png'">
      <div class="evento-card__header">
        <span class="evento-card__estado">${escaparHTML(entrada.estado || "No disponible")}</span>
      </div>
      <div class="evento-card__body">
        <h3 class="evento-card__titulo">${escaparHTML(evento.titulo || "Evento no disponible")}</h3>
        <div class="evento-card__datos">
          <div class="dato"><span class="dato__label">Fecha</span><span class="dato__valor">${escaparHTML(evento.fecha || "No disponible")}</span></div>
          <div class="dato"><span class="dato__label">Hora</span><span class="dato__valor">${escaparHTML(evento.hora || "No disponible")}</span></div>
          <div class="dato"><span class="dato__label">Cliente</span><span class="dato__valor">${escaparHTML(nombreCliente)}</span></div>
          ${esAdmin
            ? `<div class="dato"><span class="dato__label">DNI</span><span class="dato__valor">${escaparHTML(dni || "No disponible")}</span></div>`
            : ""}
          <div class="dato"><span class="dato__label">Email</span><span class="dato__valor">${escaparHTML(cliente.email || "No disponible")}</span></div>
        </div>
        <div class="evento-card__acciones">
          ${esAdmin
            ? `<button class="boton boton--chico boton-editar-entrada" type="button" data-id="${id}">Modificar</button>`
            : ""}
          <button class="boton boton--chico boton-eliminar-entrada" type="button" data-id="${id}">Eliminar</button>
        </div>
      </div>
    </article>`;
};

const renderizarEntradas = () => {
  const dniBuscado = esAdmin
    ? document.getElementById("filtroDni").value.trim().toLowerCase()
    : "";
  const filtradas = entradas.filter((entrada) => {
    const coincideDni = !dniBuscado ||
      String(entrada.clienteId?.dni || "").toLowerCase().includes(dniBuscado);
    const coincideEvento = !mostrarSoloEventosActivos ||
      entrada.eventoId?.estado === "activo";
    return coincideDni && coincideEvento;
  });

  listaEntradas.innerHTML = filtradas.map(crearTarjeta).join("");

  if (entradas.length === 0) {
    sinEntradas.textContent = esAdmin
      ? "No hay entradas para mostrar."
      : "Todavía no compraste ninguna entrada.";
  } else if (filtradas.length === 0) {
    sinEntradas.textContent = "No hay entradas que coincidan con esos filtros.";
  } else {
    sinEntradas.textContent = "";
  }
};

const leerJSON = async (respuesta) => {
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "No se pudo completar la operación.");
  }
  return datos;
};

const cargarEntradas = async () => {
  mostrarMensaje("Cargando entradas...");
  try {
    const respuesta = await fetch("/entradas", {
      headers: { Accept: "application/json" },
    });
    entradas = await leerJSON(respuesta);
    if (!Array.isArray(entradas)) {
      throw new Error("El servidor devolvió una respuesta inesperada.");
    }
    mostrarMensaje();
    renderizarEntradas();
  } catch (error) {
    console.error(error);
    listaEntradas.innerHTML = "";
    sinEntradas.textContent = "";
    mostrarMensaje(error.message);
  }
};

if (esAdmin) {
  document.getElementById("filtroDni").addEventListener("input", renderizarEntradas);
  document.getElementById("btnTodasEntradas").addEventListener("click", () => {
    mostrarSoloEventosActivos = false;
    renderizarEntradas();
  });
  document.getElementById("btnEntradasActivas").addEventListener("click", () => {
    mostrarSoloEventosActivos = true;
    renderizarEntradas();
  });
}

listaEntradas.addEventListener("click", async (evento) => {
  const botonEliminar = evento.target.closest(".boton-eliminar-entrada");
  const botonEditar = evento.target.closest(".boton-editar-entrada");

  if (botonEliminar) {
    if (!confirm("¿Seguro que querés eliminar esta entrada?")) return;
    botonEliminar.disabled = true;
    try {
      const respuesta = await fetch(`/entradas/${botonEliminar.dataset.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      await leerJSON(respuesta);
      entradas = entradas.filter((entrada) => entrada._id !== botonEliminar.dataset.id);
      renderizarEntradas();
      mostrarMensaje("Entrada eliminada.", "exito");
    } catch (error) {
      botonEliminar.disabled = false;
      mostrarMensaje(error.message);
    }
    return;
  }

  if (botonEditar && abrirEditor) abrirEditor(botonEditar.dataset.id);
});

if (esAdmin) {
  const dialogo = document.getElementById("dialogEditarEntrada");
  const formularioEdicion = document.getElementById("formEditarEntrada");
  const mensajeEdicion = document.getElementById("mensajeEditarEntrada");

  abrirEditor = async (id) => {
    entradaEditandoId = id;
    mensajeEdicion.textContent = "Cargando entrada...";
    dialogo.showModal();

    try {
      const respuesta = await fetch(`/entradas/${id}`, {
        headers: { Accept: "application/json" },
      });
      const entrada = await leerJSON(respuesta);
      document.getElementById("estadoEntrada").value = entrada.estado;
      mensajeEdicion.textContent = "";
    } catch (error) {
      mensajeEdicion.textContent = error.message;
    }
  };

  document.getElementById("cancelarEdicionEntrada").addEventListener("click", () => {
    dialogo.close();
  });

  formularioEdicion.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensajeEdicion.textContent = "Guardando cambios...";
    const botonGuardar = formularioEdicion.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;

    try {
      const respuesta = await fetch(`/entradas/${entradaEditandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          estado: document.getElementById("estadoEntrada").value,
        }),
      });
      await leerJSON(respuesta);
      dialogo.close();
      await cargarEntradas();
      mostrarMensaje("Entrada actualizada.", "exito");
    } catch (error) {
      mensajeEdicion.textContent = error.message;
    } finally {
      botonGuardar.disabled = false;
    }
  });
}

cargarEntradas();
