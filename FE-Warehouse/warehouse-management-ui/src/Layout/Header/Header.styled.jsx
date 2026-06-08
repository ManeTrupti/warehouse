export const getHeaderStyles = (theme) => ({
  height: theme.dashboard.header.height,
  backgroundColor: "#ffffff",
  color: theme.colors.text.primary,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `0 ${theme.spacing.md}`,
  position: "sticky",
  top: 0,
  zIndex: 100,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  borderBottom: `1px solid ${theme.colors.gray[200]}`,
});

export const getLeftSectionStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
});

export const getLogoStyles = (theme) => ({
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: theme.colors.primary.DEFAULT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontSize: theme.typography.fontSize.base[0],
  fontWeight: theme.typography.fontWeight.bold,
  flexShrink: 0,
});

export const getLogoTextContainerStyles = (theme, isOpen) => ({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  opacity: isOpen ? 1 : 0,
  transition: `opacity ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
  overflow: "hidden",
});

export const getLogoTitleStyles = (theme) => ({
  fontSize: theme.typography.fontSize.xl[0],
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.text.primary,
  lineHeight: "1.2",
});

export const getLogoSubtitleStyles = (theme) => ({
  fontSize: theme.typography.fontSize.xs[0],
  fontWeight: theme.typography.fontWeight.normal,
  color: theme.colors.text.primary,
  lineHeight: "1.2",
});

export const getHamburgerButtonStyles = (theme, isOpen) => ({
  background: "none",
  border: "none",
  color: theme.colors.text.primary,
  cursor: "pointer",
  padding: theme.spacing.sm,
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
  width: "40px",
  height: "40px",
  marginLeft: isOpen ? theme.spacing.xs : theme.spacing.md,
});

export const getHamburgerIconStyles = (theme) => ({
  transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
});

export const getSearchContainerStyles = (theme) => ({
  flex: 1,
  maxWidth: "600px",
  margin: `0 ${theme.spacing.xl}`,
});

export const getSearchInputWrapperStyles = () => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const getSearchIconStyles = (theme) => ({
  position: "absolute",
  left: theme.spacing.md,
  color: theme.colors.gray[500],
  pointerEvents: "none",
});

export const getSearchInputStyles = (theme) => ({
  width: "100%",
  padding: `${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} 2.5rem`,
  borderRadius: "20px",
  border: "none",
  backgroundColor: theme.colors.gray[100],
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.sm[0],
  outline: "none",
  transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
});

export const getSearchInputFocusStyles = (theme) => ({
  backgroundColor: theme.colors.gray[50],
  boxShadow: `0 0 0 2px ${theme.colors.primary[100]}`,
});

export const getSearchInputBlurStyles = (theme) => ({
  backgroundColor: theme.colors.gray[100],
  boxShadow: "none",
});

export const getRightSectionStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
});

export const getIconButtonStyles = (theme) => ({
  background: "none",
  border: "none",
  color: theme.colors.text.primary,
  cursor: "pointer",
  padding: theme.spacing.xs,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.2s ease",
  width: "40px",
  height: "40px",
});

export const getNotificationButtonStyles = (theme) => ({
  ...getIconButtonStyles(theme),
  position: "relative",
});

export const getNotificationBadgeStyles = (theme) => ({
  position: "absolute",
  top: "4px",
  right: "4px",
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  backgroundColor: theme.colors.primary.DEFAULT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "10px",
  fontWeight: theme.typography.fontWeight.bold,
  color: "#ffffff",
  border: "none",
  minWidth: "16px",
});

export const getNotificationDropdownWrapperStyles = () => ({
  position: "relative",
});

const NOTIFICATION_VARIANT_STYLES = {
  error: {
    background: "#FCE9E9",
    titleColor: "#DD3131",
  },
  warning: {
    background: "#FFF5E1",
    titleColor: "#B77900",
  },
  info: {
    background: "#E3F2FC",
    titleColor: "#2196F3",
  },
};

export const getNotificationDropdownStyles = (theme, isVisible) => ({
  position: "absolute",
  top: "100%",
  right: 0,
  marginTop: theme.spacing.xs,
  minWidth: "320px",
  maxWidth: "360px",
  maxHeight: "400px",
  overflowY: "auto",
  backgroundColor: theme.colors.gray[100],
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  border: `1px solid ${theme.colors.gray[200]}`,
  padding: theme.spacing.md,
  zIndex: 1000,
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? "translateY(0)" : "translateY(-8px)",
  transition: `opacity ${theme.transitions.duration.slow} ${theme.transitions.easing.easeInOut}, transform ${theme.transitions.duration.slow} ${theme.transitions.easing.easeInOut}`,
});

export const getNotificationListHeaderStyles = (theme) => ({
  padding: `0 0 ${theme.spacing.sm} 0`,
  marginBottom: theme.spacing.sm,
  fontSize: theme.typography.fontSize.xs[0],
  fontWeight: theme.typography.fontWeight.bold,
  color: theme.colors.text.primary,
});

export const getNotificationItemStyles = (theme, type = "info") => {
  const variant =
    NOTIFICATION_VARIANT_STYLES[type] || NOTIFICATION_VARIANT_STYLES.info;
  return {
    display: "block",
    width: "100%",
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    background: variant.background,
    border: "none",
    borderRadius: "8px",
    fontSize: theme.typography.fontSize.xs[0],
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.primary,
    textAlign: "left",
    cursor: "pointer",
    transition: `opacity ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
    boxSizing: "border-box",
  };
};

export const getNotificationItemTitleStyles = (theme, type = "info") => {
  const variant =
    NOTIFICATION_VARIANT_STYLES[type] || NOTIFICATION_VARIANT_STYLES.info;
  return {
    fontSize: theme.typography.fontSize.xs[0],
    fontWeight: theme.typography.fontWeight.bold,
    color: variant.titleColor,
    marginBottom: "4px",
    lineHeight: 1.3,
  };
};

export const getNotificationItemDescriptionStyles = (theme) => ({
  fontSize: theme.typography.fontSize.xs[0],
  fontWeight: theme.typography.fontWeight.normal,
  color: theme.colors.text.primary,
  lineHeight: 1.3,
});

export const getUserProfileStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
  padding: `${theme.spacing.xs} 0`,
  cursor: "pointer",
  transition: "background-color 0.2s ease",
});

export const getUserAvatarStyles = (theme) => ({
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: theme.colors.primary.DEFAULT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  flexShrink: 0,
});

export const getUserNameStyles = (theme) => ({
  fontSize: theme.typography.fontSize.sm[0],
  fontWeight: theme.typography.fontWeight.medium,
  color: theme.colors.text.primary,
  whiteSpace: "nowrap",
});

export const getHoverBackgroundColor = (theme) => theme.colors.gray[100];

export const getUserMenuWrapperStyles = () => ({
  position: "relative",
});

export const getUserMenuButtonStyles = (theme) => ({
  ...getUserProfileStyles(theme),
  background: "none",
  border: "none",
  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  borderRadius: "8px",
});

export const getUserMenuDropdownStyles = (theme, isVisible) => ({
  position: "absolute",
  top: "100%",
  right: 0,
  marginTop: theme.spacing.xs,
  minWidth: "100px",
  backgroundColor: theme.colors.gray[100],
  borderRadius: "20px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  border: `1px solid ${theme.colors.gray[100]}`,
  padding: theme.spacing.xs,
  zIndex: 1000,
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? "translateY(0)" : "translateY(-8px)",
  transition: `opacity ${theme.transitions.duration.slow} ${theme.transitions.easing.easeInOut}, transform ${theme.transitions.duration.slow} ${theme.transitions.easing.easeInOut}`,
});

export const getUserMenuItemStyles = (theme, hasBorderTop = false) => ({
  display: "block",
  width: hasBorderTop ? `calc(100% + 2 * ${theme.spacing.xs})` : "100%",
  marginLeft: hasBorderTop ? `-${theme.spacing.xs}` : undefined,
  marginRight: hasBorderTop ? `-${theme.spacing.xs}` : undefined,
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  marginTop: hasBorderTop ? theme.spacing.xs : undefined,
  background: "none",
  border: "none",
  borderTop: hasBorderTop ? `1px solid ${theme.colors.gray[200]}` : undefined,
  borderRadius: hasBorderTop ? 0 : "6px",
  fontSize: theme.typography.fontSize.xs[0],
  fontWeight: theme.typography.fontWeight.normal,
  color: theme.colors.text.primary,
  textAlign: "left",
  cursor: "pointer",
  transition: `background-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
});

export const getUserMenuItemHoverStyles = (theme) => ({
  backgroundColor: theme.colors.gray[100],
});
