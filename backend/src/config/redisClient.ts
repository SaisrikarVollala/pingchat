import { createClient } from 'redis';
import { Env } from "./env"

const redisClient = createClient({
    username: 'default',
    password: 'vR5FxUW2h54podI9zWx01JCBornBJ2Gm',
    socket: {
        host: 'redis-17926.c13.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 17926
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

export const redisConnect=async()=>{ await redisClient.connect();}

export default redisClient;

