import { Router } from "express";
import { getMessages,getChats,deleteChat,handleChats, handleChatDetails} from "../controller/message.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const messageRouter = Router();


messageRouter.get("/chats", authenticateToken,getChats)
messageRouter.post("/chats/direct", authenticateToken, handleChats);
messageRouter.get('/chats/:chatId/messages', authenticateToken, getMessages);
messageRouter.delete('/chats/:chatId', authenticateToken,deleteChat);
messageRouter.get('/chats/:chatId', authenticateToken, handleChatDetails);
export default messageRouter;