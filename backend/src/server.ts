import "./interfaces/http.js";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { apiRoutes } from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import { setIo } from "./sockets/io.js";
import { startSlaJob } from "./modules/sla/sla.job.js";
import { uploadDir } from "./config/upload.js";

const app = express();
app.set('trust proxy', true);
const frontendDist = path.resolve(env.FRONTEND_DIST_DIR ?? path.join(process.cwd(), "../frontend/dist"));
const frontendIndex = path.join(frontendDist, "index.html");

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use("/uploads", express.static(path.resolve(uploadDir), {
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", env.CORS_ORIGIN);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));
app.use("/api", apiRoutes);
if (fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === "GET" && req.accepts("html")) {
      res.sendFile(frontendIndex);
      return;
    }
    next();
  });
}
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: env.CORS_ORIGIN, credentials: true } });
setIo(io);

io.on("connection", (socket) => {
  socket.on("user:join", (userId: string) => socket.join(`user:${userId}`));
  socket.on("ticket:join", (ticketId: string) => socket.join(`ticket:${ticketId}`));
});

server.listen(env.PORT, () => {
  console.log(`API lista en http://localhost:${env.PORT}/api`);
  startSlaJob();
});
