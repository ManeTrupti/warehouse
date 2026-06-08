export const handleSearchInputFocus = (event, theme) => {
  const focusStyles = {
    backgroundColor: theme.colors.gray[50],
    boxShadow: `0 0 0 2px ${theme.colors.primary[100]}`,
  };
  Object.assign(event.target.style, focusStyles);
};

export const handleSearchInputBlur = (event, theme) => {
  const blurStyles = {
    backgroundColor: theme.colors.gray[100],
    boxShadow: 'none',
  };
  Object.assign(event.target.style, blurStyles);
};

export const handleButtonHoverEnter = (event, theme) => {
  event.target.style.backgroundColor = theme.colors.gray[100];
};

export const handleButtonHoverLeave = (event) => {
  event.target.style.backgroundColor = 'transparent';
};

