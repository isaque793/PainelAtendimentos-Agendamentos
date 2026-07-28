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
      position: "relative",
      overflow: "hidden",
      height: "100%",
      minHeight: 360,
      borderRadius: 3,
      borderColor: "divider",
      bgcolor: "background.paper",
      boxShadow: "0 6px 20px rgba(31, 41, 55, 0.09)",

      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        bgcolor: estaEmAtendimento
          ? "success.main"
          : "warning.main",
      },
    }}
  >
    <CardContent
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
        "&:last-child": {
          pb: {
            xs: 2,
            md: 3,
          },
        },
      }}
    >
      <Stack spacing={3}>
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
          gap={2}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: estaEmAtendimento
                  ? "success.light"
                  : "warning.light",
                color: estaEmAtendimento
                  ? "success.main"
                  : "warning.main",
                flexShrink: 0,
              }}
            >
              <PersonOutlinedIcon
                sx={{
                  fontSize: 30,
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                fontWeight={900}
                color="text.primary"
                noWrap
              >
                {nomeCidadao}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                {atendimento?.assunto ||
                  "Assunto não informado"}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={
              estaEmAtendimento
                ? "Em atendimento"
                : "Convocado"
            }
            color={
              estaEmAtendimento
                ? "success"
                : "warning"
            }
            sx={{
              fontWeight: 800,
              minHeight: 32,
            }}
          />
        </Stack>

        <Divider />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              CPF
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              color="text.primary"
              sx={{ mt: 0.4 }}
            >
              {atendimento?.cidadao?.cpf ||
                "Não informado"}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              MASP
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              color="text.primary"
              sx={{ mt: 0.4 }}
            >
              {atendimento?.cidadao?.masp ||
                "Não informado"}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              Telefone
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              color="text.primary"
              sx={{ mt: 0.4 }}
            >
              {atendimento?.cidadao?.telefone ||
                "Não informado"}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              Prioridade
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              color={
                atendimento?.prioridade === "PRIORITARIO"
                  ? "warning.dark"
                  : "text.primary"
              }
              sx={{ mt: 0.4 }}
            >
              {atendimento?.prioridade === "PRIORITARIO"
                ? "Prioritário"
                : "Normal"}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
          >
            Descrição da solicitação
          </Typography>

          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              mt: 0.75,
              lineHeight: 1.6,
            }}
          >
            {atendimento?.descricao ||
              "Nenhuma descrição informada."}
          </Typography>
        </Box>

        <TextField
          label="Observações do atendimento"
          placeholder="Registre aqui o que foi realizado..."
          multiline
          minRows={5}
          fullWidth
          value={observacoes}
          onChange={(evento) =>
            aoAlterarObservacoes(evento.target.value)
          }
          disabled={!estaEmAtendimento || carregando}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              bgcolor: !estaEmAtendimento
                ? "action.hover"
                : "background.paper",
            },
          }}
        />

        {estaConvocado && (
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={() => aoIniciar(atendimento)}
            disabled={carregando}
            fullWidth
            sx={{
              minHeight: 50,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",

              "&:hover": {
                boxShadow:
                  "0 6px 14px rgba(0, 92, 169, 0.22)",
              },
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
            startIcon={<CheckCircleOutlinedIcon />}
            onClick={() =>
              aoFinalizar(atendimento, observacoes)
            }
            disabled={carregando}
            fullWidth
            sx={{
              minHeight: 50,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",

              "&:hover": {
                boxShadow:
                  "0 6px 14px rgba(46, 125, 50, 0.22)",
              },
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