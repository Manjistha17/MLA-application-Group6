import React from "react";
import '../styles/components/Header.public.css';
import DarkModeSharpIcon from '@mui/icons-material/DarkModeSharp';

const Header = () => {
  return (
    <header className="appHeader">
      <div className="headerLeft">
        <span className="appName">Shakti 360</span>
      </div>
      <div className="headerRight">
        {/* Theme toggle placeholder */}
        <DarkModeSharpIcon color="primary" />

      </div>
    </header>
  );
};

export default Header;
