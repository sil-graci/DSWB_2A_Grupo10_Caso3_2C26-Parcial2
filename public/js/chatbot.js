const contenedorChat = document.getElementById("chatbot-urbana");

if (contenedorChat) {
  contenedorChat.innerHTML = `
    <button id="chatbot-abrir" type="button" aria-label="Abrir asistente">
      💬
    </button>

    <section id="chatbot-ventana" class="chatbot-ventana" hidden>
      <div class="chatbot-encabezado">
        <div>
          <strong>Asistente Urbana Cult</strong>
          <small>Tu guía cultural</small>
        </div>
        <button id="chatbot-cerrar" type="button" aria-label="Cerrar">
          −
        </button>
      </div>

      <div id="chatbot-mensajes" class="chatbot-mensajes">
        <p class="chatbot-mensaje chatbot-bot">
          ¡Hola! Soy el asistente de Urbana Cult.
          ¿En qué puedo ayudarte?
        </p>
      </div>

      <div id="chatbot-preguntas" class="chatbot-preguntas">
        <button type="button">¿Qué eventos hay?</button>
        <button type="button">¿Qué salas tienen?</button>
        <button type="button">¿Cómo compro entradas?</button>
        <button type="button">¿Cómo hago una reserva?</button>
        <button type="button">Recomendame una obra</button>
      </div>

      <button id="chatbot-menu" class="chatbot-menu" type="button" hidden>
        Ver preguntas frecuentes
      </button>

      <form id="chatbot-formulario" class="chatbot-formulario">
        <input
          id="chatbot-input"
          type="text"
          placeholder="Escribí tu consulta..."
          maxlength="200"
          autocomplete="off"
          required
        />
        <button type="submit" aria-label="Enviar mensaje">➤</button>
      </form>
    </section>
  `;

  const botonAbrir = document.getElementById("chatbot-abrir");
  const botonCerrar = document.getElementById("chatbot-cerrar");
  const ventana = document.getElementById("chatbot-ventana");
  const mensajes = document.getElementById("chatbot-mensajes");
  const formulario = document.getElementById("chatbot-formulario");
  const input = document.getElementById("chatbot-input");
  const preguntas = document.getElementById("chatbot-preguntas");
  const botonMenu = document.getElementById("chatbot-menu");

  let esperandoGenero = false;

  botonAbrir.addEventListener("click", () => {
    ventana.hidden = false;
    botonAbrir.hidden = true;
    input.focus();
  });

  botonCerrar.addEventListener("click", () => {
    ventana.hidden = true;
    botonAbrir.hidden = false;
  });

  // Normaliza el texto para reconocer acentos y mayúsculas
  const normalizarTexto = (texto) => {
    return String(texto)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Muestra mensajes en la conversación
  const agregarMensaje = (texto, tipo) => {
    const mensaje = document.createElement("p");
    mensaje.className = `chatbot-mensaje chatbot-${tipo}`;
    mensaje.textContent = texto;

    mensajes.appendChild(mensaje);
    mensajes.scrollTop = mensajes.scrollHeight;
  };

  const contieneAlguna = (texto, palabras) => {
    return palabras.some((palabra) => texto.includes(palabra));
  };

  // Consulta los eventos próximos desde nuestra API de Express
  const consultarEventos = async () => {
    const respuesta = await fetch("/eventos/proximos");

    if (!respuesta.ok) {
      throw new Error("No se pudieron consultar los eventos");
    }

    const eventos = await respuesta.json();

    if (!Array.isArray(eventos)) {
      throw new Error("La API no devolvió una lista de eventos");
    }

    // Solo recomendamos eventos activos
    return eventos.filter((evento) => evento.estado === "activo");
  };

  // Muestra el título y la información de un evento real
  const describirEvento = (evento) => {
    const fecha = evento.fecha
      ? evento.fecha.split("-").reverse().join("/")
      : "Fecha a confirmar";

    const hora = evento.hora || "Horario a confirmar";

    const precio = typeof evento.precio === "number"
      ? ` - $${evento.precio.toLocaleString("es-AR")}`
      : "";

    return `${evento.titulo} - ${fecha} a las ${hora}${precio}`;
  };

  // Recomienda obras según el género elegido
  const recomendarEventos = async (genero) => {
    try {
      const eventos = await consultarEventos();

      if (eventos.length === 0) {
        return "Por ahora no encontramos eventos próximos disponibles en Urbana Cult.";
      }

      // Busca el género en el título o la descripción
      const coincidencias = eventos.filter((evento) => {
        const contenido = normalizarTexto(
          `${evento.titulo || ""} ${evento.descripcion || ""}`
        );

        return contenido.includes(genero);
      });

      if (coincidencias.length > 0) {
        const recomendaciones = coincidencias
          .slice(0, 3)
          .map(describirEvento)
          .join("\n");

        return `Encontré estas opciones relacionadas con ${genero}:\n\n${recomendaciones}\n\nPodés verlas en la sección Eventos.`;
      }

      // Si no hay coincidencias, propone alternativas reales
      const alternativas = eventos
        .slice(0, 3)
        .map(describirEvento)
        .join("\n");

      return `No encontré eventos que mencionen ${genero} en su título o descripción.\n\nPero estos son algunos próximos eventos disponibles:\n\n${alternativas}\n\nPodés consultar sus detalles en Eventos.`;
    } catch (error) {
      console.error("Error en el chatbot:", error);

      return "No pude consultar los eventos en este momento. Intentá nuevamente más tarde.";
    }
  };

  // Busca próximos eventos sin elegir un género
  const mostrarEventosProximos = async () => {
    try {
      const eventos = await consultarEventos();

      if (eventos.length === 0) {
        return "Por ahora no hay eventos próximos disponibles.";
      }

      const listado = eventos
        .slice(0, 3)
        .map(describirEvento)
        .join("\n");

      return `Estos son algunos próximos eventos de Urbana Cult:\n\n${listado}\n\nPodés consultar la cartelera completa en Eventos.`;
    } catch (error) {
      console.error("Error en el chatbot:", error);

      return "No pude consultar la cartelera en este momento.";
    }
  };

  // Respuestas del chatbot
  const responder = async (pregunta) => {
    const texto = normalizarTexto(pregunta);

    if (contieneAlguna(texto, ["cancelar", "volver", "salir"])) {
      esperandoGenero = false;
      return "Listo. ¿En qué más puedo ayudarte?";
    }

    if (["hola", "buenas", "buen dia", "holaa"].includes(texto)) {
      return "¡Hola! Puedo ayudarte con eventos, salas, entradas, reservas y recomendaciones.";
    }

    if (texto.includes("gracias")) {
      return "¡De nada! ¿Necesitás ayuda con algo más?";
    }

    if (["chau", "adios", "hasta luego"].includes(texto)) {
      esperandoGenero = false;
      return "¡Hasta pronto! Que disfrutes Urbana Cult.";
    }

    // Permite comenzar una nueva recomendación
    if (contieneAlguna(texto, ["recomend", "suger"])) {
      esperandoGenero = true;

      return "¡Dale! ¿Qué género te gusta? Podés elegir drama, terror, romance o comedia. También podés escribir cancelar.";
    }

    // Esperamos que el usuario elija un género
    if (esperandoGenero) {
      const generos = ["drama", "terror", "romance", "comedia"];

      const genero = generos.find((opcion) =>
        texto.includes(opcion)
      );

      if (genero) {
        esperandoGenero = false;
        return await recomendarEventos(genero);
      }

      // Permite cambiar a otra consulta
      if (!contieneAlguna(texto, [
        "evento", "cartelera", "sala",
        "entrada", "compr", "reserva"
      ])) {
        return "Elegí drama, terror, romance o comedia. También podés escribir cancelar.";
      }

      esperandoGenero = false;
    }

    // Entradas
    if (contieneAlguna(texto, [
      "entrada", "comprar", "compra", "boleto"
    ])) {
      return "Para comprar entradas, ingresá a la sección Eventos y elegí la actividad que te interese. También podés consultar tus entradas desde la sección Entradas.";
    }

    // Reservas
    if (contieneAlguna(texto, ["reserva", "reservar"])) {
      return "La gestión de reservas está disponible para los administradores de Urbana Cult. Si sos visitante y necesitás consultar una reserva, comunicate con la administración.";
    }

    // Salas
    if (texto.includes("sala")) {
      return "En la sección Salas se encuentran los espacios registrados y sus capacidades.";
    }

    // Eventos: consulta datos reales
    if (contieneAlguna(texto, [
      "evento", "obra", "cartelera", "actividad"
    ])) {
      return await mostrarEventosProximos();
    }

    return "No entendí bien tu consulta. Podés preguntarme sobre eventos, salas, entradas, reservas o pedirme una recomendación.";
  };

  // Envía mensajes y espera las respuestas de la API
  const enviarPregunta = async (pregunta) => {
    const texto = pregunta.trim();

    if (!texto) return;

    agregarMensaje(texto, "usuario");

    // Evita enviar varias consultas al mismo tiempo
    input.disabled = true;
    formulario.querySelector("button").disabled = true;

    agregarMensaje("Consultando...", "bot");
    const mensajeEspera = mensajes.lastElementChild;

    try {
      const respuesta = await responder(texto);
      mensajeEspera.textContent = respuesta;
    } catch (error) {
      console.error(error);
      mensajeEspera.textContent = "Ocurrió un error al procesar tu consulta.";
    } finally {
      input.disabled = false;
      formulario.querySelector("button").disabled = false;
      input.focus();
      mensajes.scrollTop = mensajes.scrollHeight;
    }

    preguntas.hidden = true;
    botonMenu.hidden = false;
  };

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const pregunta = input.value;
    input.value = "";

    enviarPregunta(pregunta);
  });

  preguntas.querySelectorAll("button").forEach((boton) => {
    boton.addEventListener("click", async () => {
      preguntas.hidden = true;
      await enviarPregunta(boton.textContent);
    });
  });

  botonMenu.addEventListener("click", () => {
    esperandoGenero = false;
    preguntas.hidden = false;
    botonMenu.hidden = true;
    input.focus();
  });
}
