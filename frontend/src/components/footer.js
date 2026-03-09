import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{
      textAlign: "center",
      padding: "12px",
      fontSize: "12px",
      width: "100%",
      backgroundColor: "var(--color-bg-main)",
      borderTop: "1px solid var(--color-border-subtle)",
      color: "var(--color-text-muted)",
    }}>
      <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
        © Copyright by Code First Girls 2026
      </Typography>
    </Box>
  );
};

export default Footer;