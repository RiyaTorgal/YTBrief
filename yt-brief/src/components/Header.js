import React, { useState } from 'react';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';

const Header = () => {
    const [isToggled, setIsToggled] = useState(false);
    const handleToggle = () => {
    setIsToggled(!isToggled);
    };
    return (
        <header className="p-4 flex justify-end items-center mb-1">
            <button
                onClick={handleToggle}
                >
                {isToggled ? (
                    <IoMdSunny className="text-2xl hover:text-red-400 transition"/>
                ) : (
                    <IoMdMoon className="text-2xl hover:text-red-400 transition" />
                )}
            </button>
            {/* <div className="logo-placeholder1 ml-6"></div> */}
            {/* <button>
                <img src="/YTBrief_User.png" alt="YTBrief User" className="logo-placeholder1 ml-5" />
            </button> */}
            <button
                    className={`ml-5 px-4 text-sm font-semibold py-2 bg-transparent hover:bg-red-500 text-red-600 hover:text-white border border-red-600 hover:border-transparent rounded-md transition`}
                    >
                    Log In
            </button>
            <button
                    className={`ml-5 px-4 text-sm font-semibold py-2 bg-red-600 hover:bg-red-200 text-white hover:text-red-600 border border-red-600 hover:border-transparent rounded-md transition`}
                    >
                Sign Up
            </button>
        </header>
    )
}
export default Header;