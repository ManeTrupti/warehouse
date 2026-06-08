export const getImportContainerStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.md,
});

export const getImportDropzoneStyles = (theme) => ({
  border: `2px dashed ${theme.colors.gray[300]}`,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing["2xl"],
  textAlign: "center",
  cursor: "pointer",
  transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
  backgroundColor: theme.colors.background.secondary,
  "&:hover": {
    borderColor: theme.colors.primary.DEFAULT,
    backgroundColor: theme.colors.primary[50],
  },
});

export const getImportDropzoneActiveStyles = (theme) => ({
  borderColor: theme.colors.primary.DEFAULT,
  backgroundColor: theme.colors.primary[50],
  borderStyle: "solid",
});

export const getImportButtonStyles = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing.sm,
  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  // Match global pill-shaped button radius
  borderRadius: theme.borderRadius.full,
  border: `1px solid ${theme.colors.primary.DEFAULT}`,
  backgroundColor: theme.colors.primary.DEFAULT,
  color: theme.colors.text.inverse,
  fontSize: theme.typography.fontSize.sm[0],
  fontWeight: theme.typography.fontWeight.medium,
  cursor: "pointer",
  transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  outline: "none",
  "&:hover": {
    backgroundColor: theme.colors.primary[600],
  },
});

export const getFileListStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.sm,
  marginTop: theme.spacing.md,
  width: "100%",
});

export const getFileItemStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing.md,
  backgroundColor: theme.colors.background.primary,
  border: `1px solid ${theme.colors.gray[200]}`,
  borderRadius: theme.borderRadius.lg,
  transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  width: "100%",
  boxSizing: "border-box",
});

export const getFilePreviewStyles = (theme) => ({
  width: "3rem",
  height: "3rem",
  borderRadius: theme.borderRadius.lg,
  objectFit: "cover",
  border: `1px solid ${theme.colors.gray[200]}`,
});

export const getFileActionsStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.xs,
});

export const getPreviewModalStyles = (theme) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: theme.zIndex.modal,
  padding: theme.spacing.lg,
});

