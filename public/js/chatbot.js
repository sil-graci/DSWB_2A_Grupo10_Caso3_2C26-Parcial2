const contenedorChat = document.getElementById("chatbot-urbana");

if (contenedorChat) {
  const esAdmin = contenedorChat.dataset.rol === "admin";
  const estaLogueado = Boolean(contenedorChat.dataset.rol);

  const botonAbrir = contenedorChat.querySelector("#chatbot-abrir");
  const botonCerrar = contenedorChat.querySelector("#chatbot-cerrar");
  const ventana = contenedorChat.querySelector("#chatbot-ventana");
  const mensajes = contenedorChat.querySelector("#chatbot-mensajes");
  const preguntas = contenedorChat.querySelector("#chatbot-preguntas");
  const botonMenu = contenedorChat.querySelector("#chatbot-menu");
  const formulario = contenedorChat.querySelector("#chatbot-formulario");
  const input = contenedorChat.querySelector("#chatbot-input");
  const botonEnviar = formulario.querySelector("button");
  const botonesPreguntas = preguntas.querySelectorAll("button");

  let consultando = false;

  // Normalizar texto
  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Mostrar mensajes
  const agregarMensaje = (texto, tipo) => {
    const mensaje = document.createElement("p");

    mensaje.className = `chatbot-mensaje chatbot-${tipo}`;
    mensaje.textContent = texto;

    mensajes.appendChild(mensaje);
    mensajes.scrollTop = mensajes.scrollHeight;

    return mensaje;
  };

  // Consultar eventos desde la API
  const mostrarEventos = async () => {
    // La API requiere autenticación
    if (!estaLogueado) {
      return "Para consultar los eventos desde el asistente, necesitás iniciar sesión. Si querés explorar los eventos sin registrarte, hacé clic en «CONOCÉ MÁS» para ver la programación disponible.";
    }

    const respuesta = await fetch("/eventos/proximos");

    if (respuesta.status === 401 || respuesta.status === 403) {
      return "Tu sesión no está activa. Iniciá sesión para consultar los próximos eventos desde el asistente.";
    }

    if (!respuesta.ok) {
      throw new Error("No se pudieron consultar los eventos");
    }

    const eventos = await respuesta.json();

    if (!Array.isArray(eventos)) {
      throw new Error("La respuesta de eventos no es válida");
    }

    const disponibles = eventos.filter((evento) => {
      return evento.estado === "activo";
    });

    if (disponibles.length === 0) {
      return "Por ahora no hay eventos próximos disponibles en Urbana Cult.";
    }

    const listado = disponibles.slice(0, 3).map((evento) => {
      const fecha = evento.fecha
        ? evento.fecha.split("-").reverse().join("/")
        : "Fecha a confirmar";

      const hora = evento.hora || "Horario a confirmar";

      const precio = typeof evento.precio === "number"
        ? `$${evento.precio.toLocaleString("es-AR")}`
        : "Precio no disponible";

      return `${evento.titulo} - ${fecha} a las ${hora} - ${precio}`;
    });

    return `Próximos eventos de Urbana Cult:\n\n${listado.join("\n")}\n\nPodés consultar más información en la sección Eventos.`;
  };

  // Responder preguntas
  const responder = async (pregunta) => {
    const texto = normalizarTexto(pregunta);

    // Recomendaciones
    if (texto.includes("recomend") || texto.includes("suger")) {
      return mostrarEventos();
    }

    // Consultar entradas
    if (
      texto.includes("mis entradas") ||
      texto.includes("consulto entradas") ||
      texto.includes("consultar entradas") ||
      texto.includes("ver entradas") ||
      texto.includes("donde veo las entradas")
    ) {
      if (estaLogueado) {
        return "Podés consultar tus entradas desde la sección Entradas del menú principal.";
      }

      return "Para consultar tus entradas, primero necesitás iniciar sesión. Después podrás encontrarlas en la sección Entradas.";
    }

    // Comprar entradas
    if (
      texto.includes("entrada") ||
      texto.includes("comprar") ||
      texto.includes("compra") ||
      texto.includes("boleto")
    ) {
      if (estaLogueado) {
        return "Ingresá a Eventos, elegí la actividad que te interese y hacé clic en «Comprar entrada». Después podés consultar tus entradas desde la sección Entradas.";
      }

      return "Podés explorar los eventos desde «CONOCÉ MÁS». Para comprar una entrada, primero necesitás iniciar sesión.";
    }

    // Reservas
    if (texto.includes("reserva")) {
      if (esAdmin) {
        return "Podés gestionar las reservas desde la sección Reservas del menú de administración.";
      }

      return "La gestión de reservas está disponible para los administradores de Urbana Cult.";
    }

    // Salas
    if (texto.includes("sala")) {
      if (esAdmin) {
        return "Podés consultar las salas registradas y sus capacidades desde la sección Salas.";
      }

      return "Podés consultar las actividades disponibles desde la sección Eventos.";
    }

    // Eventos
    if (
      texto.includes("evento") ||
      texto.includes("obra") ||
      texto.includes("cartelera") ||
      texto.includes("actividad")
    ) {
      return mostrarEventos();
    }

    // Agradecimientos
    if (texto.includes("gracias")) {
      return "¡De nada! ¿Necesitás ayuda con algo más?";
    }

    // Despedidas
    if (
      texto.includes("chau") ||
      texto.includes("adios") ||
      texto.includes("hasta luego")
    ) {
      return "¡Hasta pronto! Que disfrutes Urbana Cult.";
    }

    // Saludos
    if (
      texto.includes("hola") ||
      texto.includes("buenas") ||
      texto.includes("buen dia")
    ) {
      return esAdmin
        ? "¡Hola! Puedo ayudarte con eventos, entradas, salas, reservas y recomendaciones."
        : "¡Hola! Puedo ayudarte con eventos, entradas y recomendaciones.";
    }

    // Respuesta general
    return esAdmin
      ? "Puedo ayudarte con eventos, entradas, salas, reservas y recomendaciones."
      : "Puedo ayudarte con eventos, entradas y recomendaciones.";
  };

  // Procesar preguntas
  const enviarPregunta = async (pregunta) => {
    const texto = pregunta.trim();

    if (!texto || consultando) {
      return;
    }

    consultando = true;

    input.disabled = true;
    botonEnviar.disabled = true;
    botonMenu.disabled = true;

    botonesPreguntas.forEach((boton) => {
      boton.disabled = true;
    });

    preguntas.hidden = true;
    botonMenu.hidden = false;

    agregarMensaje(texto, "usuario");

    const mensajeRespuesta = agregarMensaje("Consultando...", "bot");

    try {
      const respuesta = await responder(texto);
      mensajeRespuesta.textContent = respuesta;
    } catch (error) {
      console.error("Error del chatbot:", error);

      mensajeRespuesta.textContent =
        "No pude procesar tu consulta en este momento. Intentá nuevamente más tarde.";
    } finally {
      consultando = false;

      input.disabled = false;
      botonEnviar.disabled = false;
      botonMenu.disabled = false;

      botonesPreguntas.forEach((boton) => {
        boton.disabled = false;
      });

      mensajes.scrollTop = mensajes.scrollHeight;

      if (!ventana.hidden) {
        input.focus();
      }
    }
  };

  // Abrir chatbot
  botonAbrir.addEventListener("click", () => {
    ventana.hidden = false;
    botonAbrir.hidden = true;
    input.focus();
  });

  // Cerrar chatbot
  botonCerrar.addEventListener("click", () => {
    ventana.hidden = true;
    botonAbrir.hidden = false;
  });

  // Enviar pregunta escrita
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const pregunta = input.value;
    input.value = "";

    enviarPregunta(pregunta);
  });

  // Preguntas frecuentes
  botonesPreguntas.forEach((boton) => {
    boton.addEventListener("click", () => {
      enviarPregunta(boton.textContent);
    });
  });

  // Volver al menú de preguntas
  botonMenu.addEventListener("click", () => {
    if (consultando) {
      return;
    }

    preguntas.hidden = false;
    botonMenu.hidden = true;
    input.focus();
  });
}

