import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const { verifyOtp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      navigate('/register');
      return;
    }

    const success = await verifyOtp(email, otp);
    if (success) {
      navigate('/');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-6">
        <h2 className="text-2xl font-bold text-center">Verify Email</h2>
        <p className="text-center text-base-content/60">
          Enter the OTP sent to {email}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          <button type="submit" className="btn btn-primary w-full">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
  
}
export default VerifyOtp;