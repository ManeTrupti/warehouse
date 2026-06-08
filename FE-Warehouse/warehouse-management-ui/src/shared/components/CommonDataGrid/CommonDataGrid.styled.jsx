
export const getDataGridContainerStyles = (theme) => ({
  backgroundColor: theme.colors.background.primary,
  borderRadius: theme.borderRadius.lg,
  boxShadow: theme.shadows.md,
  display: "flex",
  flexDirection: "column",
  height:"100%",
  overflowY:"auto"
});

export const getDataGridHeaderStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing.lg,
  borderBottom: `1px solid ${theme.colors.gray[200]}`,
});

export const getDataGridTitleStyles = (theme) => ({
  margin: 0,
  fontSize: theme.typography.fontSize.lg[0],
  lineHeight: theme.typography.fontSize.lg[1].lineHeight,
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.text.primary,
});

export const getDataGridActionsStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing.sm,
});

export const getTableStyles = (theme) => ({
  width: "100%",
  borderCollapse: "collapse",
  fontSize: theme.typography.fontSize.sm[0],
});

export const getTableHeaderStyles = (theme) => ({
  backgroundColor: theme.colors.gray[50],
});

export const getTableHeaderCellStyles = (theme) => ({
  padding: theme.spacing.md,
  textAlign: "left",
  fontWeight: theme.typography.fontWeight.semibold,
  color: theme.colors.text.primary,
  borderBottom: `2px solid ${theme.colors.gray[200]}`,
  fontSize: theme.typography.fontSize.sm[0],
  userSelect: "none",
});

export const getTableBodyStyles = (theme) => ({
});

export const getTableRowStyles = (theme, isClickable) => ({
  borderBottom: `1px solid ${theme.colors.gray[200]}`,
  cursor: isClickable ? "pointer" : "default",
  transition: `background-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
});

export const getTableCellStyles = (theme) => ({
  padding: theme.spacing.md,
  color: theme.colors.text.primary,
  fontSize: theme.typography.fontSize.sm[0],
});

export const getPaginationStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing.md,
  borderTop: `1px solid ${theme.colors.gray[200]}`,
  backgroundColor: theme.colors.gray[50],
});

export const getPaginationControlsStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.xs,
});

export const getFilterInputStyles = (theme) => ({
  width: "100%",
  padding: `${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.xl}`,
  borderRadius: theme.borderRadius.md,
  border: `1px solid ${theme.colors.gray[300]}`,
  fontSize: theme.typography.fontSize.sm[0],
  outline: "none",
  transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  "&:focus": {
    borderColor: theme.colors.primary.DEFAULT,
  },
});

export const getRowsPerPageStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.xs,
});
