export const mergeSidebarItemsWithIcons = (items, menuIcons, defaultItems) => {
    if (items.length > 0) {
        return items.map((item) => ({
            ...item,
            icon: item.icon || menuIcons[item.id] || null,
        }));
    }
    return defaultItems;
};

export const handleMenuItemHoverEnter = (event, isActive) => {
    if (!isActive) {
        const hoverStyles = {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateX(2px)',
        };
        Object.assign(event.target.style, hoverStyles);
    }
};

export const handleMenuItemHoverLeave = (event, isActive) => {
    if (!isActive) {
        const leaveStyles = {
            backgroundColor: 'transparent',
            transform: 'translateX(0)',
        };
        Object.assign(event.target.style, leaveStyles);
    }
};

export const getSidebarDimensions = (isOpen, config, spacing) => ({
    width: isOpen ? config.EXPANDED_WIDTH : config.COLLAPSED_WIDTH,
    padding: isOpen ? spacing.md : spacing.sm,
});

