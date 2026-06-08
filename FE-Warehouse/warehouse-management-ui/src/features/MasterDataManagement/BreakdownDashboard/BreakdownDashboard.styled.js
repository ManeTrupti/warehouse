export const getBreakdownContainerStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor:
    theme.colors.background.page || theme.colors.background.secondary,
  padding: theme.spacing.lg,
  gap: theme.spacing.lg,
});

export const getTabsContainerStyles = (theme) => ({
  display: "flex",
  gap: "1px",
  borderBottom: `2px solid ${theme.colors.gray[200]}`,
  overflowX: "auto",
});

export const getTabButtonStyles = (theme, isActive, isHovered = false) => ({
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  border: "none",
  borderBottom: isActive
    ? `3px solid ${theme.colors.primary.DEFAULT}`
    : isHovered
    ? `3px solid ${theme.colors.primary[200]}`
    : "3px solid transparent",
  backgroundColor:
    isHovered && !isActive ? theme.colors.primary[50] : "transparent",
  color: isActive
    ? theme.colors.primary.DEFAULT
    : theme.colors.text.secondary,
  fontSize: theme.typography.fontSize.base[0],
  cursor: "pointer",
  transition: "all 0.2s ease",
});

export const getTabContentStyles = (theme) => ({
  flex: 1,
  overflow: "auto",
  minHeight: 0,
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.lg,
});