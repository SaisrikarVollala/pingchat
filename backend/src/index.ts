import express, { Request, Response } from "express";
import authRoutes from "./router/auth.route";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.config";
import { Env } from "./config/env";
import { redisConnect} from "./config/redisClient";
const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript backend 🚀");
});

app.listen(Env.PORT, () => {
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
