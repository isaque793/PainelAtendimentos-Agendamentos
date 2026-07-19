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
        borderRadius: 3,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={1}
          >
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "action.hover",
                  flexShrink: 0,
                }}
              >
                <PersonOutlineOutlinedIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  noWrap
                >
                  {nomeCidadao}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Chegada às{" "}
                  {formatarHorario(
                    atendimento?.data_solicitacao
                  )}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={0.75} alignItems="flex-end">
              <Chip
                size="small"
                label={
                  prioritario
                    ? "Prioritário"
                    : "Normal"
                }
                color={
                  prioritario
                    ? "warning"
                    : "default"
                }
                variant={
                  prioritario
                    ? "filled"
                    : "outlined"
                }
              />

              {convocado && (
                <Chip
                  size="small"
                  label="Convocado"
                  color="info"
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
                color="action"
              />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Assunto
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  {atendimento?.assunto ||
                    "Não informado"}
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
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
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