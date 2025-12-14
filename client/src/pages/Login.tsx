import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { loginForm } from "../lib/auth.validation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Loader2, User, Lock, MessageSquare } from "lucide-react";
import ImagePattern from "../components/skeletons/ImagePattern";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginForm.safeParse(formData);
    if (!result.success) {
      toast.error(
        result.error.flatten().fieldErrors.username?.[0] ||
          result.error.flatten().fieldErrors.password?.[0] ||
          "Invalid input"
      );
      return;
    }

    await login(result.data);
  };

  const handleChange =
    (field: "username" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to continue</p>
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
                disabled={isLoggingIn}
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
                disabled={isLoggingIn}
              />
              <button
                type="button"
                className="absolute right-3 top-3.5"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoggingIn}
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
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <ImagePattern
        title="Welcome back!"
        subtitle="Continue your conversations and catch up with friends."
      />
    </div>
  );
};

export default Login;
