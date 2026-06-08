export const getButtonStyles = (theme, size, fullWidth, isDisabled) => {
  const sizeStyles = {
    xs: {
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      fontSize: theme.typography.fontSize.xs[0],
      lineHeight: theme.typography.fontSize.xs[1].lineHeight,
    },
    sm: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.typography.fontSize.sm[0],
      lineHeight: theme.typography.fontSize.sm[1].lineHeight,
    },
    md: {
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSize.base[0],
      lineHeight: theme.typography.fontSize.base[1].lineHeight,
    },
    lg: {
      padding: `${theme.spacing.md} ${theme.spacing.xl}`,
      fontSize: theme.typography.fontSize.lg[0],
      lineHeight: theme.typography.fontSize.lg[1].lineHeight,
    },
  };

  return {
    ...sizeStyles[size] || sizeStyles.md,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    // Pill-shaped buttons (approximately 50% / fully rounded)
    borderRadius: theme.borderRadius.full,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: isDisabled ? "not-allowed" : "pointer",
    border: "none",
    outline: "none",
    transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
    width: fullWidth ? "100%" : "auto",
    minWidth: "fit-content",
    opacity: isDisabled ? 0.6 : 1,
  };
};

export const getButtonVariantStyles = (theme, variant, isDisabled, isHovered) => {
  const baseStyles = {
    primary: {
      backgroundColor: theme.colors.primary.DEFAULT,
      color: theme.colors.text.inverse,
    },
    secondary: {
      // Smoky white / gray secondary button, matching subtle Import/Export style
      backgroundColor: theme.colors.gray[50],
      color: theme.colors.gray[700],
      border: `1px solid ${theme.colors.gray[300]}`,
    },
    success: {
      backgroundColor: theme.colors.success.DEFAULT,
      color: theme.colors.text.inverse,
    },
    danger: {
      backgroundColor: theme.colors.error.DEFAULT,
      color: theme.colors.text.inverse,
    },
    warning: {
      backgroundColor: theme.colors.warning.DEFAULT,
      color: theme.colors.text.inverse,
    },
    outline: {
      backgroundColor: "transparent",
      color: theme.colors.primary.DEFAULT,
      border: `1px solid ${theme.colors.primary.DEFAULT}`,
    },
    ghost: {
      backgroundColor: "transparent",
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.gray[300]}`,
    },
  };

  const variantStyle = baseStyles[variant] || baseStyles.primary;

  if (isDisabled) {
    return {
      ...variantStyle,
      backgroundColor: variant === "outline" || variant === "ghost" 
        ? "transparent" 
        : theme.colors.gray[300],
      color: variant === "outline" || variant === "ghost"
        ? theme.colors.text.disabled
        : theme.colors.text.inverse,
      borderColor: variant === "outline" || variant === "ghost"
        ? theme.colors.gray[300]
        : "transparent",
    };
  }

  if (isHovered) {
    const hoverStyles = {
      primary: {
        backgroundColor: theme.colors.primary[600],
      },
      secondary: {
        // Slightly darker gray on hover, staying in the same neutral family
        backgroundColor: theme.colors.gray[100],
        border: `1px solid ${theme.colors.gray[400]}`,
        color: theme.colors.gray[800],
      },
      success: {
        backgroundColor: theme.colors.success[600],
      },
      danger: {
        backgroundColor: theme.colors.error[600],
      },
      warning: {
        backgroundColor: theme.colors.warning[600],
      },
      outline: {
        backgroundColor: theme.colors.primary[50],
      },
      ghost: {
        backgroundColor: theme.colors.gray[100],
      },
    };

    return {
      ...variantStyle,
      ...hoverStyles[variant],
    };
  }

  return variantStyle;
};

