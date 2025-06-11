import React, { useState } from 'react';
import {FiLock, FiMail, FiX } from 'react-icons/fi';

const LoginForm = ({ onClose, onSwitchToSignup }) => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        console.log('Login data:', loginData);
        // Add your login logic here
        onClose();
    };
    
    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg_tone rounded-lg shadow-2xl w-full max-w-md mx-4 transform transition-all">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-red-200">
                    <h3 className="text-xl font-semibold text-gray-800">Welcome Back</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white transition"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white transition"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-gray-600">
                                <input 
                                    type="checkbox" 
                                    className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500" 
                                />
                                Remember me
                            </label>
                            <a href="/" className="text-sm text-red-600 hover:text-red-800 transition">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02]"
                        >
                            Log In
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 ">
                            Don't have an account? 
                            <button 
                                onClick={onSwitchToSignup}
                                className="text-red-600 hover:text-red-800 ml-1 font-medium transition"
                            >
                                Sign up here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default LoginForm;