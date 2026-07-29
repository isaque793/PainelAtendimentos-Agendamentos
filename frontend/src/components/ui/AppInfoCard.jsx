import {
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";





const CORES = {
  primary: {
    texto: "#1D4ED8",
    fundo: "#EFF6FF",
    borda: "#93C5FD",
  },

  success: {
    texto: "#287D3C",
    fundo: "#F0FDF4",
    borda: "#BBF7D0",
  },

  warning: {
    texto: "#C75B00",
    fundo: "#FFF7ED",
    borda: "#FED7AA",
  },

  error: {
    texto: "#B42318",
    fundo: "#FEF2F2",
    borda: "#FECACA",
  },

  neutral: {
    texto: "#475569",
    fundo: "#F8FAFC",
    borda: "#E2E8F0",
  },
};


export default function AppInfoCard({
  titulo,
  detalhes,
  status,
  cor = "neutral",
  destacado = false,
  aoClicar,
  rodape,
}) {
  const cores = CORES[cor] || CORES.neutral;
  const interativo = typeof aoClicar === "function";

  function tratarTeclado(evento) {
    if (!interativo) {
      return;
    }

    if (
      evento.key === "Enter" ||
      evento.key === " "
    ) {
      evento.preventDefault();
      aoClicar();
    }
  }

  return (
    <Box
      role={interativo ? "button" : undefined}
      tabIndex={interativo ? 0 : undefined}
      onClick={aoClicar}
      onKeyDown={tratarTeclado}
      sx={{
        width: "100%",
        px: {
          xs: 1.75,
          md: 2,
        },
        py: {
          xs: 1.5,
          md: 1.75,
        },

        backgroundColor: destacado
          ? "#EFF6FF"
          : "#FFFFFF",

        backgroundImage: destacado
          ? `
            linear-gradient(
              145deg,
              #FFFFFF 0%,
              #F8FBFF 58%,
              #EFF6FF 100%
            )
          `
          : `
            linear-gradient(
              145deg,
              #FFFFFF 0%,
              #FCFDFE 62%,
              #F8FAFC 100%
            )
          `,

        border: "1px solid",
        borderColor: destacado
          ? "#BFDBFE"
          : "#E2E8F0",

        borderRadius: "10px",
        boxShadow: "none",

        cursor: interativo
          ? "pointer"
          : "default",

        outline: "none",

        transition:
          "border-color 160ms ease, "
          + "background-color 160ms ease",

        "&:hover": interativo
          ? {
              borderColor: cores.borda,
              backgroundColor: "#FCFDFE",
            }
          : undefined,

        "&:focus-visible": interativo
          ? {
              borderColor: cores.texto,
              boxShadow:
                `0 0 0 3px ${cores.fundo}`,
            }
          : undefined,
      }}
    >
      <Stack spacing={1.1}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography
            component="p"
            variant="body2"
            fontWeight={900}
            color="text.primary"
            sx={{
              minWidth: 0,
              lineHeight: 1.3,
              overflowWrap: "anywhere",
              textTransform: "uppercase",
            }}
          >
            {titulo}
          </Typography>

          {status && (
            <Chip
              label={status}
              size="small"
              variant="outlined"
              sx={{
                flexShrink: 0,
                minHeight: 26,

                color: cores.texto,
                backgroundColor: cores.fundo,

                borderColor: cores.borda,
                borderRadius: "6px",

                fontWeight: 800,

                "& .MuiChip-label": {
                  px: 1.25,
                },
              }}
            />
          )}
        </Stack>

        {detalhes && (
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            spacing={1.5}
          >
            {detalhes}
          </Stack>
        )}

        {rodape && (
        <Box
            sx={{
            pt: 1.25,
            mt: 0.25,
            borderTop: "1px solid",
            borderColor: "divider",
            }}
        >
            {rodape}
        </Box>
        )}


      </Stack>
    </Box>
  );
}