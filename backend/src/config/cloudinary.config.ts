import { v2 as Cloudinary } from "cloudinary";
import { Env } from "../config/env";

Cloudinary.config({
  cloud_name: Env.Cloudinary_Cloud_Name,
  api_key: Env.Cloudinary_API_Key,
  api_secret: Env.Cloudinary_API_Secret,
});

export const uploadToCloudinary = async (
  base64Image: string,
  folder: string = "pingchat/avatars"
): Promise<string> => {
  try {
    const result = await Cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: "image",
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    const parts = imageUrl.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts.slice(-3, -1).join("/");
    const publicId = `${folder}/${filename}`;

    await Cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

export default Cloudinary;
