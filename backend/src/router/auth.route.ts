import express  from "express";
import { register, verifyOtp, handleLogin } from "../controller/auth.controller";
const authRouter = express.Router();


authRouter.post("/register", register);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/login", handleLogin);

export default authRouter;