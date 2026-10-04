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
    fecha: {
      type: String,
      required: true,
    },
    hora: {
      type: String,
      required: true,
    },
    salaId: {
      type: Number,
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

// class Evento {
//     constructor(id, titulo, descripcion, fecha, hora, salaId, estado) {
//         this.id = id;
//         this.titulo = titulo;
//         this.descripcion = descripcion;
//         this.fecha = fecha;
//         this.hora = hora;
//         this.salaId = salaId;
//         this.estado = estado;
//     }
// }

// export default Evento;
