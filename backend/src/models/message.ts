import mongoose, { Schema, Types, model } from "mongoose";
import { messageData } from "../services/validation.message";


type Message = messageData & {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
};

const messageSchema = new Schema<Message>(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        imageurl: {
            type: String,
        },
    },
    { timestamps: true ,versionKey:false}
);


const MessageModel = model<Message>("Message", messageSchema);
export default MessageModel;
