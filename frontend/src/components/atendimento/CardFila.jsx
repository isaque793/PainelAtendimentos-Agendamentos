import AccessTimeOutlinedIcon
  from "@mui/icons-material/AccessTimeOutlined";

import BadgeOutlinedIcon
  from "@mui/icons-material/BadgeOutlined";

import CampaignOutlinedIcon
  from "@mui/icons-material/CampaignOutlined";

import DescriptionOutlinedIcon
  from "@mui/icons-material/DescriptionOutlined";

import PlayArrowOutlinedIcon
  from "@mui/icons-material/PlayArrowOutlined";

import {
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import AppInfoCard from "../ui/AppInfoCard";

import {
  resumoDocumentos,
} from "../../utils/formatacao";


function formatarHorario(data) {
  if (!data) {
    return "--:--";
  }

  return new Date(data).toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
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

  const horas = Math.floor(
    diferencaEmMinutos / 60
  );

  const minutos =
    diferencaEmMinutos % 60;

  if (minutos === 0) {
    return `Aguardando há ${horas}h`;
  }

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

  const documentos =
    resumoDocumentos(cidadao) ||
    "Sem documento cadastrado";

  const prioritario =
    atendimento?.prioridade ===
    "PRIORITARIO";

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


  const status = convocado
    ? "Convocado"
    : prioritario
      ? "Prioritário"
      : "Aguardando";

  const cor = convocado
    ? "primary"
    : prioritario
      ? "warning"
      : "neutral";


  return (
    <AppInfoCard
      titulo={nomeCidadao}
      status={status}
      cor={cor}
      destacado={convocado}
      detalhes={
        <>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.6}
          >
            <DescriptionOutlinedIcon
              fontSize="small"
              color="action"
            />

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {atendimento?.assunto ||
                "Assunto não informado"}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.6}
          >
            <BadgeOutlinedIcon
              fontSize="small"
              color="action"
            />

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {documentos}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.6}
          >
            <AccessTimeOutlinedIcon
              fontSize="small"
              color="action"
            />

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{
                fontVariantNumeric:
                  "tabular-nums",
              }}
            >
              Chegada às{" "}
              {formatarHorario(
                atendimento?.data_solicitacao
              )}
            </Typography>
          </Stack>

          <Chip
            size="small"
            label={calcularTempoEspera(
              atendimento?.data_solicitacao
            )}
            variant="outlined"
            sx={{
              height: 24,

              color: prioritario
                ? "#C75B00"
                : "#475569",

              backgroundColor: prioritario
                ? "#FFF7ED"
                : "#F8FAFC",

              borderColor: prioritario
                ? "#FED7AA"
                : "#E2E8F0",

              borderRadius: "6px",
              fontWeight: 700,

              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        </>
      }
      rodape={
        <Button
          variant="contained"
          color={
            convocado
              ? "success"
              : "primary"
          }
          startIcon={
            convocado
              ? <PlayArrowOutlinedIcon />
              : <CampaignOutlinedIcon />
          }
          onClick={executarAcao}
          disabled={carregando}
          fullWidth
          sx={{
            minHeight: 40,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "none",

            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          {carregando
            ? "Processando..."
            : convocado
              ? "Iniciar atendimento"
              : `Chamar ${
                  nomeCidadao.split(" ")[0]
                }`}
        </Button>
      }
    />
  );
}