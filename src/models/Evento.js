import mongoose from "mongoose";

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
    },
    hora: {
      type: String,
      required: true,
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

export default mongoose.model("Evento", eventoSchema);