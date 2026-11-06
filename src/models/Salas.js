import mongoose from "mongoose";

const salaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    capacidad: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Sala", salaSchema);

