import { createClient } from 'redis';
import { Env } from "./env"

const redisClient = createClient({
    username: 'default',
    password: Env.REDIS_PASS,
    socket: {
        host: Env.REDIS_URL,
        port: Env.REDIS_PORT 
    }
});

// const redisClient = createClient({
//   socket: {
//     host: '127.0.0.1',
//     port: 6379
//   }
// });



redisClient.on('error', err => console.log('Redis Client Error', err));

export const redisConnect=async()=>{ 
    await redisClient.connect();
    await redisClient.SADD("user:1", "hello")
}

export default redisClient;

