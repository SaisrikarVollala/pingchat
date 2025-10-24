import { createClient } from 'redis';
import { Env } from "./env"

const redisClient = createClient({
    username: 'default',
    password: Env.REDIS_PASS,
    socket: {
        host: Env.REDIS_URL,
        port: 17926
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

export const redisConnect=async()=>{ await redisClient.connect();}

export default redisClient;

