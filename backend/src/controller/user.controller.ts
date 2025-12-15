import { Request, Response } from "express";
import { User } from "../model/user.model";
import { z } from "zod";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.config";

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

    const updateData: { displayName?: string; avatar?: string } = {};

    // Handle display name update
    if (validatedData.displayName) {
      updateData.displayName = validatedData.displayName;
    }

    // Handle avatar update
    if (validatedData.avatar) {
      // Get current user to check for old avatar
      const currentUser = await User.findById(userId);

      // Upload new avatar to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(
        validatedData.avatar,
        "pingchat/avatars"
      );

      updateData.avatar = cloudinaryUrl;

      // Delete old avatar from Cloudinary if it exists and is a Cloudinary URL
      if (
        currentUser?.avatar &&
        currentUser.avatar.includes("cloudinary.com")
      ) {
        await deleteFromCloudinary(currentUser.avatar);
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
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
      error: err.message || "Failed to update profile",
    });
  }
};
