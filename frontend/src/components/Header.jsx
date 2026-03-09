import '../styles/components/Header.public.css';
import { Typography } from "@mui/material";

const Header = () => {
  return (
    <header className="publicHeader">
      <div className="publicHeader__left">
        <span className="publicHeader__logo">
          <img src="/logo.png" alt="Shakti 360 Logo" />
        </span>
        <Typography component="span" sx={{ fontWeight: 800, color: "#111827" }}>Shakti°</Typography>
        <Typography component="span" sx={{ fontWeight: 400, color: "#111827" }}>360</Typography>
      </div>

      <div className="publicHeader__right">
        {/* future actions (theme toggle, login, etc.) */}
      </div>
    </header>
  );
};

export default Header;
