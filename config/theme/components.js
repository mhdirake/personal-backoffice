const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        background: "#020617",
        backgroundAttachment: "fixed",
      },
      "*::-webkit-scrollbar": { width: "5px", height: "5px" },
      "*::-webkit-scrollbar-track": { background: "transparent" },
      "*::-webkit-scrollbar-thumb": {
        background: "rgba(255,255,255,0.12)",
        borderRadius: "99px",
      },
      "*::-webkit-scrollbar-thumb:hover": {
        background: "rgba(255,255,255,0.22)",
      },
    },
  },

  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        backgroundImage: "none",
        backgroundColor: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: "rgba(2,4,16,0.92)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        backgroundImage: "none",
        border: "none",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
      },
    },
  },

  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        backgroundImage: "none",
        backgroundColor: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        borderRadius: "9px",
        fontSize: "13px",
        letterSpacing: "0.01em",
        transition: "all 0.2s ease",
      },
      containedPrimary: ({ theme }) => ({
        background: theme.palette.modules.brandGradient,
        color: "#fff",
        "&:hover": {
          background: "linear-gradient(135deg, #40D5FF 0%, #9060FF 100%)",
          boxShadow: "0 4px 20px rgba(13,200,255,0.35)",
          transform: "translateY(-1px)",
        },
        "&:active": { transform: "translateY(0)" },
        "&.Mui-disabled": {
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.3)",
        },
      }),
      containedSuccess: {
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,214,143,0.3)",
          transform: "translateY(-1px)",
        },
      },
      containedError: {
        "&:hover": {
          boxShadow: "0 4px 16px rgba(255,77,106,0.3)",
          transform: "translateY(-1px)",
        },
      },
      outlined: {
        borderColor: "rgba(255,255,255,0.14)",
        "&:hover": {
          borderColor: "rgba(255,255,255,0.28)",
          backgroundColor: "rgba(255,255,255,0.05)",
        },
      },
      text: {
        "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
      },
    },
  },

  MuiTextField: {
    defaultProps: { variant: "outlined" },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        backgroundColor: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius: "9px",
        fontSize: "13.5px",
        transition: "all 0.2s ease",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(255,255,255,0.10)",
          transition: "border-color 0.2s ease",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(255,255,255,0.20)",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#0DC8FF",
          borderWidth: "1px",
          boxShadow: "0 0 0 3px rgba(13,200,255,0.12)",
        },
        "&.Mui-focused": {
          backgroundColor: "rgba(255,255,255,0.05)",
        },
      },
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.45)",
        "&.Mui-focused": { color: "#0DC8FF" },
      },
    },
  },

  MuiTable: {
    styleOverrides: {
      root: { borderCollapse: "separate", borderSpacing: 0 },
    },
  },

  MuiTableContainer: {
    styleOverrides: {
      root: {
        backgroundColor: "transparent",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        "& .MuiTableCell-root": {
          backgroundColor: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          padding: "12px 16px",
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "11px 16px",
        fontSize: "13px",
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        backgroundColor: "transparent",
        transition: "background-color 0.15s ease",
        "&.MuiTableRow-hover:hover, &:hover": {
          backgroundColor: "rgba(13,200,255,0.04) !important",
        },
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        backgroundColor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
      },
      colorSuccess: {
        backgroundColor: "rgba(0,214,143,0.12)",
        borderColor: "rgba(0,214,143,0.25)",
        color: "#34EDB3",
      },
      colorError: {
        backgroundColor: "rgba(255,77,106,0.12)",
        borderColor: "rgba(255,77,106,0.25)",
        color: "#FF7A8A",
      },
      colorInfo: {
        backgroundColor: "rgba(59,130,246,0.12)",
        borderColor: "rgba(59,130,246,0.25)",
        color: "#60A5FA",
      },
      colorWarning: {
        backgroundColor: "rgba(255,176,32,0.12)",
        borderColor: "rgba(255,176,32,0.25)",
        color: "#FFC84A",
      },
      colorPrimary: {
        background: "linear-gradient(135deg, rgba(13,200,255,0.18), rgba(112,64,255,0.18))",
        borderColor: "rgba(13,200,255,0.3)",
        color: "#0DC8FF",
      },
    },
  },

  MuiTabs: {
    styleOverrides: {
      root: {
        "& .MuiTabs-indicator": {
          background: "linear-gradient(90deg, #0DC8FF 0%, #7040FF 100%)",
          height: "2px",
          borderRadius: "2px",
        },
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontSize: "13px",
        fontWeight: 500,
        minHeight: 44,
        color: "rgba(255,255,255,0.45)",
        letterSpacing: "0.01em",
        "&.Mui-selected": { color: "#F0F2FF", fontWeight: 600 },
        "&:hover": { color: "rgba(255,255,255,0.75)" },
      },
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: { borderColor: "rgba(255,255,255,0.07)" },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: "9px",
        fontSize: "13px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid",
      },
      standardError: {
        backgroundColor: "rgba(255,77,106,0.10)",
        borderColor: "rgba(255,77,106,0.20)",
      },
      standardSuccess: {
        backgroundColor: "rgba(0,214,143,0.10)",
        borderColor: "rgba(0,214,143,0.20)",
      },
      standardInfo: {
        backgroundColor: "rgba(59,130,246,0.10)",
        borderColor: "rgba(59,130,246,0.20)",
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundColor: "rgba(8,10,28,0.95)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.10)",
        backgroundImage: "none",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        borderRadius: "16px",
      },
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: { fontSize: "15px", fontWeight: 600, paddingBottom: "8px" },
    },
  },

  MuiSelect: {
    styleOverrides: {
      select: { fontSize: "13.5px" },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontSize: "13px",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
        "&.Mui-selected": {
          backgroundColor: "rgba(13,200,255,0.10)",
          "&:hover": { backgroundColor: "rgba(13,200,255,0.15)" },
        },
      },
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: "9px",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.05)",
        },
        "&.Mui-selected": {
          backgroundColor: "rgba(13,200,255,0.10)",
          "&:hover": { backgroundColor: "rgba(13,200,255,0.14)" },
        },
      },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: "rgba(8,10,28,0.95)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        fontSize: "12px",
        borderRadius: "7px",
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: "all 0.2s ease",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.07)" },
        "&:focus-visible": { outline: "2px solid rgba(13,200,255,0.6)", outlineOffset: "2px" },
      },
    },
  },

  MuiSwitch: {
    styleOverrides: {
      switchBase: {
        "&.Mui-checked + .MuiSwitch-track": {
          opacity: 0.85,
        },
      },
      track: {
        backgroundColor: "rgba(255,255,255,0.18)",
      },
    },
  },
};

export default components;
