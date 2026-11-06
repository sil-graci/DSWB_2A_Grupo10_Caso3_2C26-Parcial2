
const listaSalas = document.getElementById("lista-salas");
const mensajeSalas = document.getElementById("mensaje-salas");

// Obtiene las salas del servidor
const cargarSalas = async () => {
  try {
    mensajeSalas.textContent = "Cargando salas...";

    const respuesta = await fetch("/salas");

    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener las salas");
    }

    const salas = await respuesta.json();

    listaSalas.innerHTML = "";

    salas.forEach((sala) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "evento-card";

      const encabezado = document.createElement("div");
      encabezado.className = "evento-card__header";

      const estado = document.createElement("span");
      estado.className = "evento-card__estado";
      estado.textContent = "Sala";

      encabezado.appendChild(estado);

      const cuerpo = document.createElement("div");
      cuerpo.className = "evento-card__body";

      const titulo = document.createElement("h3");
      titulo.className = "evento-card__titulo";
      titulo.textContent = sala.nombre;

      const datos = document.createElement("div");
      datos.className = "evento-card__datos";

      const capacidad = document.createElement("div");
      capacidad.className = "dato";

      const etiqueta = document.createElement("span");
      etiqueta.className = "dato__label";
      etiqueta.textContent = "Capacidad";

      const valor = document.createElement("span");
      valor.className = "dato__valor";
      valor.textContent = `${sala.capacidad} personas`;

      capacidad.append(etiqueta, valor);
      datos.appendChild(capacidad);
      cuerpo.append(titulo, datos);
      tarjeta.append(encabezado, cuerpo);

      listaSalas.appendChild(tarjeta);
    });

    mensajeSalas.textContent =
      salas.length === 0 ? "No hay salas registradas." : "";

  } catch (error) {
    console.error(error);
    mensajeSalas.textContent = "Error al cargar las salas.";
  }
};

cargarSalas();
