import express from "express";
import { handleRegister, handleLogin, handleLogout, checkAuth } from "../controller/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";


const authRouter = express.Router();

authRouter.post("/register", handleRegister);
authRouter.post("/login",handleLogin);
authRouter.post("/logout",handleLogout);
authRouter.get("/check",authenticateToken,checkAuth);

export default authRouter;