import mongoose from "mongoose";

const entradaSchema = new mongoose.Schema(
  {
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
      required: true,
    },
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    estado: {
      type: String,
      enum: ["activa", "cancelada"],
      default: "activa",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Entrada", entradaSchema);
