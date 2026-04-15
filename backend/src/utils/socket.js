import { Server } from "socket.io";
import { verifyToken } from "./jwt.js";
import logger from "./logger.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Nouvelle connexion WebSockets: ${socket.id}`);

    // Auth simple via token envoyé depuis le client
    socket.on("authenticate", (token) => {
      try {
        const decoded = verifyToken(token);
        if (decoded.organizationId) {
          socket.join(`org_${decoded.organizationId}`);
          logger.info(`Socket ${socket.id} authentifié dans room org_${decoded.organizationId}`);
          socket.emit("authenticated", { success: true });
        } else if (decoded.role === "super_admin") {
          socket.join("super_admins");
        }
      } catch (err) {
        socket.emit("error", { message: "Auth fallback erreur" });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Déconnexion WebSockets: ${socket.id}`);
    });
  });

  return io;
};

export const emitToOrg = (organizationId, eventName, data) => {
  if (io) {
    io.to(`org_${organizationId}`).emit(eventName, data);
  }
};
