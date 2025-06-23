import {z} from 'zod';
export const messageDataShape=z.object({
    text:z.string().optional(),
    imageurl:z.string().optional(),
})
export type messageData=z.infer<typeof messageDataShape>;