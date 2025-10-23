import express  from "express";
import {register,verifyOtp } from "../controller/auth.controller";
const authRouter = express.Router();


authRouter.post("/register", register);
authRouter.post("/verify-otp", verifyOtp);

export default authRouter;