import express from "express";
const router = express.Router();

// importar controladores
import {
    obtenerEntradas,
    obtenerEntradaPorId,
    crearEntrada,
    actualizarEntrada,
    eliminarEntrada,
    mostrarNuevaEntradaVista,

} from "../controllers/entradas.controllers.js";

//Rutas para vistas (Pug / HTML)
router.get("/nueva/:eventoId", mostrarNuevaEntradaVista);

// Rutas de la API REST (JSON)
router.get("/", obtenerEntradas);         // GET /entradas  
router.get("/:id", obtenerEntradaPorId);  // GET /entradas/:id
router.post("/", crearEntrada);           // POST /entradas
router.put("/:id", actualizarEntrada);    // PUT /entradas/:id
router.delete("/:id", eliminarEntrada);   // DELETE /entradas/:id

// exportar router
export default router;
