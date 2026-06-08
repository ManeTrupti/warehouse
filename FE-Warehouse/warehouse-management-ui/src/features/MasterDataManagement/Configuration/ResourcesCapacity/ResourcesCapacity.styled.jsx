export const getResourcesContainerStyles = (theme) => ({
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

export const getWorkCenterCardStyles = (theme, isExpanded = false) => ({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.lg,
  border: `1px solid ${theme.colors.gray[200]}`,
  boxShadow: theme.shadows.md,
  marginBottom: theme.spacing.md,
  overflow: "hidden",
  transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
});

export const getWorkCenterCardHeaderStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing.lg,
  cursor: "pointer",
  borderBottom: `1px solid ${theme.colors.gray[200]}`,
});

export const getWorkCenterCardHeaderLeftStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  flex: 1,
});

export const getWorkCenterCardHeaderRightStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
});

export const getWorkCenterCardContentStyles = (theme) => ({
  padding: theme.spacing.lg,
  backgroundColor: theme.colors.gray[50],
});

export const getStatusBadgeStyles = (theme, status) => {
  const statusColors = {
    available: {
      backgroundColor: theme.colors.success[50],
      color: theme.colors.success[700],
      borderColor: theme.colors.success[200],
    },
    "in-use": {
      backgroundColor: theme.colors.primary[50],
      color: theme.colors.primary[700],
      borderColor: theme.colors.primary[200],
    },
    bottleneck: {
      backgroundColor: theme.colors.error[50],
      color: theme.colors.error[700],
      borderColor: theme.colors.error[200],
    },
  };

  const colors = statusColors[status] || {
    backgroundColor: theme.colors.gray[50],
    color: theme.colors.gray[700],
    borderColor: theme.colors.gray[200],
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs[0],
    fontWeight: theme.typography.fontWeight.medium,
    backgroundColor: colors.backgroundColor,
    color: colors.color,
    border: `1px solid ${colors.borderColor}`,
  };
};

export const getProgressBarContainerStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
  minWidth: "12rem",
});

export const getProgressBarStyles = (theme, percentage) => ({
  flex: 1,
  height: "0.5rem",
  backgroundColor: theme.colors.gray[200],
  borderRadius: theme.borderRadius.full,
  overflow: "hidden",
  position: "relative",
});

export const getProgressBarFillStyles = (theme, percentage) => {
  let color = theme.colors.primary.DEFAULT;
  if (percentage >= 90) {
    color = theme.colors.error.DEFAULT;
  } else if (percentage >= 70) {
    color = theme.colors.warning.DEFAULT;
  }

  return {
    height: "100%",
    width: `${percentage}%`,
    backgroundColor: color,
    transition: `width ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
  };
};

export const getWorkstationTableStyles = (theme) => ({
  width: "100%",
  borderCollapse: "collapse",
  marginTop: theme.spacing.md,
});

export const getWorkstationTableHeaderStyles = (theme) => ({
  backgroundColor: theme.colors.gray[100],
  borderBottom: `2px solid ${theme.colors.gray[200]}`,
});

export const getWorkstationTableHeaderCellStyles = (theme) => ({
  padding: theme.spacing.sm,
  textAlign: "left",
  fontSize: theme.typography.fontSize.sm[0],
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.text.secondary,
});

export const getWorkstationTableRowStyles = (theme) => ({
  borderBottom: `1px solid ${theme.colors.gray[200]}`,
  "&:hover": {
    backgroundColor: theme.colors.gray[50],
  },
});

export const getWorkstationTableCellStyles = (theme) => ({
  padding: theme.spacing.md,
  fontSize: theme.typography.fontSize.sm[0],
  color: theme.colors.text.primary,
});

export const getEfficiencyStyles = (theme, efficiency) => {
  let color = theme.colors.success.DEFAULT;
  if (efficiency < 80) {
    color = theme.colors.error.DEFAULT;
  } else if (efficiency < 90) {
    color = theme.colors.warning.DEFAULT;
  }

  return {
    color,
    fontWeight: theme.typography.fontWeight.medium,
  };
};

export const getActionsCellStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
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
  backgroundColor: theme.colors.background.primary,
});

