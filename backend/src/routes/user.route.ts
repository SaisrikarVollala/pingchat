import {Router} from "express";
import { CreateUser } from "../controllers/user.controller";
const userRouter=Router();
userRouter.post('/',async(req,res)=>{
    CreateUser(req,res);
});


export default userRouter;