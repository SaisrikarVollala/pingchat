import express, { Request, Response } from "express";
import authRoutes from "./router/auth.route";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.config";
import http from "http";
import { Env } from "./config/env";
import cors from "cors";
import { redisConnect } from "./config/redisClient";
import messageRouter from "./router/message.route";
import userRouter from "./router/user.route";
import "./controller/socket.controller";
import { authenticateToken } from "./middleware/auth.middleware";
import { initSocket } from "./controller/socket.controller";
import { Server } from "socket.io";

const app = express();
export const httpserver = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: Env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use("/api/auth", authRoutes);
app.use("/api", messageRouter);
app.use("/api/user", userRouter);

const io = new Server(httpserver, {
  cors: {
    origin: Env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

initSocket(io);

httpserver.listen(Env.PORT, () => {
  console.log(`Server running at http://localhost:${Env.PORT}`);
  connectDB();
  redisConnect()
    .then(() => {
      console.log("Redis connected successfully");
    })
    .catch((err) => {
      console.error("Redis connection failed:", err);
    });
});
