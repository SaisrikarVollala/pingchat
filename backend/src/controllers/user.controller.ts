import { Request, Response } from "express";
import User from "../models/usermodel";
import { userValidationSchema } from "../services/validation";



export const CreateUser = async (req: Request, res: Response)=> {
    try {
    const result = userValidationSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { fullName, email, password } = result.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }
    const newUser = new User({
      fullName,
      email,
      password,
    });

   
    await newUser.save();

    
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};