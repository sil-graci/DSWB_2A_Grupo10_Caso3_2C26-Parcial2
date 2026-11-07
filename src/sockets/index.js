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

   // Notifica a todos los usuarios conectados, sin distinguir sala (io.emit)
  const emitirConectados = () => {
    io.emit("usuarios:conectados", { cantidad: io.of("/").sockets.size });
  };

  io.on("connection", (socket) => {
    socket.join(SALA_EVENTOS);
    console.log(`Socket conectado: ${socket.id}`);
    emitirConectados();

    socket.on("disconnect", () => {
      console.log(`Socket desconectado: ${socket.id}`);
      emitirConectados();
    });
  });


  return io;
};

// Envía un mensaje a todos los que están en la sala Eventos.
// El "?." significa: si io todavía no existe, no hagas nada (así la API REST
// nunca se rompe por culpa de los sockets).
export const emitirEvento = (nombre, datos) => {
  io?.to(SALA_EVENTOS).emit(nombre, datos);
};
