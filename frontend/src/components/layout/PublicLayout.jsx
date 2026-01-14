import React from "react";
import Header from "../Header";
import '../../styles/components/PublicLayout.css';

const PublicLayout = ({ children }) => {
  return (
    <div className="publicLayout">
      <Header />
      <main className="publicContent">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
