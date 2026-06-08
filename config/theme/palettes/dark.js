const palette = {
  mode: "dark",
  divider: "rgba(255, 255, 255, 0.06)",

  modules: {
    bodyBackground: "#020617",
    sidebarBg: "rgba(2, 4, 16, 0.92)",
    glassBg: "rgba(255, 255, 255, 0.04)",
    glassBgHover: "rgba(255, 255, 255, 0.07)",
    glassBgStrong: "rgba(255, 255, 255, 0.10)",
    glassBorder: "rgba(255, 255, 255, 0.07)",
    glassBorderStrong: "rgba(255, 255, 255, 0.13)",
    glassBorderLight: "rgba(255, 255, 255, 0.03)",
    blurAmount: "blur(22px)",
    orbCyan: "radial-gradient(ellipse 700px 500px at 0% 0%, rgba(13,200,255,0.13) 0%, transparent 70%)",
    orbViolet: "radial-gradient(ellipse 700px 500px at 100% 100%, rgba(112,64,255,0.11) 0%, transparent 70%)",
    brandGradient: "linear-gradient(135deg, #0DC8FF 0%, #7040FF 100%)",
    brandGradientText: "linear-gradient(135deg, #0DC8FF 30%, #7040FF 100%)",
    activeNavGlow: "0 0 20px rgba(13,200,255,0.18)",
    glassBoxShadow: "0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
    tableRowHover: "rgba(13,200,255,0.04)",
    scrollbarThumb: "rgba(255,255,255,0.12)",
    scrollbarThumbHover: "rgba(255,255,255,0.22)",
    inputBg: "rgba(255,255,255,0.03)",
  },

  primary: {
    main: "#0DC8FF",
    dark: "#009ACC",
    light: "#40D5FF",
    contrastText: "#020617",
  },

  secondary: {
    main: "#7040FF",
    dark: "#5020DF",
    light: "#9060FF",
    contrastText: "#FFFFFF",
  },

  info: {
    main: "#3B82F6",
    light: "#60A5FA",
    dark: "#1D4ED8",
    contrastText: "#FFFFFF",
  },

  text: {
    primary: "#F0F2FF",
    secondary: "#7080A0",
    disabled: "#363850",
    text: "#B0B8D8",
  },

  background: {
    default: "#020617",
    paper: "rgba(255, 255, 255, 0.04)",
    box: "rgba(255, 255, 255, 0.03)",
    elevated: "rgba(255, 255, 255, 0.07)",
  },

  success: {
    main: "#00D68F",
    light: "#34EDB3",
    dark: "#00A86B",
    contrastText: "#020617",
  },

  error: {
    main: "#FF4D6A",
    light: "#FF7A8A",
    dark: "#CC1F40",
    contrastText: "#FFFFFF",
  },

  warning: {
    main: "#FFB020",
    light: "#FFC84A",
    dark: "#CC8800",
    contrastText: "#020617",
  },

  common: {
    white: "#FFFFFF",
    black: "#000000",
  },

  grey: {
    10: "#0C0E1A",
    20: "#141624",
    30: "#1E2240",
    40: "#2A2E50",
    50: "#404468",
    100: "#6870A0",
    110: "#ACB4D0",
  },
};

export default palette;
