import type { Server } from "socket.io";

let io: Server | undefined;

export function setIo(server: Server) {
  io = server;
}

export function getIo() {
  return io;
}
