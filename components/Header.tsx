
import React from 'react';

interface HeaderProps {
    onTitleClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onTitleClick }) => {
  return (
    <header className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 
            onClick={onTitleClick}
            className="text-4xl sm:text-5xl font-extrabold tracking-wider text-dark cursor-pointer"
            >
            NATSU'S BLOG
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
