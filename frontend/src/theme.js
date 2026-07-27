import { createTheme } from "@mui/material/styles";

/**
 * Tema único do sistema. Antes cada tela definia cor e arredondamento
 * na mão, o que deixava o painel com aparências diferentes de página
 * para página. Centralizando aqui, qualquer ajuste visual vale para o
 * sistema inteiro.
 *
 * A paleta segue o azul institucional usado nos materiais da SRE.
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#1d4ed8",
      dark: "#1e3a8a",
      light: "#dbeafe",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0f766e",
    },
    success: {
      main: "#15803d",
    },
    warning: {
      main: "#b45309",
    },
    error: {
      main: "#b91c1c",
    },
    background: {
      default: "#f1f5f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: [
      "Inter",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 800, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },

  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
        },
        containedPrimary: {
          boxShadow: "0 1px 2px rgba(29, 78, 216, 0.25)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(29, 78, 216, 0.25)",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "medium",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#ffffff",
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
