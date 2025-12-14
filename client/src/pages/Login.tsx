import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { loginForm } from "../lib/auth.validation";
import type { TLoginForm } from "../lib/auth.validation";
import { Link } from "react-router-dom";
import ImagePattern from "../components/skeletons/ImagePattern";
import { MessageSquare, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState<TLoginForm>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TLoginForm, string>>
  >({});

  const { login, isLoggingIn } = useAuthStore();

  const handleChange = useCallback(
    (field: keyof TLoginForm, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      const missing: string[] = [];
      if (!formData.username.trim()) missing.push("username");
      if (!formData.password.trim()) missing.push("password");
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    const validation = loginForm.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0];
      toast.error(firstError || "Please fill out all required fields.");

      const newErrors: Partial<Record<keyof TLoginForm, string>> = {};
      Object.keys(fieldErrors).forEach((key) => {
        newErrors[key as keyof TLoginForm] =
          fieldErrors[key as keyof TLoginForm]?.[0];
      });
      setErrors(newErrors);
      return;
    }

    await login(formData);
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      {}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          {}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 ${errors.username ? "input-error" : ""}`}
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  disabled={isLoggingIn}
                />
              </div>
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.username}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password}
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="link link-primary">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {}
      <ImagePattern
        title={"Welcome back!"}
        subtitle={
          "Login to continue your conversations and catch up with your messages."
        }
      />
    </div>
  );
};

export default Login;
