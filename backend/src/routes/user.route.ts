import express  from "express";
import { handleCreateUser, handleLogin, handleLogout } from "../controllers/user.controller";
const userRouter = express.Router();

userRouter.post('/signup', handleCreateUser);
userRouter.post('/login', handleLogin);
userRouter.post('/logout',handleLogout);
// userRouter.put('/update-profile', authenticateToken, handleupdateProfile);

export default userRouter;