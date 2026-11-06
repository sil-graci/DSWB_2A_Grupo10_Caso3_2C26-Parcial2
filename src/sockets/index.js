import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

// Sala a la que se suman todos los clientes que están mirando el módulo Eventos
export const SALA_EVENTOS = "eventos";

const leerTokenDeCookie = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.slice("token=".length);

export const iniciarSockets = (servidorHttp) => {
  io = new Server(servidorHttp);

  io.use((socket, next) => {
    const token = leerTokenDeCookie(socket.handshake.headers.cookie);

    if (!token) {
      return next(new Error("No estás logueado"));
    }

    try {
      socket.data.usuario = jwt.verify(
        token,
        process.env.JWT_SECRET || "mi-clave-secreta",
      );
      next();
    } catch {
      next(new Error("Token inválido o vencido"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(SALA_EVENTOS);
    console.log(`Socket conectado: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });

  return io;
};
