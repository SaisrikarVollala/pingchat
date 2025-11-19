import { Request, Response } from "express";
import { User } from "../model/user.model";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatar: z.string().optional(),
});

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.auth._id;
    const validatedData = updateProfileSchema.parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJson(),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    console.error("Update profile error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};
