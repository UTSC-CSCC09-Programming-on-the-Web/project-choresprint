import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket() {
  // Create socket connection if it doesn't exist
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000");
  }

  const on = (event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socket?.off(event, callback);
  };

  const emit = (event: string, ...args: any[]) => {
    socket?.emit(event, ...args);
  };

  const disconnect = () => {
    socket?.disconnect();
    socket = null;
  };

  return { socket, on, off, emit, disconnect };
}
