const listaEventos = document.getElementById("listaEventos");
const esAdmin = listaEventos.dataset.rol === "admin";
const esVisitante = listaEventos.dataset.rol === "visitante";

let rutaActual = "/eventos";
const formatoUSD = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Convierte los caracteres especiales de HTML en texto inofensivo, para que
// un dato guardado en la base se muestre como texto y nunca se ejecute como código
function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function cargarEventos(ruta = rutaActual) {
  rutaActual = ruta;
  try {
    const [resEventos, resSalas] = await Promise.all([
      fetch(ruta + "?moneda=usd"),
      fetch("/salas"),
    ]);
    const eventos = await resEventos.json();
    const salas = await resSalas.json();

    if (!Array.isArray(salas)) {
      throw new Error("/salas devolvió: " + JSON.stringify(salas));
    }

    // { idSala: nombreSala } para mostrar el nombre en lugar del id
    const nombresSalas = {};
    salas.forEach((sala) => {
      nombresSalas[sala._id || sala.id] = sala.nombre;
    });

    if (!Array.isArray(eventos) || eventos.length === 0) {
      listaEventos.innerHTML = "<p>No hay eventos para mostrar.</p>";
      return;
    }

    listaEventos.innerHTML = "";

    eventos.forEach((evento) => {
      const puedeComprar =
        (esAdmin || esVisitante) && evento.estado === "activo";

      const precioEnPesos =
        evento.precio > 0
          ? "$" + Number(evento.precio).toLocaleString("es-AR") + " ARS"
          : "Gratis";

      listaEventos.innerHTML += `
      <article class="evento-card evento-card--foto">
        <img class="evento-card__fondo" src="${escaparHTML(evento.imagen || "/portada.png")}" alt="" loading="lazy"
          onerror="this.onerror=null;this.src='/portada.png'">

        <div class="evento-card__header">
          <span class="evento-card__estado evento-card__estado--${escaparHTML(evento.estado)}">${escaparHTML(evento.estado)}</span>
        </div>

        <div class="evento-card__body">
          <h3 class="evento-card__titulo">${escaparHTML(evento.titulo)}</h3>
          <p class="evento-card__descripcion">${escaparHTML(evento.descripcion)}</p>

          <div class="evento-card__datos">
            <div class="dato"><span class="dato__label">Fecha</span><span class="dato__valor">${escaparHTML(evento.fecha)}</span></div>
            <div class="dato"><span class="dato__label">Hora</span><span class="dato__valor">${escaparHTML(evento.hora)}</span></div>
            <div class="dato">
              <span class="dato__label">Precio</span>
              <span class="dato__valor">${precioEnPesos}</span>
              ${
                Number.isFinite(evento.precioUSD)
                  ? `<span class="dato__valor">USD ${formatoUSD.format(evento.precioUSD)}${evento.usaUltimaCotizacion ? " · Última cotización disponible" : ""}</span>`
                  : ""
              }
            </div>
            <div class="dato"><span class="dato__label">Sala</span><span class="dato__valor">${escaparHTML(nombresSalas[evento.salaId] || "Sala eliminada")}</span></div>
          </div>

          ${
            puedeComprar || esAdmin
              ? `<div class="evento-card__acciones">
            ${
              puedeComprar
                ? `<a class="boton boton--chico" href="/entradas/nueva/${evento._id}">Comprar entrada</a>`
                : ""
            }
            ${
              esAdmin
                ? `<a class="boton boton--chico" href="/eventos/nuevo?id=${evento._id}">Modificar</a>
            <button class="boton boton--chico" onclick="eliminar('${evento._id}')">Eliminar</button>`
                : ""
            }
          </div>`
              : ""
          }
        </div>
      </article>`;
    });
  } catch (error) {
    console.error(error);
    listaEventos.innerHTML = `<p>No se pudieron cargar los eventos: ${escaparHTML(error.message)}</p>`;
  }
}

async function eliminar(id) {
  if (!confirm("¿Seguro que querés eliminar este evento?")) return;
  try {
    const res = await fetch(`/eventos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.mensaje || "No se pudo eliminar el evento");
      return;
    }
    cargarEventos();
  } catch (error) {
    console.error(error);
    alert("Error al eliminar el evento");
  }
}

document
  .getElementById("btnTodos")
  .addEventListener("click", () => cargarEventos("/eventos"));
document
  .getElementById("btnProximos")
  .addEventListener("click", () => cargarEventos("/eventos/proximos"));
cargarEventos();

// ---- Tiempo real (WebSockets) ----
const socket = io();

// Muestra un cartelito temporal en pantalla
function mostrarAviso(texto) {
  const aviso = document.createElement("div");
  aviso.className = "aviso-tiempo-real";
  aviso.textContent = texto; // textContent evita que se interprete HTML (seguro)
  document.body.appendChild(aviso);
  setTimeout(() => aviso.classList.add("aviso-tiempo-real--oculto"), 3500);
  setTimeout(() => aviso.remove(), 5000);
}

// Mostrar el aviso y volver a pedir la lista de eventos.
// cargarEventos() sin parámetros mantiene el filtro activo (Todos / Próximos).
function reaccionar(textoAviso) {
  mostrarAviso(textoAviso);
  cargarEventos();
}

// socket.on("nombre", función): se ejecuta cuando el servidor emite ese nombre
socket.on("evento:creado", (datos) => {
  reaccionar(`Nuevo evento: ${datos.titulo}`);
});

socket.on("evento:actualizado", (datos) => {
  reaccionar(`Evento actualizado: ${datos.titulo}`);
});

socket.on("evento:eliminado", (datos) => {
  reaccionar(`Evento eliminado: ${datos.titulo}`);
});

socket.on("eventos:estados-actualizados", () => {
  reaccionar("Algunos eventos pasaron a finalizado");
});

// Notifica a todos los clientes conectados (broadcast con io.emit)
socket.on("usuarios:conectados", ({ cantidad }) => {
  document.getElementById("conectados").textContent =
    `${cantidad} ${cantidad === 1 ? "conexión activa" : "conexiones activas"}`;
});

// Si el servidor rechaza la conexión, lo dejamos registrado en consola
socket.on("connect_error", (error) => {
  console.warn("No se pudo abrir el canal en tiempo real:", error.message);
});