import { useState, useCallback, useMemo, useEffect } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../SidebarContext";
import {
  MenuIcons,
  DEFAULT_SIDEBAR_ITEMS,
  PRODUCTION_DATA_ITEMS,
} from "./Sidebar.constants";
import { mergeSidebarItemsWithIcons } from "./Sidebar.utilities";
import { SidebarStyles } from "./Sidebar.styled";

const Styles = SidebarStyles;

export function Sidebar({ items = [], onItemClick, defaultActiveId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();

  const role = localStorage.getItem("userRole");

  // Determine which menu to show based on current route
  // const getMenuItems = useCallback(() => {
  //   const path = location.pathname;

  //   if (path.includes("/inventory")) {
  //     return PRODUCTION_DATA_ITEMS;
  //   }

  //   return PRODUCTION_DATA_ITEMS;
  // }, [location.pathname]);

  const getMenuItems = useCallback(() => {
  const allItems = PRODUCTION_DATA_ITEMS;
  const role = localStorage.getItem("userRole");

  if (role === "admin") {
    return allItems;
  }

  if (role === "manager") {
    return allItems.filter((item) =>
      ["stock-requests", "requisition", "stock-issue"].includes(item.id)
    );
  }

  if (role === "operator") {
    return allItems.filter((item) =>
      ["rack-allocation", "product-transfer"].includes(item.id)
    );
  }

  return allItems;
}, [location.pathname]);

  // Get current menu items
  const currentMenuItems = useMemo(() => {
    if (items.length > 0) {
      return mergeSidebarItemsWithIcons(
        items,
        MenuIcons,
        DEFAULT_SIDEBAR_ITEMS,
      );
    }
    return getMenuItems();
  }, [items, getMenuItems]);

  // Determine active item based on current route
  const getActiveItemId = useCallback(() => {
    const menuItems = getMenuItems();

    const sortedItems = [...menuItems].sort(
      (a, b) => b.path.length - a.path.length,
    );

    const activeItem = sortedItems.find((item) =>
      matchPath({ path: item.path, end: false }, location.pathname),
    );

    return activeItem?.id || menuItems[0]?.id || null;
  }, [location.pathname, getMenuItems]);

  const [activeItem, setActiveItem] = useState(getActiveItemId());

  // Update active item when route changes
  useEffect(() => {
    const newActiveId = getActiveItemId();
    if (newActiveId !== activeItem) {
      setActiveItem(newActiveId);
    }
  }, [location.pathname, getActiveItemId, activeItem]);

  // Memoize item click handler to prevent unnecessary re-renders
  const handleItemClick = useCallback(
    (item) => {
      setActiveItem(item.id);

      if (item.path) {
        navigate(item.path);
      }

      if (onItemClick) {
        onItemClick(item);
      }
    },
    [onItemClick, navigate],
  );

  const asideClasses = `${Styles.container} ${
    isOpen ? Styles.containerExpanded : Styles.containerCollapsed
  }`;

  return (
    <aside className={asideClasses}>
      <div
        className={`${Styles.logoBox}${!isOpen ? ` ${Styles.logoBoxCollapsed}` : ""}`}
      >
        <div
          className={`${Styles.logoImage} select-none`}
          //   onClick={handleLogoClick}
          //   onKeyDown={handleLogoKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Go to dashboard"
        >
          {isOpen ? (
            <img src="/MDM.svg" alt="MDM" className={Styles.logoImg} />
          ) : (
            <img
              src="/KizunaShortLogo.svg"
              alt="MDM"
              className={Styles.logoImgSmall}
            />
          )}
        </div>
      </div>

      <nav className={Styles.menuWrapper} aria-label="Main navigation">
        {currentMenuItems.map((item) => (
          <SidebarMenuItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            isOpen={isOpen}
            onClick={handleItemClick}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarMenuItem({ item, isActive, isOpen, onClick }) {
  const hasIcon = item.icon !== null && item.icon !== undefined;

  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);

  const buttonClasses = [
    Styles.menuItemButton,
    isOpen ? Styles.menuItemButtonExpanded : Styles.menuItemButtonCollapsed,
    isActive ? Styles.menuItemButtonActive : Styles.menuItemButtonInactive,
  ].join(" ");

  const iconClasses = [
    Styles.menuItemIcon,
    isActive ? Styles.menuItemIconActive : Styles.menuItemIconInactive,
  ].join(" ");

  return (
    <button
      onClick={handleClick}
      title={!isOpen ? item.label : ""}
      className={buttonClasses}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      type="button"
    >
      {hasIcon && (
        <span className={iconClasses} aria-hidden="true">
          {item.icon}
        </span>
      )}
      {isOpen && <span className={Styles.menuItemLabel}>{item.label}</span>}
    </button>
  );
}
