export const getExportContainerStyles = (theme) => ({
  position: "relative",
  display: "inline-block",
});

export const getExportButtonStyles = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing.sm,
  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  // Match global pill-shaped button radius
  borderRadius: theme.borderRadius.full,
  border: `1px solid ${theme.colors.gray[300]}`,
  backgroundColor: theme.colors.background.primary,
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.sm[0],
  fontWeight: theme.typography.fontWeight.medium,
  cursor: "pointer",
  transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  outline: "none",
  "&:hover": {
    backgroundColor: theme.colors.gray[50],
    borderColor: theme.colors.gray[400],
  },
});

export const getExportMenuStyles = (theme) => ({
  position: "absolute",
  top: "100%",
  right: 0,
  marginTop: theme.spacing.xs,
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.md,
  boxShadow: theme.shadows.lg,
  border: `1px solid ${theme.colors.gray[200]}`,
  minWidth: "12rem",
  zIndex: theme.zIndex.dropdown,
  overflow: "hidden",
});

export const getExportMenuItemStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
  width: "100%",
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  border: "none",
  backgroundColor: "transparent",
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.sm[0],
  textAlign: "left",
  cursor: "pointer",
  transition: `background-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  outline: "none",
  "&:hover": {
    backgroundColor: theme.colors.gray[50],
  },
  "&:not(:last-child)": {
    borderBottom: `1px solid ${theme.colors.gray[200]}`,
  },
});

