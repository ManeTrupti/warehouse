import { useRoutes, Navigate } from "react-router-dom";
import { AppLayout, SidebarProvider } from "../../Layout";
import { productionDataRoutes } from "@features/MasterDataManagement/routes";
import LoginPage from "@features/Login/Login.component";



function AppRoutes() {
  const routes = [
    // Initial load: Dashboard with header only (no sidebar, no hamburger menu)
    // {
    //   path: "/",
    //   element: (
    //     <SidebarProvider>
    //       <Dashbord />
    //     </SidebarProvider>
    //   ),
    // },
    // All module routes with layout (sidebar, header)
    { path: "/", element: <LoginPage /> },
    {
      path: "/",
      element: <AppLayout />,
      children: [
        ...productionDataRoutes.map((r) => ({
          path: r.path,
          element: r.element,
        })),
      ],
    },
    { path: "*", element: <Navigate to="/" replace /> },
  ];

  return useRoutes(routes);
}

export default AppRoutes;
