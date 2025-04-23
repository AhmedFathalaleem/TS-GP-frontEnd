import React from 'react';

interface NavBarProps {
  setActiveSection: React.Dispatch<React.SetStateAction<number>>;
}

const NavBar: React.FC<NavBarProps> = ({ setActiveSection }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl text-white font-semibold mb-4">Navigation</h2>
      <ul>
        <li
          className="cursor-pointer hover:bg-gray-700 p-3 rounded text-lg"
          onClick={() => setActiveSection(0)}
        >
          Dashboard
        </li>
        <li
          className="cursor-pointer hover:bg-gray-700 p-3 rounded text-lg"
          onClick={() => setActiveSection(1)}
        >
          Profile
        </li>
        <li
          className="cursor-pointer hover:bg-gray-700 p-3 rounded text-lg"
          onClick={() => setActiveSection(2)}
        >
          Messages
        </li>
        <li
          className="cursor-pointer hover:bg-gray-700 p-3 rounded text-lg"
          onClick={() => setActiveSection(3)}
        >
          Settings
        </li>
      </ul>
    </div>
  );
};

export default NavBar;
