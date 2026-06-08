// import React from "react";
// import { Grid, Card, CardContent } from "@mui/material";
// import { useTheme } from "@core/theme";

// import StockIssues from "./stockIssues/StockIssues";
// import StorePage from "./stores/StorePage";
// import LocationPage from "./location/LocationPage";
// import WarehousePage from "./warehouse/WarehousePage";

// const masterCards = [
//   {
//     component: <LocationPage />,
//   },
//   {
//     component: <StockIssues />,
//   },
//   {
//     component: <StorePage />,
//   },
//   {
//     component: <WarehousePage />,
//   },
// ];

// function MastersPage() {
//   const theme = useTheme();

//   return (
//     <div style={{ padding: theme.spacing.lg }}>
//       <section
//         className="grid gap-4 md:grid-cols-2 xl:grid-cols-2"
//         style={{ gridAutoRows: "1fr" }}
//       >
//         {masterCards.map((card, index) => (
//           <Grid key={index} style={{ minHeight: 0 }}>
//             <Card
//               sx={{
//                 height: 460,
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <CardContent
//                 sx={{
//                   flex: 1,
//                   overflow: "hidden",
//                   display: "flex",
//                   flexDirection: "column",
//                   padding: 0,
//                   minHeight: 0,
//                   "&:last-child": { paddingBottom: 0 },
//                 }}
//               >
//                 <div
//                   style={{
//                     padding: "16px",
//                     // height: "420px",
//                     display: "flex",
//                     flexDirection: "column",
//                     flex: 1,
//                     minHeight: 0,
//                   }}
//                 >
//                   {card.component}
//                 </div>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </section>
//     </div>
//   );
// }

// export default MastersPage;
