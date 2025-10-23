import express, { Request, Response } from "express";
import authRoutes from "./router/auth.route";
import connectDB from "./config/db.config";
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript backend 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB();
});
