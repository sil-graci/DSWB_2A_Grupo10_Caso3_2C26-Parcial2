import mongoose from "mongoose";

// Formatos que envían los <input type="date"> y <input type="time">
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

// Zona horaria de los eventos (Argentina). Se fija explícita para que el
// resultado no dependa de la zona horaria del servidor donde se despliegue.
const ZONA_HORARIA = "-03:00";

const eventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    imagen: {
      type: String,
      trim: true,
      default: "/portada.png",
    },
    fecha: {
      type: String,
      required: true,
      match: [FORMATO_FECHA, "La fecha debe tener formato AAAA-MM-DD"],
    },
    hora: {
      type: String,
      required: true,
      match: [FORMATO_HORA, "La hora debe tener formato HH:MM"],
    },
    // Fecha y hora combinadas en un Date (se calcula sola al guardar).
    // Permite filtrar y ordenar directamente en MongoDB.
    fechaHora: {
      type: Date,
      index: true,
    },
    // Precio de la entrada en pesos (0 = gratuito)
    precio: {
      type: Number,
      min: [0, "El precio no puede ser negativo"],
      default: 0,
    },
    salaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sala",
      required: true,
    },
    estado: {
      type: String,
      enum: ["activo", "lleno", "finalizado"],
      default: "activo",
    },
  },
  { timestamps: true },
);

// Antes de validar, combina fecha y hora en el campo fechaHora
eventoSchema.pre("validate", function () {
  if (!FORMATO_FECHA.test(this.fecha) || !FORMATO_HORA.test(this.hora)) {
    return; // el formato incorrecto lo informan los validadores "match"
  }

  // Date "corrige" fechas imposibles (31/02 pasa a 03/03), así que se verifica
  // que el día exista en el calendario
  const [anio, mes, dia] = this.fecha.split("-").map(Number);
  const calendario = new Date(Date.UTC(anio, mes - 1, dia));
  const existe =
    calendario.getUTCFullYear() === anio &&
    calendario.getUTCMonth() === mes - 1 &&
    calendario.getUTCDate() === dia;

  if (!existe) {
    this.invalidate("fecha", "La fecha no existe en el calendario");
    return;
  }

  const fechaHora = new Date(`${this.fecha}T${this.hora}:00${ZONA_HORARIA}`);

  this.fechaHora = fechaHora;
});

export default mongoose.model("Evento", eventoSchema);