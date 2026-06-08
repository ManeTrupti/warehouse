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

export const getModalContainerStyles = (theme, size) => {
  const sizeMap = {
    sm: { maxWidth: "24rem" }, // 384px
    md: { maxWidth: "32rem" }, // 512px
    lg: { maxWidth: "48rem" }, // 768px
    xl: { maxWidth: "64rem" }, // 1024px
    "2xl": { maxWidth: "80rem" }, // 1280px
    full: { maxWidth: "90vw", width: "90vw" },
  };

  return {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows["2xl"],
    width: "100%",
    maxHeight: "90vh",
    overflow: "hidden",
    zIndex: theme.zIndex.modal,
    display: "flex",
    flexDirection: "column",
    ...sizeMap[size] || sizeMap.md,
  };
};

export const getModalContentStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  maxHeight: "90vh",
});

export const getModalHeaderStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing.xl,
  paddingBottom: theme.spacing.lg,
  borderBottom: `1px solid ${theme.colors.gray[200]}`,
});

export const getModalTitleStyles = (theme) => ({
  margin: 0,
  fontSize: theme.typography.fontSize.xl[0],
  lineHeight: theme.typography.fontSize.xl[1].lineHeight,
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.text.primary,
});

export const getModalBodyStyles = (theme) => ({
  padding: theme.spacing.xl,
  overflowY: "auto",
  flex: 1,
});

export const getModalFooterStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing.md,
  padding: theme.spacing.xl,
  paddingTop: theme.spacing.lg,
  borderTop: `1px solid ${theme.colors.gray[200]}`,
});

export const getCloseButtonStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
  // Slightly more rounded to echo pill buttons on icon-only close control
  borderRadius: theme.borderRadius.full,
  border: "none",
  backgroundColor: "transparent",
  color: theme.colors.text.secondary,
  cursor: "pointer",
  transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  outline: "none",
  padding: 0,
});

