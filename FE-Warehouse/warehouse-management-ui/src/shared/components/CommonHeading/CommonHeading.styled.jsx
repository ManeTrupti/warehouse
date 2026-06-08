export const getHeadingContainerStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: theme.spacing.lg,
  paddingLeft: theme.spacing.lg,
  paddingRight: theme.spacing.lg,
  paddingBottom: theme.spacing.md,
  gap: theme.spacing.lg,
  backgroundColor: "#f5f5f5", // match Dashboard content area
});

export const getTextContainerStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.xs,
  minWidth: 0,
});

export const getTitleStyles = (theme) => ({
  margin: 0,
  fontSize: theme.typography.fontSize["2xl"][0],
  lineHeight: theme.typography.fontSize["2xl"][1].lineHeight,
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.text.primary,
});

export const getSubtitleStyles = (theme) => ({
  margin: 0,
  fontSize: theme.typography.fontSize.sm[0],
  lineHeight: theme.typography.fontSize.sm[1].lineHeight,
  color: theme.colors.text.secondary,
});

export const getRightSectionStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.sm,
  marginLeft: "auto",
});
