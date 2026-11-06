import { Server } from "socket.io";

let io = null;

// Sala a la que se suman todos los clientes que están mirando el módulo Eventos
export const SALA_EVENTOS = "eventos";

export const iniciarSockets = (servidorHttp) => {
  io = new Server(servidorHttp);

  io.on("connection", (socket) => {
    socket.join(SALA_EVENTOS);
    console.log(`Socket conectado: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });

  return io;
};