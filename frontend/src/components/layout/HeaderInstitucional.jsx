import { useEffect, useState } from "react";

import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import AccountBalanceOutlinedIcon from
  "@mui/icons-material/AccountBalanceOutlined";

import BadgeOutlinedIcon from
  "@mui/icons-material/BadgeOutlined";

import CalendarMonthOutlinedIcon from
  "@mui/icons-material/CalendarMonthOutlined";

import AccessTimeOutlinedIcon from
  "@mui/icons-material/AccessTimeOutlined";

import RefreshOutlinedIcon from
  "@mui/icons-material/RefreshOutlined";


function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(data);
}


function formatarHorario(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(data);
}


function InformacaoCabecalho({
  icone,
  titulo,
  conteudo,
}) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      sx={{
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          color: "primary.dark",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,

          "& svg": {
            fontSize: 23,
          },
        }}
      >
        {icone}
      </Box>

      <Typography
        variant="body2"
        color="text.primary"
        noWrap
        sx={{
          minWidth: 0,
        }}
      >
        <Box
          component="span"
          sx={{
            fontWeight: 800,
            mr: 0.75,
          }}
        >
          {titulo}:
        </Box>

        {conteudo}
      </Typography>
    </Stack>
  );
}


export default function HeaderInstitucional({
  setorNome,
  servidorNome,
  servidorMasp,
  ultimaAtualizacao,
  aoAtualizar,
  carregando = false,
}) {
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const relogio = setInterval(() => {
      setAgora(new Date());
    }, 1000);

    return () => clearInterval(relogio);
  }, []);

  return (
    <Box
      component="header"
      sx={{
        position: "relative",
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        borderRadius: 3.5,
        bgcolor: "background.paper",
        boxShadow: "0 4px 18px rgba(31, 41, 55, 0.07)",

        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(
              circle at 50% -30%,
              rgba(0, 92, 169, 0.12),
              transparent 48%
            ),
            linear-gradient(
              180deg,
              #FFFFFF 0%,
              #F7FAFD 100%
            )
          `,
        },

        "&::after": {
          content: '""',
          position: "absolute",
          left: "-5%",
          right: "-5%",
          top: 95,
          height: 120,
          pointerEvents: "none",
          opacity: 0.7,
          borderRadius: "50%",
          borderTop: "28px solid rgba(0, 92, 169, 0.035)",
          transform: "rotate(-2deg)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          pt: {
            xs: 2.5,
            md: 3,
          },
          pb: 2.25,
        }}
      >
       
         <Box
  sx={{
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    mx: "auto",
  }}
>
  <Box
    component="img"
    src="/brasao-mg.jpg"
    alt="Brasão do Estado de Minas Gerais"
    sx={{
      display: "block",
      width: {
        xs: 82,
        md: 104,
      },
      height: {
        xs: 82,
        md: 104,
      },
      objectFit: "contain",
      mixBlendMode: "multiply",
      mb: 0.5,
      mx: "auto",
    }}
  />

  <Typography
    component="h1"
    sx={{
      width: "100%",
      color: "primary.main",
      fontWeight: 900,
      fontSize: {
        xs: "2rem",
        sm: "2.35rem",
        md: "2.6rem",
      },
      lineHeight: 1,
      letterSpacing: "0.035em",
      textAlign: "center",
    }}
  >
    SIGA
  </Typography>

  <Typography
    sx={{
      width: "100%",
      mt: 0.5,
      color: "text.secondary",
      fontWeight: 700,
      fontSize: {
        xs: "0.9rem",
        sm: "1rem",
      },
      textAlign: "center",
    }}
  >
    Sistema Integrado de Gestão de Atendimentos
  </Typography>

  <Typography
    sx={{
      width: "100%",
      mt: 0.4,
      color: "primary.dark",
      fontWeight: 800,
      fontSize: {
        xs: "0.76rem",
        sm: "0.9rem",
      },
      textTransform: "uppercase",
      letterSpacing: "0.025em",
      textAlign: "center",
    }}
  >
    Superintendência Regional de Ensino Metropolitana A
  </Typography>
</Box>
        

        <Divider sx={{ my: 2.25 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "1fr 1.35fr auto auto",
            },
            alignItems: "center",
            gap: {
              xs: 1.5,
              lg: 3,
            },
          }}
        >
          <InformacaoCabecalho
            icone={<AccountBalanceOutlinedIcon />}
            titulo="Setor"
            conteudo={setorNome || "Setor não identificado"}
          />

          <InformacaoCabecalho
            icone={<BadgeOutlinedIcon />}
            titulo="Servidor"
            conteudo={
              servidorNome
                ? `${servidorNome}${
                    servidorMasp
                      ? ` (MASP: ${servidorMasp})`
                      : ""
                  }`
                : "Servidor não identificado"
            }
          />

          <InformacaoCabecalho
            icone={<CalendarMonthOutlinedIcon />}
            titulo=""
            conteudo={formatarData(agora)}
          />

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={{
              xs: "flex-start",
              lg: "flex-end",
            }}
          >
            <InformacaoCabecalho
              icone={<AccessTimeOutlinedIcon />}
              titulo=""
              conteudo={formatarHorario(agora)}
            />

            <Chip
              icon={<RefreshOutlinedIcon />}
              label={
                ultimaAtualizacao
                  ? `Atualizado às ${formatarHorario(
                      ultimaAtualizacao
                    )}`
                  : "Atualizar"
              }
              variant="outlined"
              clickable
              disabled={carregando}
              onClick={aoAtualizar}
              sx={{
                display: {
                  xs: "none",
                  xl: "inline-flex",
                },
                bgcolor: "rgba(255, 255, 255, 0.7)",
              }}
            />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}