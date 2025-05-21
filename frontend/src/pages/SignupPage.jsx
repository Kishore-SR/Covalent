import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import  {Atom}  from "../components/icons/Atom.tsx";

const SignupPage = () => {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignup = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      {/* SIGNUP FROM - LEFT SIDE */}
      <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
        {/* LOGO */}
        <div className="mb-4 flex items-center justify-start gap-2">
          {/* <ShipWheelIcon className="size-9 text-primary" /> */}
          <Atom width={40} height={40} stroke="#00f0ff" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Streamify
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
