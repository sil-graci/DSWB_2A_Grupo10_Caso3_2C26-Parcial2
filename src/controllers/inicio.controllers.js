import Evento from "../models/Evento.js";
import Salas from "../models/Salas.js";

export const mostrarInicio = async (req, res) => {
  try {
    const ahora = new Date();

    const [eventos, salas] = await Promise.all([
      Evento.find({ estado: "activo" }).lean(),
      Salas.find().lean(),
    ]);

    const nombresSalas = {};

    salas.forEach((sala) => {
      nombresSalas[String(sala._id)] = sala.nombre;
    });

    // Mostrar únicamente eventos activos cuya fecha aún no pasó.
    const disponibles = eventos
      .filter((evento) => {
        const fechaEvento = new Date(
          `${evento.fecha}T${evento.hora}`
        );

        return fechaEvento > ahora;
      })
      .sort(
        (a, b) =>
          new Date(`${a.fecha}T${a.hora}`) -
          new Date(`${b.fecha}T${b.hora}`)
      )
      .map((evento) => ({
        ...evento,
        nombreSala:
          nombresSalas[String(evento.salaId)] ||
          "Sala no disponible",
      }));

    res.render("inicio", {
      eventos: disponibles,
      errorCartelera: null,
    });
  } catch (error) {
    console.error("Error al cargar la portada:", error);

    res.status(500).render("inicio", {
      eventos: [],
      errorCartelera: "No pudimos cargar los eventos.",
    });
  }
};