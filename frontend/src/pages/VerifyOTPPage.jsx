import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("signup_email");
    if (!storedEmail) {
      toast.error("Unauthorized access to OTP verification page.");
      navigate("/signup");
    } else {
      setEmail(storedEmail);
    }

    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleInputChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    const savedOtp = localStorage.getItem("signup_otp");

    if (enteredOtp === savedOtp) {
      localStorage.removeItem("signup_otp");
      localStorage.removeItem("signup_email");
      toast.success("OTP verified successfully.");
      navigate("/onboarding");
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4"
      data-theme="forest"
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verification Code
          </h2>
          <p className="text-center text-gray-600 max-w-sm">
            We've sent a verification code to
            <span className="font-medium text-blue-600 block">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Verify
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-gray-600 mb-2">
            Time remaining:{" "}
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
