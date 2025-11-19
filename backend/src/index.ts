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
import { initSocket } from "./controller/socket.controller";
import { Server } from "socket.io";

const app = express();
export const httpserver = http.createServer(app);

app.use(
  cors({
    origin: Env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json({ limit: "10mb" })); 
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
