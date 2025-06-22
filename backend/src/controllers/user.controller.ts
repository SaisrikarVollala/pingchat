import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import {TUser, userProfileShape, userShape} from "../services/validation";
import bcrypt from 'bcrypt';
import { generateToken } from "../services/auth";
import {env} from "../services/env";

export  const handleCreateUser=async(req: Request, res: Response,next:NextFunction)=>{
    try {
    const result = userShape.safeParse(req.body);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const { fullName, email, password} = result.data ;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400).json({
        success: false,
        message: "Email already in use",
      })
      return;
    }
    const salt=await bcrypt.genSalt(12);
    const hashedPassword=await bcrypt.hash(password,salt);

    const newUser = new User({
      fullName,
      email,
      password:hashedPassword,
    });
    await newUser.save();

    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (err) {
    next(err)
  }
};


export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const token = generateToken(user._id);

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: env.NODE_ENV !== 'development',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { fullName: user.fullName, email: user.email },
      token,
    });
  } catch (error: unknown) {
    next(error); 
  }
};

export const handleLogout = (req: Request, res: Response) => {
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