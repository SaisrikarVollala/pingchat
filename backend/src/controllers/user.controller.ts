import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import {userProfileShape, userShape,updateUserShape} from "../services/validation.user";
import bcrypt from 'bcrypt';
import { generateToken } from "../services/auth";
import {env} from "../services/env";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import cloudinary from "../services/cloudinaryConfig";


export  const handleCreateUser=async(req: Request, res: Response)=>{
    try {
    const result = userShape.safeParse(req.body);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }
    const { fullName, email, password,profilePic} = result.data ;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email already in use",
      });
      return;
    }
    const newUser = new User({
      fullName,
      email,
      password,
      profilePic
    });
    await newUser.save();

    const userInfo=newUser.toAuthJSON();
    const token = generateToken(userInfo.id);
   
    res.status(201).cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: env.NODE_ENV !== 'development',
    }).json(userInfo);
  } catch (err) {
   res.status(500)
   .json({
    success:false,
    message:"Internal server error"
   })
  }
};

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
)=> {
  try {
    const result = userProfileShape.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.clearCookie('jwt');
      res.status(400).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    const userInfo= user.toAuthJSON();
    const token = generateToken(userInfo.id);
   

    res.status(200).cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: env.NODE_ENV !== 'development',
    }).json(userInfo);
  } catch (error: unknown) {
    next(error); 
  }
};

export const handleLogout = async(req: Request, res: Response) => {
  try {
   res
    .clearCookie("jwt", { maxAge: 0 })
    .status(200)
    .json({
      sucess:true,
      message:"Loged out sucessfully"
    })
    
  } catch (error) {
    console.log(error);
    res.status(500).json({sucess:false,message:"Internal server error"})
  }
}

export const handleupdateProfile=async(req:AuthenticatedRequest,res:Response)=>{
      try {
        const {profilePic}=updateUserShape.parse(req.body);
        const user=req.userInfo;
        const uploadProfile=await cloudinary.uploader.upload(profilePic);
        const updatedUser=await User.findByIdAndUpdate(user?.id,{profilePic:uploadProfile.secure_url},{new:true})
        res.json(updatedUser?.toAuthJSON()).status(200);
      } catch (error) {
        res.json({success:false}).status(500);
      }
}

export const chekAuth=(req:AuthenticatedRequest,res:Response)=>{
  try {
    res.status(200).json(req.userInfo)
  } catch (error) {
    console.log("error in checking auth");
    res.status(500).json("internal server error");
  }

}
