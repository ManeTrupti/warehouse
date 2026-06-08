/** Sidebar: soft grey nav tiles, lavender icons, solid violet active — aligned with Kizuna-style production UI. */
export const SidebarStyles = {
  container: [
    "fixed left-0 top-0 h-screen overflow-y-auto overflow-x-hidden border-r border-slate-200/90 bg-white",
    "shadow-[4px_0_28px_rgba(15,23,42,0.045)]",
    "transition-[width,padding] duration-300 ease-in-out z-40",
  ].join(" "),
  containerExpanded: "w-[240px] px-3 ",
  containerCollapsed: "w-[70px] px-2 ",

  logoBox: [
    "flex w-full items-center justify-center mb-4 px-3 min-h-[76px]",
    "border-b border-slate-100 pb-4",
  ].join(" "),

  logoBoxCollapsed: ["lg:px-0 border-b-0 pb-2 mb-2"].join(" "),
  logoImg: "h-[4.5rem] w-full max-w-[260px] object-contain object-center",
  logoImgSmall: "h-14 w-full max-w-[54px] object-contain object-center",

  logoImage: [
    "flex items-center justify-center cursor-pointer w-full h-full min-w-0",
    "transition-opacity duration-200 hover:opacity-90",
  ].join(" "),

  logoTitle: [
    "text-center px-2 select-none",
    "text-lg sm:text-xl font-bold leading-[1.25] tracking-tight",
    "bg-gradient-to-br from-[#176FD8] via-[#1B2E5A] to-[#410B98] bg-clip-text text-transparent",
  ].join(" "),

  logoCircle: [
    "w-10 h-10 rounded-full flex items-center justify-center",
    "bg-[#1B2E5A] text-white text-sm font-bold",
  ].join(" "),

  menuWrapper: "flex flex-col gap-3.5 pt-1",
  topControls: "flex w-full justify-end pb-1",
  collapseButton:
    "flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",

  menuItemButton: [
    "group relative flex w-full items-center rounded-2xl border text-sm font-semibold outline-none transition-all duration-200 ease-in-out",
    "min-h-[46px]",
    "focus-visible:ring-2 focus-visible:ring-violet-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  ].join(" "),
  menuItemButtonExpanded: "justify-start gap-3 px-3.5 py-2.5 text-left",
  menuItemButtonCollapsed: "justify-center px-2 py-2.5",
  menuItemButtonActive:
    "border-transparent bg-[#7c3aed] text-white shadow-[0_6px_18px_rgba(124,58,237,0.38)] hover:bg-[#6d28d9]",
  menuItemButtonInactive:
    "border border-slate-200/90 bg-[#f3f4f6] text-[#0f172a] shadow-none hover:border-slate-300 hover:bg-[#e8ecf2]",

  menuItemIcon:
    "flex h-[22px] w-[22px] shrink-0 items-center justify-center transition-colors duration-200 [&_svg]:h-[22px] [&_svg]:w-[22px]",
  menuItemIconActive: "text-white",
  menuItemIconInactive: "text-[#a78bfa]",

  menuItemLabel: "truncate whitespace-nowrap overflow-hidden text-ellipsis tracking-tight",
};
