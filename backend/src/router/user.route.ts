import express from "express";
import { updateProfile } from "../controller/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const userRouter = express.Router();

userRouter.put("/profile", authenticateToken, updateProfile);

export default userRouter;
