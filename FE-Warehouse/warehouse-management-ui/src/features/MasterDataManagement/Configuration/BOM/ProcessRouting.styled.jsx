export const getProcessRoutingContainerStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.lg,
  padding: theme.spacing.lg,
});

export const getRoutingCardStyles = (theme, isExpanded = false) => ({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.lg,
  border: `1px solid ${theme.colors.gray[200]}`,
  boxShadow: theme.shadows.md,
  marginBottom: theme.spacing.lg,
  overflow: "hidden",
  transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
});

export const getRoutingCardHeaderStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing.lg,
  cursor: "pointer",
  borderBottom: `1px solid ${theme.colors.gray[200]}`,
});

export const getRoutingCardHeaderLeftStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  flex: 1,
});

export const getRoutingCardHeaderRightStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  fontSize: theme.typography.fontSize.sm[0],
  color: theme.colors.text.secondary,
});

export const getRoutingCardContentStyles = (theme) => ({
  padding: theme.spacing.lg,
  backgroundColor: theme.colors.gray[50],
});

export const getTimelineBarContainerStyles = (theme) => ({
  marginBottom: theme.spacing.xl,
  padding: theme.spacing.md,
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.md,
});

export const getTimelineBarStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  height: "3rem",
  borderRadius: theme.borderRadius.md,
  overflow: "hidden",
  marginBottom: theme.spacing.sm,
  position: "relative",
});

export const getTimelineSegmentStyles = (theme, color, width) => ({
  height: "100%",
  backgroundColor: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.colors.text.inverse,
  fontSize: theme.typography.fontSize.sm[0],
  fontWeight: theme.typography.fontWeight.medium,
  minWidth: "4rem",
  width: `${width}%`,
  transition: "width 0.3s ease",
});

export const getTimelineTotalStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: theme.spacing.sm,
});

export const getOperationsContainerStyles = (theme) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing.md,
  marginBottom: theme.spacing.lg,
  overflowX: "auto",
  padding: theme.spacing.md,
});

export const getOperationCardStyles = (theme) => ({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.lg,
  border: `1px solid ${theme.colors.gray[200]}`,
  padding: theme.spacing.lg,
  minWidth: "12rem",
  flexShrink: 0,
  boxShadow: theme.shadows.sm,
});

export const getOperationHeaderStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
  marginBottom: theme.spacing.md,
});

export const getOperationNumberStyles = (theme) => ({
  width: "2rem",
  height: "2rem",
  borderRadius: "50%",
  backgroundColor: theme.colors.primary.DEFAULT,
  color: theme.colors.text.inverse,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.fontSize.sm[0],
  fontWeight: theme.typography.fontWeight.semibold,
});

export const getOperationTitleStyles = (theme) => ({
  fontSize: theme.typography.fontSize.base[0],
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.text.primary,
});

export const getOperationStationStyles = (theme) => ({
  fontSize: theme.typography.fontSize.sm[0],
  color: theme.colors.text.secondary,
  marginBottom: theme.spacing.md,
});

export const getOperationDetailsStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.xs,
  marginBottom: theme.spacing.md,
});

export const getOperationDetailRowStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
  fontSize: theme.typography.fontSize.sm[0],
  color: theme.colors.text.secondary,
});

export const getOperationTotalStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  backgroundColor: theme.colors.gray[100],
  borderRadius: theme.borderRadius.md,
  fontSize: theme.typography.fontSize.sm[0],
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.text.primary,
});

export const getArrowConnectorStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.colors.primary.DEFAULT,
  flexShrink: 0,
  marginTop: theme.spacing.xl,
});

export const getRoutingActionsStyles = (theme) => ({
  display: "flex",
  gap: theme.spacing.sm,
  marginTop: theme.spacing.md,
  paddingTop: theme.spacing.md,
  borderTop: `1px solid ${theme.colors.gray[200]}`,
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

export const getBOMTabsContainerStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.md,
  borderBottom: `2px solid ${theme.colors.gray[200]}`,
  marginBottom: theme.spacing.lg,
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

export const getBOMTabButtonStyles = (theme, isActive) => ({
  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
  border: "none",
  backgroundColor: "transparent",
  borderBottom: `2px solid ${isActive ? theme.colors.primary.DEFAULT : "transparent"}`,
  color: isActive ? theme.colors.primary.DEFAULT : theme.colors.text.secondary,
  fontSize: theme.typography.fontSize.base[0],
  fontWeight: isActive
    ? theme.typography.fontWeight.semibold
    : theme.typography.fontWeight.medium,
  cursor: "pointer",
  transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  marginBottom: "-2px",
  "&:hover": {
    color: theme.colors.primary.DEFAULT,
  },
});

