import { Outlet } from "react-router-dom";
import { useTheme } from "@core/theme";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";
import { useSidebar } from "./SidebarContext";

/**
 * Shared app layout: includes Header, Sidebar, and main content area.
 */
function AppLayoutContent() {
  const { colors, spacing } = useTheme();
  const { isOpen } = useSidebar();

  return (
    <div
      className="min-h-screen"
      style={{
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: colors.background.page || colors.background.secondary,
        color: colors.text.primary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          marginLeft: isOpen ? "240px" : "70px",
          transition: "margin-left 300ms ease-in-out",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Header />

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: spacing.md,
            overflowY: 'auto',
            backgroundColor: colors.background.page || colors.background.secondary,
          }}
        >
          <Outlet />
        </main>
      </div>
      <Sidebar />
    </div>
  );
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  );
}
