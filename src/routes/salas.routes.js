import express from "express";

import {
  obtenerSalas,
  obtenerSalaPorId,
  crearSala,
  actualizarSala,
  eliminarSala,
  mostrarSalasVista,
  mostrarNuevaSalaVista,
} from "../controllers/salas.controllers.js";

const router = express.Router();


// Vista de salas
router.get("/vista", mostrarSalasVista);
router.get("/nuevo", mostrarNuevaSalaVista);

router.get("/", obtenerSalas);
router.get("/:id", obtenerSalaPorId);
router.post("/", crearSala);
router.put("/:id", actualizarSala);
router.delete("/:id", eliminarSala);


export default router;