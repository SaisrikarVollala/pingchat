import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { Camera, Mail, User, Lock, Info, Edit2 } from "lucide-react";
import avatar from "../public/avatar.png";

const ProfilePage: React.FC = () => {
  const { authUser } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(authUser?.displayName || "");
  const [bio, setBio] = useState("Hey there! I’m using PingChat.");
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (
      displayName !== authUser?.displayName ||
      selectedImg !== null ||
      bio !== "Hey there! I’m using PingChat."
    ) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [displayName, bio, selectedImg, authUser]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setSelectedImg(reader.result as string);
  };

  const handleSaveChanges = () => {
    setSelectedImg(null);
    setEditingName(false);
    setEditingBio(false);
    setShowPasswordSection(false);
    alert("Changes saved locally! (API update not implemented yet)");
  };

  if (!authUser)
    return (
      <div className="flex items-center justify-center h-screen text-base-content/60">
        Loading profile...
      </div>
    );

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8 space-y-6">
        <div className="bg-base-200 rounded-xl p-6 space-y-8 shadow-md">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-base-content">Profile</h1>
            <p className="mt-2 text-base-content/70">Manage your profile details</p>
          </div>

          {/* Avatar + Display Name */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={selectedImg || authUser.profile || avatar}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-base-300"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-base-300 hover:bg-base-100 p-2 rounded-full cursor-pointer transition-all duration-200"
              >
                <Camera className="w-5 h-5 text-base-content" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Display Name */}
            <div className="flex items-center gap-2">
              {editingName ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-transparent border-b border-base-300 focus:outline-none text-xl font-semibold text-center text-base-content"
                  onBlur={() => setEditingName(false)}
                  autoFocus
                />
              ) : (
                <>
                  <span className="text-xl font-semibold text-base-content">
                    {authUser.displayName || "No Name"}
                  </span>
                  <Edit2
                    className="w-4 h-4 text-base-content/70 cursor-pointer hover:text-base-content transition"
                    onClick={() => setEditingName(true)}
                  />
                </>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6 mt-6">
            {/* Username */}
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </div>
              <div className="w-full h-[45px] px-4 flex items-center bg-base-100 rounded-lg border border-base-300 text-sm text-base-content">
                {authUser.username || "-"}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <div className="w-full h-[45px] px-4 flex items-center bg-base-100 rounded-lg border border-base-300 text-sm text-base-content">
                user@email.com
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Bio
                {!editingBio && (
                  <Edit2
                    className="w-4 h-4 ml-1 text-base-content/70 cursor-pointer hover:text-base-content transition"
                    onClick={() => setEditingBio(true)}
                  />
                )}
              </div>
              {editingBio ? (
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onBlur={() => setEditingBio(false)}
                  className="w-full h-[45px] px-4 bg-base-100 rounded-lg border border-base-300 outline-none text-sm text-base-content"
                  placeholder="Write something about yourself..."
                  autoFocus
                />
              ) : (
                <div className="w-full h-[45px] px-4 flex items-center bg-base-100 rounded-lg border border-base-300 text-sm text-base-content/90">
                  {bio}
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="border-t border-base-300 pt-4">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                <div className="text-sm text-base-content/70 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </div>
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  showPasswordSection ? "max-h-96 mt-4 space-y-3" : "max-h-0"
                }`}
              >
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full h-[45px] px-4 bg-base-100 rounded-lg border border-base-300 outline-none text-base-content"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-[45px] px-4 bg-base-100 rounded-lg border border-base-300 outline-none text-base-content"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[45px] px-4 bg-base-100 rounded-lg border border-base-300 outline-none text-base-content"
                />
                <button
                  className="btn btn-primary w-full mt-2"
                  onClick={handleSaveChanges}
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* Save Changes Button */}
            {isChanged && (
              <div className="flex justify-center pt-4">
                <button className="btn btn-primary" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
