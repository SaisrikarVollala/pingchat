import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, User, Mail, LogOut } from "lucide-react";
import avatar from "../assets/images/avatar.png";
import ImagePattern from "../components/skeletons/ImagePattern";
import { toast } from "react-hot-toast";

const ProfilePage: React.FC = () => {
  const { authUser, logout, updateProfile, isUpdatingProfile } = useAuthStore();

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState(
    authUser?.displayName || ""
  );
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (profileDisplayName !== authUser?.displayName || selectedImg !== null) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [profileDisplayName, selectedImg, authUser]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedBase64);
        };

        img.onerror = () => reject(new Error("Failed to load image"));
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      setSelectedImg(compressedImage);
    } catch (error) {
      console.error("Image compression error:", error);
      toast.error("Failed to process image");
    }
  };

  const handleSaveChanges = async () => {
    const updateData: { displayName?: string; avatar?: string } = {};

    if (profileDisplayName !== authUser?.displayName) {
      updateData.displayName = profileDisplayName;
    }

    if (selectedImg) {
      updateData.avatar = selectedImg;
    }

    if (Object.keys(updateData).length === 0) {
      return;
    }

    const success = await updateProfile(updateData);
    if (success) {
      setSelectedImg(null);
      setIsChanged(false);
    }
  };

  if (!authUser)
    return (
      <div className="flex items-center justify-center h-screen text-base-content/60">
        Loading profile...
      </div>
    );

  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* LEFT SIDE – PROFILE CARD */}
      <div className="p-6 sm:p-12 flex justify-center items-center">
        <div className="w-full max-w-lg bg-base-200 rounded-xl p-6 shadow-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-base-content">
              Profile
            </h1>
            <p className="mt-2 text-base-content/70">
              Manage your profile details
            </p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={selectedImg || authUser.avatar || avatar}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-base-300"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-base-300 hover:bg-base-100 p-2 rounded-full cursor-pointer transition-all"
              >
                <Camera className="w-5 h-5 text-base-content" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            {selectedImg && (
              <p className="text-xs text-base-content/60">
                Image ready to upload
              </p>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <div className="text-sm text-base-content/70 flex items-center gap-2">
              <User className="w-4 h-4" />
              Display Name
            </div>
            <input
              type="text"
              value={profileDisplayName}
              onChange={(e) => setProfileDisplayName(e.target.value)}
              className="w-full h-[45px] px-4 bg-base-100 rounded-lg border border-base-300 outline-none text-sm"
              placeholder="Enter your display name"
              disabled={isUpdatingProfile}
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <div className="text-sm text-base-content/70 flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </div>
            <div className="w-full h-[45px] px-4 flex items-center bg-base-100 rounded-lg border border-base-300 text-sm">
              {authUser.username}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <div className="text-sm text-base-content/70 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <div className="w-full h-[45px] px-4 flex items-center bg-base-100 rounded-lg border border-base-300 text-sm">
              {authUser.email || "No Email"}
            </div>
          </div>

          {/* Save Button */}
          {isChanged && (
            <div className="flex justify-center pt-2">
              <button
                className="btn btn-primary w-full"
                onClick={handleSaveChanges}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Logout Button */}
          <div className="pt-4">
            <button
              onClick={logout}
              className="btn btn-outline btn-error w-full flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – IMAGE PATTERN */}
      <ImagePattern
        title="Customize Your Profile"
        subtitle="Update your name and profile photo to personalize your experience."
      />
    </div>
  );
};

export default ProfilePage;
