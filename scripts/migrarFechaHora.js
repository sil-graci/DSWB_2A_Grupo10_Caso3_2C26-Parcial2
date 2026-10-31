// Script de única ejecución: completa fechaHora en los eventos que ya existían.
import mongoose from "mongoose";
import conectarDB from "../src/config/db.js";
import Evento from "../src/models/Evento.js";

await conectarDB();

const pendientes = await Evento.find({ fechaHora: { $exists: false } });

for (const evento of pendientes) {
  await evento.save(); // el hook pre("validate") calcula fechaHora
}

console.log(`Eventos actualizados: ${pendientes.length}`);
await mongoose.disconnect();