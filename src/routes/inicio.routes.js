import express from "express";
import { mostrarInicio } from "../controllers/inicio.controllers.js";

const router = express.Router();

router.get("/", mostrarInicio);

export default router;