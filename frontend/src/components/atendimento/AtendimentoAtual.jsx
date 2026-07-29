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

import DescriptionOutlinedIcon
  from "@mui/icons-material/DescriptionOutlined";

import PersonOutlinedIcon
  from "@mui/icons-material/PersonOutlined";

import PlayArrowOutlinedIcon
  from "@mui/icons-material/PlayArrowOutlined";

import SupportAgentOutlinedIcon
  from "@mui/icons-material/SupportAgentOutlined";

import AppInfoCard from "../ui/AppInfoCard";

import {
  resumoDocumentos,
} from "../../utils/formatacao";


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

          backgroundColor: "#FFFFFF",

          backgroundImage: `
            linear-gradient(
              145deg,
              #FFFFFF 0%,
              #FCFDFE 60%,
              #F8FAFC 100%
            )
          `,

          borderColor: "divider",
          borderRadius: "12px",

          boxShadow:
            "0 8px 24px rgba(15, 23, 42, 0.04)",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            minHeight: 360,

            display: "grid",
            placeItems: "center",

            p: {
              xs: 2,
              md: 2.5,
            },
          }}
        >
          <Stack
            alignItems="center"
            spacing={1.5}
            sx={{
              maxWidth: 360,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,

                display: "grid",
                placeItems: "center",

                color: "#64748B",
                backgroundColor: "#F8FAFC",

                border: "1px solid #E2E8F0",
                borderRadius: "8px",
              }}
            >
              <SupportAgentOutlinedIcon />
            </Box>

            <Typography
              variant="h6"
              fontWeight={800}
              textAlign="center"
            >
              Nenhum atendimento selecionado
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Chame uma pessoa da fila para iniciar o
              atendimento.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }


  const cidadao = atendimento?.cidadao;

  const nomeCidadao =
    cidadao?.nome ||
    `Cidadão #${atendimento?.cidadao_id}`;

  const documentos =
    resumoDocumentos(cidadao);

  const assunto =
    atendimento?.assunto ||
    "Assunto não informado";

  const descricao =
    atendimento?.descricao ||
    "Nenhuma descrição informada.";

  const estaConvocado =
    atendimento?.status === "CONVOCADO";

  const estaEmAtendimento =
    atendimento?.status === "EM_ATENDIMENTO";


  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        minHeight: 360,

        backgroundColor: "#FFFFFF",

        backgroundImage: estaEmAtendimento
          ? `
            radial-gradient(
              circle at top right,
              rgba(251, 191, 36, 0.07),
              transparent 34%
            ),
            linear-gradient(
              145deg,
              #FFFFFF 0%,
              #FCFDFE 60%,
              #F8FAFC 100%
            )
          `
          : `
            linear-gradient(
              145deg,
              #FFFFFF 0%,
              #FCFDFE 60%,
              #F8FAFC 100%
            )
          `,

        borderColor: estaEmAtendimento
          ? "#FED7AA"
          : "divider",

        borderRadius: "12px",

        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.04)",

        transition:
          "border-color 160ms ease",
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            md: 2.25,
          },

          "&:last-child": {
            pb: {
              xs: 2,
              md: 2.25,
            },
          },
        }}
      >
        <Stack spacing={2}>
          <AppInfoCard
            titulo={nomeCidadao}
            status={
              estaEmAtendimento
                ? "Em atendimento"
                : "Convocado"
            }
            cor={
              estaEmAtendimento
                ? "warning"
                : "primary"
            }
            destacado={estaConvocado}
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
                    {assunto}
                  </Typography>
                </Stack>

                {documentos && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.6}
                  >
                    <PersonOutlinedIcon
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
                )}
              </>
            }
          />

          <Box
            sx={{
              px: {
                xs: 1.75,
                md: 2,
              },

              py: 1.75,

              backgroundColor:
                "rgba(248, 250, 252, 0.72)",

              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
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
              variant="body2"
              color="text.primary"
              sx={{
                mt: 0.75,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {descricao}
            </Typography>
          </Box>

          <Divider />

          <TextField
            label="Observações do atendimento"
            placeholder="Registre aqui o que foi realizado..."
            multiline
            minRows={4}
            fullWidth
            value={observacoes}
            onChange={(evento) =>
              aoAlterarObservacoes(
                evento.target.value
              )
            }
            disabled={
              !estaEmAtendimento ||
              carregando
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor:
                  "rgba(255, 255, 255, 0.88)",
              },
            }}
          />

          {estaConvocado && (
            <Button
              variant="contained"
              size="large"
              startIcon={
                <PlayArrowOutlinedIcon />
              }
              onClick={() =>
                aoIniciar(atendimento)
              }
              disabled={carregando}
              fullWidth
              sx={{
                minHeight: 44,
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
                ? "Iniciando..."
                : "Iniciar atendimento"}
            </Button>
          )}

          {estaEmAtendimento && (
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={
                <CheckCircleOutlinedIcon />
              }
              onClick={() =>
                aoFinalizar(
                  atendimento,
                  observacoes
                )
              }
              disabled={carregando}
              fullWidth
              sx={{
                minHeight: 44,
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
                ? "Finalizando..."
                : "Finalizar atendimento"}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}