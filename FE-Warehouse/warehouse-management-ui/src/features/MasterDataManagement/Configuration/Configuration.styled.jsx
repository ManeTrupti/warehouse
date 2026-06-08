export const getConfigurationContainerStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: theme.colors.background.page || theme.colors.background.secondary,
  gap: theme.spacing.lg,
});

export const getTabsContainerStyles = (theme) => ({
  display: "flex",
  gap: "1px",
  borderBottom: `2px solid ${theme.colors.gray[200]}`,
  marginBottom: 0,
  paddingBottom: 0,
  overflowX: "auto",
  overflowY: "hidden",
  scrollbarWidth: "thin",
  scrollbarColor: `${theme.colors.gray[300]} transparent`,
});

export const getTabButtonStyles = (theme, isActive, isHovered = false) => {
  const baseStyles = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    border: "none",
    borderBottom: isActive
      ? `3px solid ${theme.colors.primary.DEFAULT}`
      : isHovered
      ? `3px solid ${theme.colors.primary[200]}`
      : "3px solid transparent",
    backgroundColor: isHovered && !isActive ? theme.colors.primary[50] : "transparent",
    color: isActive ? theme.colors.primary.DEFAULT : theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.base[0],
    fontWeight: isActive
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.normal,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
    transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
    position: "relative",
    bottom: "-2px",
    whiteSpace: "nowrap",
    minWidth: "fit-content",
    outline: "none",
  };

  if (isHovered && !isActive) {
    baseStyles.color = theme.colors.primary.DEFAULT;
  }

  return baseStyles;
};

export const getTabContentStyles = (theme) => ({
  flex: 1,
  overflow: "auto",
  minHeight: 0,
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.lg,
});

