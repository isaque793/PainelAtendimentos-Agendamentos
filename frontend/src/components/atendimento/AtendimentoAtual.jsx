import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleOutlinedIcon
  from "@mui/icons-material/CheckCircleOutlined";

import PersonOutlinedIcon
  from "@mui/icons-material/PersonOutlined";

import PlayArrowIcon
  from "@mui/icons-material/PlayArrow";

import SupportAgentIcon
  from "@mui/icons-material/SupportAgent";


export default function AtendimentoAtual({
  atendimento,
  observacoes,
  aoAlterarObservacoes,
  aoIniciar,
  aoFinalizar,
  carregando = false,
}) {
  if (!atendimento) {
    return (
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          minHeight: 360,
          borderRadius: 3,
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            minHeight: 360,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "action.hover",
              }}
            >
              <SupportAgentIcon
                sx={{
                  fontSize: 34,
                  color: "text.secondary",
                }}
              />
            </Box>

            <Typography variant="h6" fontWeight={700}>
              Nenhum atendimento selecionado
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Chame uma pessoa da fila para iniciar o atendimento.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const nomeCidadao =
    atendimento?.cidadao?.nome ||
    `Cidadão #${atendimento?.cidadao_id}`;

  const estaConvocado = atendimento?.status === "CONVOCADO";
  const estaEmAtendimento =
    atendimento?.status === "EM_ATENDIMENTO";

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        minHeight: 360,
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            gap={1}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.50",
                }}
              >
                <PersonOutlinedIcon color="primary" />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {nomeCidadao}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {atendimento?.assunto || "Assunto não informado"}
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={
                estaEmAtendimento
                  ? "Em atendimento"
                  : "Convocado"
              }
              color={estaEmAtendimento ? "primary" : "warning"}
            />
          </Stack>

          <Divider />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Descrição da solicitação
            </Typography>

            <Typography variant="body1" mt={0.5}>
              {atendimento?.descricao ||
                "Nenhuma descrição informada."}
            </Typography>
          </Box>

          <TextField
            label="Observações do atendimento"
            placeholder="Registre aqui o que foi realizado..."
            multiline
            minRows={4}
            fullWidth
            value={observacoes}
            onChange={(evento) =>
              aoAlterarObservacoes(evento.target.value)
            }
            disabled={!estaEmAtendimento || carregando}
          />

          {estaConvocado && (
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={() => aoIniciar(atendimento)}
              disabled={carregando}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {carregando
                ? "Iniciando..."
                : "Iniciar atendimento"}
            </Button>
          )}

          {estaEmAtendimento && (
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckCircleOutlinedIcon/>}
              onClick={() =>
                aoFinalizar(atendimento, observacoes)
              }
              disabled={carregando}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {carregando
                ? "Finalizando..."
                : "Finalizar atendimento"}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}