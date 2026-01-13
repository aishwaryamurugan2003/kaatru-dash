import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RiveComponent from "rive-react";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="w-full h-screen flex bg-gray-100 font-inter">

      {/* LEFT SIDE - ANIMATED RIVE */}
      <div className="hidden lg:flex w-1/2 bg-[#2563eb] items-center justify-center p-8">
        <div className="w-3/4 h-3/4 rounded-xl overflow-hidden shadow-lg bg-white">
         <RiveComponent 
  src="/animations/login.riv"
  stateMachines="State Machine 1"
  autoplay
/>

        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Log In</h1>
          <p className="text-gray-500 mb-8">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 outline-none text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 outline-none text-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2563eb] hover:bg-blue-600 text-white py-3 rounded-lg 
                         font-semibold text-sm transition-all"
            >
              Sign In
            </button>

          </form>

          <div className="mt-6 text-sm text-gray-600 flex justify-between">
            <a href="#" className="hover:text-blue-600">Forgot Password?</a>
            <a href="#" className="hover:text-blue-600">Sign Up</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
