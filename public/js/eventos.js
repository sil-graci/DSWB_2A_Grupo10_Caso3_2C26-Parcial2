const listaEventos = document.getElementById("listaEventos");
const esAdmin = listaEventos.dataset.rol === "admin";
const esVisitante = listaEventos.dataset.rol === "visitante";

let rutaActual = "/eventos";

async function cargarEventos(ruta = rutaActual) {
  rutaActual = ruta;
  try {
    const [resEventos, resSalas] = await Promise.all([
      fetch(ruta),
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
      listaEventos.innerHTML += `
      <article class="evento-card evento-card--foto">
        <img class="evento-card__fondo" src="${evento.imagen || "/portada.png"}" alt="" loading="lazy"
          onerror="this.onerror=null;this.src='/portada.png'">

        <div class="evento-card__header">
          <span class="evento-card__estado evento-card__estado--${evento.estado}">${evento.estado}</span>
        </div>

        <div class="evento-card__body">
          <h3 class="evento-card__titulo">${evento.titulo}</h3>
          <p class="evento-card__descripcion">${evento.descripcion}</p>

          <div class="evento-card__datos">
            <div class="dato"><span class="dato__label">Fecha</span><span class="dato__valor">${evento.fecha}</span></div>
            <div class="dato"><span class="dato__label">Hora</span><span class="dato__valor">${evento.hora}</span></div>
            <div class="dato"><span class="dato__label">Sala</span><span class="dato__valor">${nombresSalas[evento.salaId] || "Sala eliminada"}</span></div>
          </div>

          ${
            esVisitante && evento.estado === "activo"
              ? `<a class="boton" style="margin-top: 20px;" href="/entradas/nueva/${evento._id}">Comprar entrada</a>`
              : ""
          }

          ${
            esAdmin
              ? `<div class="formulario-evento__acciones">
            <a class="boton" href="/eventos/nuevo?id=${evento._id}">Modificar</a>
            <button class="boton" style="border: none; cursor: pointer;" onclick="eliminar('${evento._id}')">Eliminar</button>
          </div>`
              : ""
          }
        </div>
      </article>`;
    });
  } catch (error) {
    console.error(error);
    listaEventos.innerHTML = `<p>No se pudieron cargar los eventos: ${error.message}</p>`;
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

document.getElementById("btnTodos").addEventListener("click", () => cargarEventos("/eventos"));
document.getElementById("btnProximos").addEventListener("click", () => cargarEventos("/eventos/proximos"));
cargarEventos();