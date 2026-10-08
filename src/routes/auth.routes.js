import express from "express";
import { cerrarSesion } from "../controllers/auth.controllers.js";
import { mostrarLogin, iniciarSesion } from "../controllers/auth.controllers.js";

const router = express.Router();

router.get("/login", mostrarLogin);
router.post("/login", iniciarSesion);
router.post("/logout", cerrarSesion);
export default router;