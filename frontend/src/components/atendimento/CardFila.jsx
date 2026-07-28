import AccessTimeOutlinedIcon
  from "@mui/icons-material/AccessTimeOutlined";

import CampaignOutlinedIcon
  from "@mui/icons-material/CampaignOutlined";

import DescriptionOutlinedIcon
  from "@mui/icons-material/DescriptionOutlined";

import PersonOutlineOutlinedIcon
  from "@mui/icons-material/PersonOutlineOutlined";

import PlayArrowOutlinedIcon
  from "@mui/icons-material/PlayArrowOutlined";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { resumoDocumentos } from "../../utils/formatacao";


function formatarHorario(data) {
  if (!data) {
    return "--:--";
  }

  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}


function calcularTempoEspera(dataSolicitacao) {
  if (!dataSolicitacao) {
    return "Tempo não informado";
  }

  const inicio = new Date(dataSolicitacao);
  const agora = new Date();

  const diferencaEmMinutos = Math.max(
    0,
    Math.floor((agora - inicio) / 60000)
  );

  if (diferencaEmMinutos < 1) {
    return "Chegou agora";
  }

  if (diferencaEmMinutos === 1) {
    return "Aguardando há 1 minuto";
  }

  if (diferencaEmMinutos < 60) {
    return `Aguardando há ${diferencaEmMinutos} minutos`;
  }

  const horas = Math.floor(diferencaEmMinutos / 60);
  const minutos = diferencaEmMinutos % 60;

  return `Aguardando há ${horas}h ${minutos}min`;
}


export default function CardFila({
  atendimento,
  aoChamar,
  aoIniciar,
  carregando = false,
}) {
  const cidadao = atendimento?.cidadao;

  const nomeCidadao =
    cidadao?.nome ||
    `Cidadão #${atendimento?.cidadao_id}`;

  const prioritario =
    atendimento?.prioridade === "PRIORITARIO";

  const convocado =
    atendimento?.status === "CONVOCADO";

  function executarAcao() {
    if (convocado) {
      if (typeof aoIniciar === "function") {
        aoIniciar(atendimento);
      }

      return;
    }

    if (typeof aoChamar === "function") {
      aoChamar(atendimento);
    }
  }

  return (
  <Card
    variant="outlined"
    sx={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 3,
      borderColor: "divider",
      bgcolor: "background.paper",
      boxShadow: "0 3px 10px rgba(31, 41, 55, 0.07)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",

      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: 4,
        bgcolor: prioritario
          ? "warning.main"
          : convocado
            ? "info.main"
            : "primary.main",
      },

      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 7px 18px rgba(31, 41, 55, 0.12)",
      },
    }}
  >
    <CardContent
      sx={{
        p: 2,
        pl: 2.5,
        "&:last-child": {
          pb: 2,
        },
      }}
    >
      <Stack spacing={1.75}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1.5}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="flex-start"
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.light",
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <PersonOutlineOutlinedIcon />
            </Box>

            <Box
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={800}
                noWrap
                color="text.primary"
              >
                {nomeCidadao}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ mt: 0.25 }}
              >
                {resumoDocumentos(cidadao) ||
                  "Sem documento cadastrado"}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 0.4,
                }}
              >
                Chegada às{" "}
                {formatarHorario(
                  atendimento?.data_solicitacao
                )}
              </Typography>
            </Box>
          </Stack>

          <Stack
            spacing={0.65}
            alignItems="flex-end"
            flexShrink={0}
          >
            <Chip
              size="small"
              label={prioritario ? "Prioritário" : "Normal"}
              color={prioritario ? "warning" : "default"}
              variant={prioritario ? "filled" : "outlined"}
              sx={{
                fontWeight: 700,
              }}
            />

            {convocado && (
              <Chip
                size="small"
                label="Convocado"
                color="info"
                sx={{
                  fontWeight: 700,
                }}
              />
            )}
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
          >
            <DescriptionOutlinedIcon
              fontSize="small"
              color="primary"
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Assunto
              </Typography>

              <Typography
                variant="body2"
                fontWeight={700}
                color="text.primary"
              >
                {atendimento?.assunto || "Não informado"}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <AccessTimeOutlinedIcon
              fontSize="small"
              color="action"
            />

            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
            >
              {calcularTempoEspera(
                atendimento?.data_solicitacao
              )}
            </Typography>
          </Stack>
        </Stack>

        <Button
          variant="contained"
          color={convocado ? "success" : "primary"}
          startIcon={
            convocado
              ? <PlayArrowOutlinedIcon />
              : <CampaignOutlinedIcon />
          }
          onClick={executarAcao}
          disabled={carregando}
          fullWidth
          sx={{
            minHeight: 42,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "none",

            "&:hover": {
              boxShadow: convocado
                ? "0 5px 12px rgba(46, 125, 50, 0.22)"
                : "0 5px 12px rgba(0, 92, 169, 0.22)",
            },
          }}
        >
          {carregando
            ? "Processando..."
            : convocado
              ? "Iniciar atendimento"
              : `Chamar ${nomeCidadao.split(" ")[0]}`}
        </Button>
      </Stack>
    </CardContent>
  </Card>
);
}