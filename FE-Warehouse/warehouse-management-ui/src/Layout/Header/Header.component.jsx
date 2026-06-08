import { useCallback, useEffect, useRef, useState } from "react";
import { useSidebar } from "../SidebarContext";
import {
  BellIcon,
  Cog6ToothIcon,
  UserIcon,
  Bars3Icon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { HEADER_CONFIG, NOTIFICATION_LIST } from "./Header.constants";
import { useNavigate } from "react-router-dom";

const USER_MENU_ITEMS = [
  { id: "profile", label: "Profile" },
  { id: "preferences", label: "Preferences" },
  { id: "signout", label: "Sign Out" },
];

export function Header() {
  const { isOpen, toggleSidebar } = useSidebar();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationDropdownVisible, setNotificationDropdownVisible] =
    useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const notificationCloseTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole");

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownVisible(false);
        closeTimeoutRef.current = setTimeout(() => setUserMenuOpen(false), 300);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationDropdownVisible(false);
        notificationCloseTimeoutRef.current = setTimeout(
          () => setNotificationOpen(false),
          300,
        );
      }
    }
    if (notificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (notificationCloseTimeoutRef.current)
        clearTimeout(notificationCloseTimeoutRef.current);
    };
  }, [notificationOpen]);

  useEffect(() => {
    if (userMenuOpen) {
      setDropdownVisible(false);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setDropdownVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    }
    setDropdownVisible(false);
  }, [userMenuOpen]);

  useEffect(() => {
    if (notificationOpen) {
      setNotificationDropdownVisible(false);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setNotificationDropdownVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    }
    setNotificationDropdownVisible(false);
  }, [notificationOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (notificationCloseTimeoutRef.current)
        clearTimeout(notificationCloseTimeoutRef.current);
    };
  }, []);

  const toggleUserMenu = useCallback(() => {
    if (userMenuOpen) {
      setDropdownVisible(false);
      closeTimeoutRef.current = setTimeout(() => setUserMenuOpen(false), 300);
    } else {
      setUserMenuOpen(true);
    }
  }, [userMenuOpen]);

  const toggleNotification = useCallback(() => {
    if (notificationOpen) {
      setNotificationDropdownVisible(false);
      notificationCloseTimeoutRef.current = setTimeout(
        () => setNotificationOpen(false),
        300,
      );
    } else {
      setNotificationOpen(true);
    }
  }, [notificationOpen]);

  const handleUserMenuItemClick = useCallback((id) => {
    
    if (id === "signout") {
      navigate(`/`);
      // TODO: wire to auth/sign-out when available
    }
    setDropdownVisible(false);
    closeTimeoutRef.current = setTimeout(() => setUserMenuOpen(false), 300);
  }, []);

  return (
    <header
      className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-violet-300 px-4 text-white shadow-sm"
      style={{
        backgroundImage: `
      linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 55%, transparent 100%),
      linear-gradient(90deg, #6366F1 0%, #7C3AED 50%, #8B5CF6 100%)
    `,
      }}
    >
      <div>
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
          aria-label="Toggle sidebar"
          type="button"
        >
          {isOpen ? (
            <ChevronLeftIcon width={18} height={18} aria-hidden="true" />
          ) : (
            <Bars3Icon width={18} height={18} aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative" ref={notificationRef}>
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            onClick={toggleNotification}
            aria-label="Notifications"
            aria-expanded={notificationOpen}
            aria-haspopup="true"
            type="button"
          >
            <BellIcon width={20} height={20} aria-hidden="true" />
            <div className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
              {HEADER_CONFIG.NOTIFICATION_COUNT}
            </div>
          </button>
          {notificationOpen && (
            <div
              className={`absolute right-0 top-full mt-2 max-h-[400px] min-w-[320px] max-w-[360px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-lg transition-all duration-300 ${
                notificationDropdownVisible
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0"
              }`}
              role="list"
              aria-label="Notifications"
            >
              <div className="mb-2 text-xs font-semibold text-slate-700">
                Notifications
              </div>
              {NOTIFICATION_LIST.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">
                  No notifications
                </div>
              ) : (
                NOTIFICATION_LIST.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`mb-2 block w-full rounded-lg border px-3 py-2 text-left text-xs transition-opacity hover:opacity-95 ${
                      item.type === "error"
                        ? "border-red-100 bg-red-50"
                        : item.type === "warning"
                          ? "border-amber-100 bg-amber-50"
                          : "border-sky-100 bg-sky-50"
                    }`}
                  >
                    <div
                      className={`mb-1 text-xs font-semibold ${
                        item.type === "error"
                          ? "text-red-600"
                          : item.type === "warning"
                            ? "text-amber-700"
                            : "text-sky-600"
                      }`}
                    >
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-700">
                      {item.description}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
          aria-label="Settings"
          type="button"
        >
          <Cog6ToothIcon width={20} height={20} aria-hidden="true" />
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white/20 px-2 py-1.5 transition-colors hover:bg-white/30"
            onClick={toggleUserMenu}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30">
              <UserIcon
                width={18}
                height={18}
                style={{ strokeWidth: 2 }}
                aria-hidden="true"
              />
            </div>
            <span className="hidden whitespace-nowrap text-sm font-medium text-white sm:inline">
              {/* {HEADER_CONFIG.USER_NAME} */}
              {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} User` : "Guest User"}
            </span>
          </button>
          {userMenuOpen && (
            <div
              className={`absolute right-0 top-full mt-2 min-w-[140px] rounded-xl border border-slate-200 bg-white p-1 text-slate-700 shadow-lg transition-all duration-300 ${
                dropdownVisible
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0"
              }`}
              role="menu"
            >
              {USER_MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className={`block w-full rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-slate-100 ${
                    item.id === "signout"
                      ? "mt-1 border-t border-slate-200 pt-2"
                      : ""
                  }`}
                  onClick={() => handleUserMenuItemClick(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
