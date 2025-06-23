import { Router } from "express";
import { getUsers,handleGetMessages } from "../controllers/message.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { handleCreateMessage } from "../controllers/message.controller";
// import { handleCreateMessage } from "../controllers/message.controller";
const messageRouter = Router();

messageRouter.get('/users', authenticateToken,getUsers); 
messageRouter.post("/send/:id", authenticateToken, handleCreateMessage);
messageRouter.get("/:id", authenticateToken, handleGetMessages);

export default messageRouter;
