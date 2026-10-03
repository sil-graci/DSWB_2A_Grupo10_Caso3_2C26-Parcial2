import express from "express";
const router = express.Router();

import {
  obtenerEventos,
  obtenerEventoPorId,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  mostrarEventosVista,
  mostrarNuevoEventoVista,
   obtenerEventosProximos,
} from "../controllers/eventos.controllers.js";

//Vistas de eventos
router.get("/vista", mostrarEventosVista);
router.get("/nuevo", mostrarNuevoEventoVista);

router.get("/", obtenerEventos);
router.get("/proximos", obtenerEventosProximos);
router.get("/:id", obtenerEventoPorId);
router.post("/", crearEvento);
router.put("/:id", actualizarEvento);
router.delete("/:id", eliminarEvento);

export default router;
