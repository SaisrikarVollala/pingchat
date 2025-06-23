import express  from "express";
import { handleCreateUser, handleLogin,chekAuth, handleLogout ,handleupdateProfile} from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
const userRouter = express.Router();

userRouter.post('/signup', handleCreateUser);
userRouter.post('/login', handleLogin);
userRouter.post('/logout',handleLogout);
userRouter.put('/update-profile', authenticateToken, handleupdateProfile);
userRouter.get('/check',authenticateToken,chekAuth);
export default userRouter;