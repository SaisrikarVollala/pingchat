import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { registerForm } from "../lib/auth.validation";
import { toast } from "react-hot-toast";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Lock,
  MessagesSquare,
} from "lucide-react";
import ImagePattern from "../components/skeletons/ImagePattern";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });

  const { signUp, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerForm.safeParse(formData);
    if (!result.success) {
      toast.error("Please fill all fields correctly.");
      console.log("Validation errors:", z.treeifyError(result.error));
      return;
    }

    const success = await signUp(result.data);
    if (success) {
      navigate("/");
    }
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessagesSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-base-content/60">Join us today</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-3.5 size-5 text-base-content/40" />
              <input
                type="text"
                placeholder="Username"
                className="input input-bordered w-full pl-10"
                value={formData.username}
                onChange={handleChange("username")}
                disabled={isSigningUp}
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-3.5 size-5 text-base-content/40" />
              <input
                type="text"
                placeholder="Display Name"
                className="input input-bordered w-full pl-10"
                value={formData.displayName}
                onChange={handleChange("displayName")}
                disabled={isSigningUp}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 size-5 text-base-content/40" />
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered w-full pl-10"
                value={formData.email}
                onChange={handleChange("email")}
                disabled={isSigningUp}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 size-5 text-base-content/40" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input input-bordered w-full pl-10 pr-12"
                value={formData.password}
                onChange={handleChange("password")}
                disabled={isSigningUp}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5"
                disabled={isSigningUp}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>

      <ImagePattern
        title="Join our community"
        subtitle="Connect, chat, and share moments with friends."
      />
    </div>
  );
};

export default Register;
