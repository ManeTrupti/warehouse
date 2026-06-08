import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export const LoginIcons = {
  email: EnvelopeIcon,
  password: LockClosedIcon,
};

export const LoginStyles = {
  pageContainer:
    "min-h-screen flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden py-8",
  backgroundImage: "absolute inset-0 z-0 bg-cover bg-center bg-no-repeat login-bg-zoom",
  overlay:
    "absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(12,24,58,0.62),rgba(17,40,97,0.52),rgba(11,26,62,0.66))]",
  overlayRightShade:
    "absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(to_left,rgba(13,28,66,0.25),transparent_50%)]",
  decorativeOrbTopLeft:
    "absolute top-[15%] left-[10%] w-64 h-64 rounded-full z-[2] bg-indigo-400/20 blur-[80px] pointer-events-none select-none",
  decorativeOrbBottomRight:
    "absolute bottom-[20%] right-[15%] w-48 h-48 rounded-full z-[2] bg-violet-300/20 blur-[60px] pointer-events-none select-none",
  decorativeOrbCenter:
    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full z-[2] bg-indigo-200/10 blur-[100px] pointer-events-none select-none",
  contentWrapper: "relative z-10 w-full max-w-[860px] px-6 sm:px-8 flex flex-col items-center login-card-in",
  card:
    "w-full min-h-[420px] lg:min-h-[480px] rounded-[1.5rem] overflow-hidden flex flex-col lg:flex-row bg-white/95 shadow-[0_30px_80px_rgba(8,23,72,0.35)] border border-white/25 login-card-hover transition-all duration-300",
  brandingPanel:
    "relative flex flex-col justify-center p-8 sm:p-10 lg:min-w-[300px] lg:max-w-[45%] overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500",
  brandingPanelPattern:
    "absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:24px_24px]",
  brandingPanelBlob:
    "absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-2xl pointer-events-none bg-violet-300/30",
  formPanel: "relative flex flex-col justify-center flex-1 p-6 sm:p-8 lg:p-10 bg-white min-w-0",
  formPanelInner: "w-full min-w-0 py-0 flex flex-col",
  formPanelAccent: "absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent",
  brandingContent: "relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left",
  logoWrapper: "relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 bg-white/20 border border-white/35 shadow-lg backdrop-blur-sm",
  logoIcon: "w-8 h-8 text-white",
  brandingTitle: "text-3xl sm:text-[38px] font-bold tracking-tight text-white leading-tight drop-shadow-sm",
  brandingSubtitle: "mt-2 text-sm max-w-[260px] leading-relaxed text-white/90",
  formHeader: "mb-6 text-center flex flex-col items-center",
  formTitle: "text-3xl sm:text-[36px] font-bold tracking-tight leading-tight text-slate-900",
  formSubtitle: "mt-2 text-sm sm:text-base max-w-[300px] leading-relaxed text-slate-500",
  form: "space-y-5",
  formFieldsGroup: "space-y-4 rounded-xl p-1",
  fieldLabel: "block text-sm font-semibold text-slate-800 mb-1.5",
  inputWrapper:
    "relative flex items-center rounded-lg border border-slate-200 bg-white px-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-400",
  inputIcon: "w-5 h-5 text-slate-400 mr-2",
  input: "w-full h-11 outline-none text-sm text-slate-800 placeholder:text-slate-400 bg-transparent",
  inputError: "text-xs text-rose-500 mt-1",
  formActions: "space-y-4 pt-0 flex flex-col",
  passwordToggleButton:
    "flex items-center justify-center w-8 h-8 -mr-1 p-0 border-0 bg-transparent text-slate-400 hover:text-indigo-600 transition-colors duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0",
  passwordToggleIcon: "w-5 h-5",
  forgotPasswordLink:
    "text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 rounded transition-colors duration-200",
  submitButton:
    "w-full h-11 rounded-lg bg-indigo-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
  formFooter: "mt-6 pt-5 border-t border-slate-200 text-center text-sm text-slate-500",
  formFooterLink:
    "font-medium text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 rounded transition-colors duration-200",
};