// Shared style tokens for Group components — import from here
export const cardSx = {
  borderRadius: "var(--radius-lg)",
  backgroundColor: "var(--color-bg-surface)",
  border: "1px solid var(--color-border-subtle)",
  boxShadow: "var(--shadow-sm)",
};

export const hdrSx = {
  fontWeight: 700,
  fontFamily: "var(--font-family-base)",
  color: "var(--color-text-primary)",
  fontSize: "var(--font-size-md)",
};

export const mutedSx = {
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-family-base)",
  fontSize: "var(--font-size-sm)",
};

export const primaryBtnSx = {
  bgcolor: "var(--color-primary)",
  borderRadius: "var(--radius-md)",
  textTransform: "none",
  fontFamily: "var(--font-family-base)",
  fontWeight: 600,
  boxShadow: "none",
  "& .MuiButton-startIcon svg": { color: "inherit" },
  "& .MuiButton-endIcon svg": { color: "inherit" },
  "&:hover": { bgcolor: "var(--color-primary-hover)", boxShadow: "none" },
};

export const outlinedBtnSx = {
  borderColor: "var(--color-border-subtle)",
  color: "var(--color-text-secondary)",
  borderRadius: "var(--radius-md)",
  textTransform: "none",
  fontFamily: "var(--font-family-base)",
  fontWeight: 600,
  // Icons always inherit the button's text color — no need to set it per-button
  "& .MuiButton-startIcon svg": { color: "inherit" },
  "& .MuiButton-endIcon svg": { color: "inherit" },
  "&:hover": { borderColor: "var(--color-primary)", color: "var(--color-primary)", bgcolor: "var(--color-primary-soft)" },
};

export const primaryBtnSxWithIcon = {
  // Same as primaryBtnSx but icon explicitly inherits white
  "& .MuiButton-startIcon svg": { color: "inherit" },
  "& .MuiButton-endIcon svg": { color: "inherit" },
};

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--color-bg-muted)",
    fontSize: "13px",
    color: "var(--color-text-primary)",
    "& fieldset": { borderColor: "var(--color-border-subtle)" },
    "&:hover fieldset": { borderColor: "var(--color-primary)" },
    "&.Mui-focused fieldset": { borderColor: "var(--color-primary)", borderWidth: "2px" },
  },
  "& .MuiInputBase-input": { color: "var(--color-text-primary)", py: "7px" },
  "& .MuiInputAdornment-root svg": { color: "var(--color-text-muted)", fontSize: "16px" },
};

// Icon color tokens matching OverviewTab stat cards
export const C = {
  groups: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6" }, // purple
  join:   { bg: "rgba(16,185,129,0.12)",  color: "#10b981" }, // green
  create: { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" }, // amber
};