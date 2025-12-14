import { registerForm } from "../lib/auth.validation";
import type { TRegisterForm } from "../lib/auth.validation";
import { useState, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  MessagesSquare,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ImagePattern from "../components/skeletons/ImagePattern";
import { toast } from "react-hot-toast";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<TRegisterForm>({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof TRegisterForm, string>>
  >({});

  const { signUp, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const validateField = useCallback(
    (field: keyof TRegisterForm, value: string) => {
      const fieldSchema = registerForm.shape[field];
      const result = fieldSchema.safeParse(value);

      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          [field]: result.error,
        }));
        return false;
      } else {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        return true;
      }
    },
    []
  );

  const handleChange = useCallback(
    (field: keyof TRegisterForm, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (field: keyof TRegisterForm) => {
      validateField(field, formData[field]);
    },
    [formData, validateField]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emptyFields: string[] = [];
    (Object.keys(formData) as Array<keyof TRegisterForm>).forEach((key) => {
      if (!formData[key].trim()) {
        emptyFields.push(key);
      }
    });

    if (emptyFields.length > 0) {
      toast.error(`Please fill in: ${emptyFields.join(", ")}`);
      return;
    }

    const validation = registerForm.safeParse(formData);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0];
      toast.error(firstError || "Please check all fields");

      const newErrors: Partial<Record<keyof TRegisterForm, string>> = {};
      Object.keys(fieldErrors).forEach((key) => {
        newErrors[key as keyof TRegisterForm] =
          fieldErrors[key as keyof TRegisterForm]?.[0];
      });
      setErrors(newErrors);
      return;
    }

    const success = await signUp(validation.data);
    if (success) {
      navigate("/verify-otp", {
        state: { email: formData.email },
      });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessagesSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 ${errors.username ? "input-error" : ""}`}
                  placeholder="johndoe123"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  onBlur={() => handleBlur("username")}
                  disabled={isSigningUp}
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

            {}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Display Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 ${errors.displayName ? "input-error" : ""}`}
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  onBlur={() => handleBlur("displayName")}
                  disabled={isSigningUp}
                />
              </div>
              {errors.displayName && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.displayName}
                  </span>
                </label>
              )}
            </div>

            {}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 ${errors.email ? "input-error" : ""}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={isSigningUp}
                />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email}
                  </span>
                </label>
              )}
            </div>

            {}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  disabled={isSigningUp}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSigningUp}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
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
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default Register;
