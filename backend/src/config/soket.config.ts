import {Server} from "socket.io";
import { httpserver } from "../index";
import { Env } from "./env";



export const io = new Server(httpserver, {
    cors: {
        origin: Env.CLIENT_URL,
        credentials: true,
    },
});


