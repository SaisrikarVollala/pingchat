import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";


const VerifyScreen = () => {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email as string | undefined;
  const { verifyOtp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return navigate("/register");
    if (otp.length !== 6) return toast.error("OTP must be 6 digits");

    const success = await verifyOtp(email, otp);
    if (success) navigate("/");
  };

  if (!email) {
    navigate("/register");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card bg-base-100 shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">
          Verify Your Email
        </h2>
        <p className="text-center text-base-content/60 mb-8">
          We've sent a 6-digit code to{" "}
          <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            className="input input-bordered w-full text-center text-2xl tracking-widest"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />

          <button type="submit" className="btn btn-primary w-full">
             Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyScreen;
