export const getBackdropStyles = (theme) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: theme.zIndex.modalBackdrop,
  padding: theme.spacing.lg,
});

export const getDialogContainerStyles = (theme) => ({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.xl,
  boxShadow: theme.shadows["2xl"],
  width: "100%",
  maxWidth: "28rem", // 448px
  maxHeight: "90vh",
  overflow: "hidden",
  zIndex: theme.zIndex.modal,
  animation: "fadeIn 0.2s ease-out",
});

export const getDialogContentStyles = (theme) => ({
  padding: theme.spacing.xl,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
});

export const getDialogHeaderStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const getDialogTitleStyles = (theme) => ({
  margin: 0,
  fontSize: theme.typography.fontSize.lg[0],
  lineHeight: theme.typography.fontSize.lg[1].lineHeight,
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.text.primary,
});

export const getDialogMessageStyles = (theme) => ({
  margin: 0,
  fontSize: theme.typography.fontSize.base[0],
  lineHeight: theme.typography.fontSize.base[1].lineHeight,
  color: theme.colors.text.secondary,
});

export const getDialogActionsStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing.md,
  marginTop: theme.spacing.sm,
});

export const getButtonStyles = (theme) => ({
  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  // Match global pill-shaped button radius
  borderRadius: theme.borderRadius.full,
  fontSize: theme.typography.fontSize.sm[0],
  lineHeight: theme.typography.fontSize.sm[1].lineHeight,
  fontWeight: theme.typography.fontWeight.medium,
  cursor: "pointer",
  border: "none",
  transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
  outline: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "5rem",
});

export const getCancelButtonStyles = (theme, isDisabled, isHovered) => {
  const baseStyles = {
    ...getButtonStyles(theme),
    backgroundColor: theme.colors.background.secondary,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.gray[300]}`,
  };

  if (isDisabled) {
    return {
      ...baseStyles,
      opacity: 0.5,
      cursor: "not-allowed",
    };
  }

  if (isHovered) {
    return {
      ...baseStyles,
      backgroundColor: theme.colors.gray[200],
      borderColor: theme.colors.gray[400],
    };
  }

  return baseStyles;
};

export const getConfirmButtonStyles = (theme, isDisabled, isHovered) => {
  const baseStyles = {
    ...getButtonStyles(theme),
    backgroundColor: theme.colors.error.DEFAULT,
    color: theme.colors.text.inverse || "#ffffff",
  };

  if (isDisabled) {
    return {
      ...baseStyles,
      opacity: 0.5,
      cursor: "not-allowed",
    };
  }

  if (isHovered) {
    return {
      ...baseStyles,
      backgroundColor: theme.colors.error[600],
    };
  }

  return baseStyles;
};

