const form = document.getElementById("formEvento");
const mensajeError = document.getElementById("mensajeError");

// Si la URL trae ?id=..., estamos editando; si no, creando
const idEditando = new URLSearchParams(window.location.search).get("id");

async function precargarEvento() {
  try {
    const res = await fetch(`/eventos/${idEditando}`);
    const evento = await res.json();
    if (!res.ok) {
      mensajeError.textContent =
        evento.mensaje || "No se pudo cargar el evento";
      return;
    }
    document.querySelector(".section-title").textContent = "Modificar evento";
    document.getElementById("titulo").value = evento.titulo;
    document.getElementById("descripcion").value = evento.descripcion;
    document.getElementById("fecha").value = evento.fecha;
    document.getElementById("hora").value = evento.hora;
    document.getElementById("salaId").value = evento.salaId;
    document.getElementById("estado").value = evento.estado;
  } catch (error) {
    console.error(error);
    mensajeError.textContent = "Error al cargar el evento";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensajeError.textContent = "";

  const evento = {
    titulo: document.getElementById("titulo").value,
    descripcion: document.getElementById("descripcion").value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    salaId: document.getElementById("salaId").value,
    estado: document.getElementById("estado").value,
  };

  const url = idEditando ? `/eventos/${idEditando}` : "/eventos";
  const metodo = idEditando ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evento),
    });
    const data = await res.json();

    if (!res.ok) {
      mensajeError.textContent = data.mensaje || "No se pudo guardar el evento";
      return;
    }
    window.location.href = idEditando
      ? "/eventos/vista"
      : "/eventos/vista?creado=1";
  } catch (error) {
    console.error(error);
    mensajeError.textContent = "Error de conexión con el servidor";
  }
});

if (idEditando) precargarEvento();
