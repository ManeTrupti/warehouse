export const getWorkstationsContainerStyles = (theme) => ({
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

export const getStatusBadgeStyles = (theme, status) => {
  const statusColors = {
    available: {
      backgroundColor: theme.colors.success[50],
      color: theme.colors.success[700],
      borderColor: theme.colors.success[200],
    },
    "in-use": {
      backgroundColor: theme.colors.info[50] || theme.colors.primary[50],
      color: theme.colors.info[700] || theme.colors.primary[700],
      borderColor: theme.colors.info[200] || theme.colors.primary[200],
    },
    bottleneck: {
      backgroundColor: theme.colors.error[50],
      color: theme.colors.error[700],
      borderColor: theme.colors.error[200],
    },
  };

  const colors = statusColors[status] || statusColors.available;

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

export const getEfficiencyStyles = (theme, efficiency) => {
  if (efficiency < 80) {
    return {
      color: theme.colors.error.DEFAULT,
      fontWeight: theme.typography.fontWeight.semibold,
    };
  } else if (efficiency < 90) {
    return {
      color: theme.colors.warning.DEFAULT,
      fontWeight: theme.typography.fontWeight.semibold,
    };
  }
  return {
    color: theme.colors.text.primary,
  };
};

export const getActionsCellStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
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

