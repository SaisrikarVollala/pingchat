import express, { Request, Response } from "express";
import authRoutes from "./router/auth.route";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.config";
import http from "http";
import { Env } from "./config/env";
import cors from "cors";
import { redisConnect} from "./config/redisClient";

const app = express();
export const httpserver = http.createServer(app);


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use("/api/auth", authRoutes);
// app.use("/api/message",messageRouter);


httpserver.listen(Env.PORT, () => {
  console.log(`Server running at http://localhost:${Env.PORT}`);
  connectDB();
  redisConnect()
  .then(()=>{
    console.log("Redis connected successfully");
    })
  .catch((err)=>{
    console.error("Redis connection failed:",err);
  });
});
