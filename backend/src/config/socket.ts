import { Server } from "socket.io";

export let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    // Listen for worker events and forward to frontend clients
    socket.on("worker-chore-verified", (data) => {
      // Broadcast to all connected frontend clients
      io.emit("chore-verified", {
        choreId: data.choreId,
        verified: data.verified,
        explanation: data.explanation,
      });
    });

    socket.on("disconnect", () => {
      // Client disconnected
    });
  });
}
