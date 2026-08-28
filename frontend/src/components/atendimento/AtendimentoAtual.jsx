import { useMemo, useState } from "react";

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

import CheckCircleOutlinedIcon
  from "@mui/icons-material/CheckCircleOutlined";

import DescriptionOutlinedIcon
  from "@mui/icons-material/DescriptionOutlined";

import AttachFileOutlinedIcon
  from "@mui/icons-material/AttachFileOutlined";

import DownloadOutlinedIcon
  from "@mui/icons-material/DownloadOutlined";

import DeleteOutlinedIcon
  from "@mui/icons-material/DeleteOutlined";

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

import {
  baixarDocumentoAtendimento,
} from "../../services/atendimentoService";


export default function AtendimentoAtual({
  atendimento,
  observacoes,
  aoAlterarObservacoes,
  aoIniciar,
  aoFinalizar,
  aoEncaminhar,
  setores = [],
  setorAtualId,
  carregando = false,
}) {

const [modalEncaminhamentoAberto, setModalEncaminhamentoAberto] =
useState(false);

const [setorDestinoId, setSetorDestinoId] =
  useState("");

const [motivoEncaminhamento, setMotivoEncaminhamento] =
  useState("");

const [documentosEncaminhamento, setDocumentosEncaminhamento] =
  useState([]);

const setoresDisponiveis = useMemo(
  () =>
    setores.filter(
      (setor) =>
        Number(setor.id) !== Number(setorAtualId)
    ),
  [setores, setorAtualId]
);

function abrirModalEncaminhamento() {
  setSetorDestinoId("");
  setMotivoEncaminhamento("");
  setDocumentosEncaminhamento([]);
  setModalEncaminhamentoAberto(true);
}

function fecharModalEncaminhamento() {
  setModalEncaminhamentoAberto(false);
}

function selecionarDocumentos(evento) {
  const selecionados = Array.from(evento.target.files || []);
  setDocumentosEncaminhamento((atuais) => [
    ...atuais,
    ...selecionados,
  ].slice(0, 5));
  evento.target.value = "";
}

function removerDocumento(index) {
  setDocumentosEncaminhamento((atuais) =>
    atuais.filter((_, indice) => indice !== index)
  );
}

async function baixarDocumento(documento) {
  try {
    const resultado = await baixarDocumentoAtendimento(
      atendimento.id,
      documento.id
    );
    const url = URL.createObjectURL(resultado.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = decodeURIComponent(resultado.nomeArquivo);
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao baixar documento:", error);
  }
}

async function confirmarEncaminhamento() {
  if (!setorDestinoId) {
    return;
  }

  if (motivoEncaminhamento.trim().length < 3) {
    return;
  }

  await aoEncaminhar(
    atendimento,
    Number(setorDestinoId),
    motivoEncaminhamento.trim(),
    documentosEncaminhamento
  );

  setModalEncaminhamentoAberto(false);
  setSetorDestinoId("");
  setMotivoEncaminhamento("");
  setDocumentosEncaminhamento([]);
}

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

  const documentosRecebidos = atendimento?.documentos || [];

  const estaConvocado =
    atendimento?.status === "CONVOCADO";

  const estaEmAtendimento =
    atendimento?.status === "EM_ATENDIMENTO";


  return (
    <>
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

          {documentosRecebidos.length > 0 && (
            <Box
              sx={{
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                backgroundColor: "rgba(248, 250, 252, 0.72)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
              >
                <AttachFileOutlinedIcon
                  fontSize="small"
                  color="action"
                />
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="text.primary"
                >
                  Documentos recebidos ({documentosRecebidos.length})
                </Typography>
              </Stack>

              <Stack spacing={0.75} sx={{ mt: 1 }}>
                {documentosRecebidos.map((documento) => (
                  <Stack
                    key={documento.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ minWidth: 0 }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {documento.nome_arquivo}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<DownloadOutlinedIcon />}
                      onClick={() => baixarDocumento(documento)}
                      sx={{ flexShrink: 0, textTransform: "none" }}
                    >
                      Baixar
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

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
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
            >
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={abrirModalEncaminhamento}
                disabled={carregando}
                fullWidth
                sx={{
                  minHeight: 44,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Encaminhar
              </Button>

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
            </Stack>
          )}
        </Stack>
      </CardContent>
       </Card>

    <Dialog
      open={modalEncaminhamentoAberto}
      onClose={
        carregando
          ? undefined
          : fecharModalEncaminhamento
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Encaminhar atendimento
      </DialogTitle>

      <DialogContent>
        <Stack
          spacing={2}
          sx={{ mt: 1 }}
        >
          <FormControl fullWidth>
            <InputLabel id="setor-destino-label">
              Setor de destino
            </InputLabel>

            <Select
              labelId="setor-destino-label"
              value={setorDestinoId}
              label="Setor de destino"
              onChange={(evento) =>
                setSetorDestinoId(
                  evento.target.value
                )
              }
              disabled={carregando}
            >
              {setoresDisponiveis.map(
                (setor) => (
                  <MenuItem
                    key={setor.id}
                    value={setor.id}
                  >
                    {setor.nome}
                    {setor.sigla
                      ? ` (${setor.sigla})`
                      : ""}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          <TextField
            label="Motivo do encaminhamento"
            placeholder="Informe por que este atendimento precisa seguir para outro setor..."
            multiline
            minRows={3}
            fullWidth
            value={motivoEncaminhamento}
            onChange={(evento) =>
              setMotivoEncaminhamento(
                evento.target.value
              )
            }
            disabled={carregando}
          />

          <Box
            sx={{
              p: 1.5,
              border: "1px dashed",
              borderColor: "primary.light",
              borderRadius: "8px",
              backgroundColor: "#F8FBFF",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <AttachFileOutlinedIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={800}>
                Documentos para o setor de destino
              </Typography>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              Opcional: até 5 arquivos, com no máximo 10 MB cada.
            </Typography>

            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<AttachFileOutlinedIcon />}
              disabled={carregando || documentosEncaminhamento.length >= 5}
              sx={{ mt: 1, textTransform: "none" }}
            >
              Selecionar documentos
              <input
                hidden
                multiple
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                onChange={selecionarDocumentos}
              />
            </Button>

            {documentosEncaminhamento.length > 0 && (
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                {documentosEncaminhamento.map((documento, index) => (
                  <Stack
                    key={`${documento.name}-${documento.lastModified}`}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ minWidth: 0 }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {documento.name}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label={`Remover ${documento.name}`}
                      onClick={() => removerDocumento(index)}
                      disabled={carregando}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={fecharModalEncaminhamento}
          disabled={carregando}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={confirmarEncaminhamento}
          disabled={
            carregando ||
            !setorDestinoId ||
            motivoEncaminhamento.trim().length < 3
          }
        >
          {carregando
            ? "Encaminhando..."
            : "Encaminhar"}
        </Button>
      </DialogActions>
    </Dialog>
  </>
);
}