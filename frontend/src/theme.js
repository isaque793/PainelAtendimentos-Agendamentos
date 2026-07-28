import { alpha, createTheme } from "@mui/material/styles";

const CORES = {
  azulPrincipal: "#005CA9",
  azulEscuro: "#003F73",
  azulClaro: "#E8F2FA",
  azulMuitoClaro: "#F4F8FC",

  verde: "#287D3C",
  verdeClaro: "#EAF5ED",

  laranja: "#C75B00",
  laranjaClaro: "#FFF3E5",

  vermelho: "#B42318",
  vermelhoClaro: "#FDECEC",

  textoPrincipal: "#1F2937",
  textoSecundario: "#5F6B7A",

  fundo: "#F4F6F8",
  branco: "#FFFFFF",
  borda: "#D9E2EA",
};

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: CORES.azulPrincipal,
      dark: CORES.azulEscuro,
      light: CORES.azulClaro,
      contrastText: CORES.branco,
    },

    secondary: {
      main: "#4B6478",
      dark: "#34495A",
      light: "#E9EEF2",
      contrastText: CORES.branco,
    },

    success: {
      main: CORES.verde,
      light: CORES.verdeClaro,
      contrastText: CORES.branco,
    },

    warning: {
      main: CORES.laranja,
      light: CORES.laranjaClaro,
      contrastText: CORES.branco,
    },

    error: {
      main: CORES.vermelho,
      light: CORES.vermelhoClaro,
      contrastText: CORES.branco,
    },

    background: {
      default: CORES.fundo,
      paper: CORES.branco,
    },

    text: {
      primary: CORES.textoPrincipal,
      secondary: CORES.textoSecundario,
    },

    divider: CORES.borda,
  },

  shape: {
    borderRadius: 12,
  },

  spacing: 8,

  typography: {
    fontFamily: [
      "Roboto",
      "Segoe UI",
      "Arial",
      "sans-serif",
    ].join(","),

    h1: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },

    h2: {
      fontSize: "1.625rem",
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.015em",
    },

    h3: {
      fontSize: "1.375rem",
      fontWeight: 700,
      lineHeight: 1.3,
    },

    h4: {
      fontSize: "1.75rem",
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.015em",
    },

    h5: {
      fontSize: "1.25rem",
      fontWeight: 700,
      lineHeight: 1.3,
    },

    h6: {
      fontSize: "1rem",
      fontWeight: 700,
      lineHeight: 1.4,
    },

    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },

    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },

    button: {
      fontSize: "0.875rem",
      fontWeight: 700,
      textTransform: "none",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          minHeight: "100%",
          backgroundColor: CORES.fundo,
        },

        body: {
          minHeight: "100%",
          backgroundColor: CORES.fundo,
          color: CORES.textoPrincipal,
        },

        "#root": {
          minHeight: "100vh",
        },

        "*": {
          boxSizing: "border-box",
        },

        "::selection": {
          backgroundColor: alpha(CORES.azulPrincipal, 0.18),
        },
      },
    },

    MuiCard: {
      defaultProps: {
        elevation: 0,
      },

      styleOverrides: {
        root: {
          overflow: "hidden",
          border: `1px solid ${CORES.borda}`,
          borderRadius: 14,
          backgroundColor: CORES.branco,
          boxShadow: "0 2px 8px rgba(31, 41, 55, 0.06)",
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },

      styleOverrides: {
        root: {
          backgroundImage: "none",
        },

        rounded: {
          borderRadius: 14,
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 8,
          paddingInline: 20,
          paddingBlock: 9,
          transition:
            "background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",

          "&:active": {
            transform: "translateY(1px)",
          },
        },

        containedPrimary: {
          boxShadow: "0 2px 5px rgba(0, 92, 169, 0.18)",

          "&:hover": {
            backgroundColor: CORES.azulEscuro,
            boxShadow: "0 4px 10px rgba(0, 92, 169, 0.22)",
          },
        },

        outlinedPrimary: {
          borderColor: CORES.azulPrincipal,

          "&:hover": {
            borderColor: CORES.azulEscuro,
            backgroundColor: alpha(CORES.azulPrincipal, 0.06),
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,

          "&:hover": {
            backgroundColor: alpha(CORES.azulPrincipal, 0.07),
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          minHeight: 28,
          borderRadius: 7,
          fontWeight: 700,
        },

        label: {
          paddingInline: 10,
        },

        outlined: {
          backgroundColor: CORES.branco,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "medium",
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: CORES.branco,

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#91A4B5",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
          },
        },

        notchedOutline: {
          borderColor: CORES.borda,
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: CORES.textoSecundario,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: "1px solid",
        },

        standardError: {
          borderColor: alpha(CORES.vermelho, 0.24),
        },

        standardSuccess: {
          borderColor: alpha(CORES.verde, 0.24),
        },

        standardWarning: {
          borderColor: alpha(CORES.laranja, 0.24),
        },

        standardInfo: {
          borderColor: alpha(CORES.azulPrincipal, 0.24),
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: CORES.borda,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: "0.75rem",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${CORES.borda}`,
          boxShadow: "0 20px 50px rgba(31, 41, 55, 0.16)",
        },
      },
    },
  },
});

export { CORES };
export default theme;