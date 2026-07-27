import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import App from "./App.jsx";
import theme from "./theme";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ThemeProvider + CssBaseline garantem que todas as telas usem a
        mesma paleta, tipografia e arredondamento. Antes, cada página
        inventava o próprio estilo e o resultado ficava desencontrado. */}
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
