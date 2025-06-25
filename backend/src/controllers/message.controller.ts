import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import cloudinary from '../services/cloudinaryConfig';
import User from '../models/user.model';
import MessageModel from '../models/message';
import { messageDataShape } from '../services/validation.message';
export const getUsers = async (req: AuthenticatedRequest, res: Response ) => {
    try {
        const logedInUser = req.userInfo;
        if (!logedInUser) {
             res.status(401).json({
                success: false,
                message: 'Unauthorized Access: User not found'
            });
            return;
        }
        const filteredUsers = await User.find({ _id: { $ne: logedInUser._id } }).select('-password');
        res.status(200).json(filteredUsers);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

export const handleGetMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const myId=req.userInfo?._id;
        const message=await MessageModel.find({$or:[
            {senderId: myId, receiverId: id},
            {senderId:id,receiverId: myId}
        ]})
        res.status(200).json(
            message
        );
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}
export const handleCreateMessage = async (req: AuthenticatedRequest, res: Response) => {
   try {
     const { id } = req.params;
    const result = messageDataShape.safeParse(req.body);
    if(result.success === false) {
        res.status(400).json({
            success: false,
            message: 'Invalid message data',
            errors: result.error.flatten().fieldErrors
        });
        return;
    }
    const myId= req.userInfo?._id;
    const { text, imageurl } = result.data;
    let image;
    if(imageurl){
        const uploadResponce = await cloudinary.uploader.upload(imageurl);
        image = uploadResponce.secure_url;
    }
    const newMessage = new MessageModel({
        senderId: myId,
        receiverId: id,
        text,
        imageurl: image
    });
    await newMessage.save();
    res.status(201).json({
        success: true,
        message: 'Message sent successfully',
    });
    
   } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
   }
}
