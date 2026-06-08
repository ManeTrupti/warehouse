export const getProductsContainerStyles = (theme) => ({
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
  border: `1px solid ${isFocused ? theme.colors.primary.DEFAULT : theme.colors.gray[300]}`,
  fontSize: theme.typography.fontSize.sm[0],
  outline: "none",
  transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  color: theme.colors.text.primary,
});

export const getCategorySelectStyles = (theme, isFocused = false) => ({
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  paddingRight: theme.spacing.xl,
  borderRadius: theme.borderRadius.md,
  border: `1px solid ${isFocused ? theme.colors.primary.DEFAULT : theme.colors.gray[300]}`,
  fontSize: theme.typography.fontSize.sm[0],
  outline: "none",
  cursor: "pointer",
  backgroundColor: theme.colors.background.primary,
  color: theme.colors.text.primary,
  transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  minWidth: "10rem",
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

export const getFormInputStyles = (theme, isFocused = false) => ({
  width: "100%",
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  borderRadius: theme.borderRadius.md,
  border: `1px solid ${isFocused ? theme.colors.primary.DEFAULT : theme.colors.gray[300]}`,
  fontSize: theme.typography.fontSize.sm[0],
  outline: "none",
  transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  fontFamily: theme.typography.fontFamily.body,
  boxShadow: isFocused ? `0 0 0 3px ${theme.colors.primary[50]}` : "none",
  color: theme.colors.text.primary,
});

export const getFormSelectStyles = (theme, isFocused = false) => ({
  width: "100%",
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  paddingRight: theme.spacing.xl,
  borderRadius: theme.borderRadius.md,
  border: `1px solid ${isFocused ? theme.colors.primary.DEFAULT : theme.colors.gray[300]}`,
  fontSize: theme.typography.fontSize.sm[0],
  outline: "none",
  cursor: "pointer",
  backgroundColor: theme.colors.background.primary,
  color: theme.colors.text.primary,
  fontFamily: theme.typography.fontFamily.body,
  transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  boxShadow: isFocused ? `0 0 0 3px ${theme.colors.primary[50]}` : "none",
});

export const getCategoryBadgeStyles = (theme, category) => {
  const categoryColors = {
    Engine: {
      backgroundColor: theme.colors.primary[50],
      color: theme.colors.primary[700],
      borderColor: theme.colors.primary[200],
    },
    Axle: {
      backgroundColor: theme.colors.secondary[50],
      color: theme.colors.secondary[700],
      borderColor: theme.colors.secondary[200],
    },
  };

  const colors = categoryColors[category] || {
    backgroundColor: theme.colors.gray[50],
    color: theme.colors.gray[700],
    borderColor: theme.colors.gray[200],
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing.xs,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs[0],
    fontWeight: theme.typography.fontWeight.medium,
    backgroundColor: colors.backgroundColor,
    color: colors.color,
    border: `1px solid ${colors.borderColor}`,
  };
};

export const getStatusBadgeStyles = (theme, status) => {
  const statusColors = {
    Active: {
      backgroundColor: theme.colors.success[50],
      color: theme.colors.success[700],
      borderColor: theme.colors.success[200],
    },
    Inactive: {
      backgroundColor: theme.colors.gray[50],
      color: theme.colors.gray[700],
      borderColor: theme.colors.gray[200],
    },
  };

  const colors = statusColors[status] || statusColors.Inactive;

  return {
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.xs[0],
    fontWeight: theme.typography.fontWeight.medium,
    backgroundColor: colors.backgroundColor,
    color: colors.color,
    border: `1px solid ${colors.borderColor}`,
    cursor: "default",
  };
};

export const getActionButtonStyles = (theme, variant = "default") => {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    border: "none",
    outline: "none",
    cursor: "pointer",
    transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
    backgroundColor: "transparent",
  };

  if (variant === "delete") {
    return {
      ...baseStyles,
      color: theme.colors.error.DEFAULT,
      "&:hover": {
        backgroundColor: theme.colors.error[50],
        color: theme.colors.error[700],
      },
    };
  }

  return {
    ...baseStyles,
    color: theme.colors.text.secondary,
    "&:hover": {
      backgroundColor: theme.colors.gray[100],
      color: theme.colors.text.primary,
    },
  };
};

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

