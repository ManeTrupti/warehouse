export const getProductionLossReasonsContainerStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
  padding: theme.spacing.lg,
});

export const getSearchFilterBarStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  marginBottom: theme.spacing.md,
  width: "100%",
  flexWrap: "nowrap",
});

export const getSearchInputContainerStyles = (theme) => ({
  position: "relative",
  flex: 1,
  maxWidth: "20rem",
});

export const getSearchInputStyles = (theme, isFocused = false) => ({
  width: "100%",
  padding: `${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.xl}`,
  borderRadius: theme.borderRadius.md,
  border: `1px solid ${
    isFocused ? theme.colors.primary.DEFAULT : theme.colors.gray[300]
  }`,
  fontSize: theme.typography.fontSize.sm[0],
  outline: "none",
  transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  color: theme.colors.text.primary,
});

export const getFormContainerStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
});

export const getFormRowStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.xs,
});

export const getFormLabelStyles = (theme) => ({
  fontSize: theme.typography.fontSize.sm[0],
  fontWeight: theme.typography.fontWeight.medium,
  color: theme.colors.text.primary,
});

export const getFormInputStyles = (
  theme,
  isFocused = false,
  hasError = false,
) => ({
  width: "100%",
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  borderRadius: theme.borderRadius.md,
  border: `1px solid ${
    hasError
      ? theme.colors.error?.[300] || "#FCA5A5"
      : isFocused
        ? theme.colors.primary.DEFAULT
        : theme.colors.gray[300]
  }`,
  fontSize: theme.typography.fontSize.sm[0],
  outline: "none",
  transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  fontFamily: theme.typography.fontFamily.body,
  boxShadow: isFocused ? `0 0 0 3px ${theme.colors.primary[50]}` : "none",
  color: theme.colors.text.primary,
});

export const getEditIconStyles = (theme) => ({
  width: "1rem",
  height: "1rem",
  color: theme.colors.text.secondary || theme.colors.gray[500],
});

export const getDeleteIconStyles = (theme) => ({
  width: "1rem",
  height: "1rem",
  color: theme.colors.error.DEFAULT,
});

export const getActionsCellStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
});

