import '../styles/components/Header.public.css';

const Header = () => {
  return (
    <header className="publicHeader">
      <div className="publicHeader__left">
        <span className="publicHeader__logo">
          <img src="/logo.png" alt="Shakti 360 Logo" />
        </span>
        <span className="publicHeader__name orangeText">Shakti 360</span>
      </div>

      <div className="publicHeader__right">
        {/* future actions (theme toggle, login, etc.) */}
      </div>
    </header>
  );
};

export default Header;
