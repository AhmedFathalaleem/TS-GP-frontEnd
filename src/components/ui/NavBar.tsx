import React from 'react';

interface NavBarProps {
  setActiveSection: (section: number) => void;
  newAtRiskNotification: boolean;
}


const NavBar: React.FC<NavBarProps> = ({ setActiveSection, newAtRiskNotification }) => {
  return (
    <div className="flex flex-col w-64 bg-[#4169E1] text-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Heart Attack Prediction App</h1>
      <div className="border-t border-white opacity-50 mx-2" />
      <ul className="space-y-4">
        <li
          className="cursor-pointer hover:bg-[#8fa9f7] hover:text-black p-3 rounded text-lg font-bold"
          onClick={() => setActiveSection(0)}
        >
          Home
        </li>
        
        
        <li
          className="relative cursor-pointer hover:bg-[#8fa9f7] hover:text-black p-3 rounded text-lg font-bold"
          onClick={() => setActiveSection(2)}
        >
          Messages
          {newAtRiskNotification && (
            <span className="absolute top-2 right-3 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </li>
      </ul>
    </div>
  );
};


export default NavBar;
