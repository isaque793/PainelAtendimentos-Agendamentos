import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import GroupsOutlinedIcon
  from "@mui/icons-material/GroupsOutlined";

import RefreshOutlinedIcon
  from "@mui/icons-material/RefreshOutlined";

import SupportAgentIcon
  from "@mui/icons-material/SupportAgent";

import HistoryIcon
  from "@mui/icons-material/History";

import AtendimentoAtual
  from "../../components/atendimento/AtendimentoAtual";

import CardFila
  from "../../components/atendimento/CardFila";

import HistoricoAtendimentos
  from "../../components/atendimento/HistoricoAtendimentos";

import {
  listarFilaAtendimentos,
  listarAtendimentosEmAndamento,
  listarAtendimentosFinalizados,
  convocarAtendimento,
  iniciarAtendimento,
  finalizarAtendimento,
} from "../../services/atendimentoService";


  export default function AtendimentoServidor() {
  const navigate = useNavigate();

  const acessoServidor = JSON.parse(
    sessionStorage.getItem("acessoServidor")
  );

  const setorId = acessoServidor?.setor_id;

  const [fila, setFila] = useState([]);
  const [atendimentoAtual, setAtendimentoAtual] =
    useState(null);
  const [finalizados, setFinalizados] = useState([]);
  const [observacoes, setObservacoes] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] =
    useState(null);




  function obterMensagemErro(error) {
    if (typeof error?.message === "string") {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Ocorreu um erro inesperado.";
  }



 const carregarPainel = useCallback(
  async function carregarPainel() {
    if (!setorId) {
      navigate("/direcao/acesso");
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      const [
        filaRecebida,
        emAtendimento,
        finalizadosRecebidos,
      ] = await Promise.all([
        listarFilaAtendimentos(setorId),
        listarAtendimentosEmAndamento(setorId),
        listarAtendimentosFinalizados(setorId),
      ]);

      setFila(filaRecebida);

      setAtendimentoAtual(
        Array.isArray(emAtendimento)
          ? emAtendimento[0] ?? null
          : emAtendimento
      );

      setFinalizados(finalizadosRecebidos);
      setUltimaAtualizacao(new Date());
    } catch (error) {
      console.error(
        "Erro ao carregar painel de atendimentos:",
        error
      );

      setErro(
        obterMensagemErro(error)
      );
    } finally {
      setCarregando(false);
    }
  },
  [navigate, setorId]
);


  useEffect(() => {
  carregarPainel();
}, [carregarPainel]);

  async function handleChamar(atendimento) {
    try {
      setCarregando(true);
      setErro("");

      await convocarAtendimento(
  atendimento.id,
  {
    servidor_nome: acessoServidor.servidor_nome,
    servidor_masp: acessoServidor.servidor_masp,
    setor_id: acessoServidor.setor_id,
  }
);

      setObservacoes("");

      await carregarPainel();
    } catch (error) {
      console.error(
        "Erro ao convocar atendimento:",
        error
      );

      setErro(
        obterMensagemErro(error) ||
          "Não foi possível convocar o cidadão."
      );
    } finally {
      setCarregando(false);
    }
  }


async function handleIniciar(atendimento) {
  try {
    setCarregando(true);
    setErro("");

    await iniciarAtendimento(
      atendimento.id,
      {}
    );

    await carregarPainel();
  } catch (error) {
    console.error(
      "Erro ao iniciar atendimento:",
      error
    );

    setErro(
      obterMensagemErro(error)
      || "Não foi possível iniciar o atendimento."
    );
  } finally {
    setCarregando(false);
  }
}

  async function handleFinalizar(
    atendimento,
    textoObservacoes
  ) {
    try {
      setCarregando(true);
      setErro("");

      await finalizarAtendimento(
        atendimento.id,
        "ATENDIMENTO_CONCLUIDO",
        textoObservacoes
      );

      setObservacoes("");

      await carregarPainel();
    } catch (error) {
      console.error(
        "Erro ao finalizar atendimento:",
        error
      );

      setErro(
        obterMensagemErro(error) ||
          "Não foi possível finalizar o atendimento."
      );
    } finally {
      setCarregando(false);
    }
  }
  


  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.100",
        py: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
              >
                Painel de Atendimentos
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                mt={0.5}
              >
                Gerencie a fila e os atendimentos em andamento.
              </Typography>
            </Box>

            <Chip
              icon={<RefreshOutlinedIcon />}
              label={
                ultimaAtualizacao
                  ? `Atualizado às ${ultimaAtualizacao.toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    )}`
                  : "Carregando dados..."
              }
              variant="outlined"
              onClick={() => carregarPainel()}
              clickable
            />
          </Stack>

          {erro && (
            <Alert
              severity="error"
              onClose={() => setErro("")}
            >
              {erro}
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "340px minmax(500px, 1fr) 320px",
              },
              gap: 4,
              alignItems: "start",
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <GroupsOutlinedIcon color="action" />

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Fila de espera
                  </Typography>
                </Stack>

                <Chip
                  size="small"
                  label={fila.length}
                  color="primary"
                />
              </Stack>

              {fila.length === 0 ? (
                <Box
                  sx={{
                    minHeight: 360,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    display: "grid",
                    placeItems: "center",
                    p: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    {carregando
                      ? "Carregando fila..."
                      : "Não há cidadãos aguardando atendimento."}
                  </Typography>
                </Box>
              ) : (
                fila.map((atendimento) => (
                  <CardFila
                        key={atendimento.id}
                        atendimento={atendimento}
                        aoChamar={handleChamar}
                        aoIniciar={handleIniciar}
                        carregando={carregando}
                    />
                ))
              )}
            </Stack>

            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <SupportAgentIcon color="action" />

                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Atendimento atual
                </Typography>
              </Stack>

              <AtendimentoAtual
                atendimento={atendimentoAtual}
                observacoes={observacoes}
                aoAlterarObservacoes={setObservacoes}
                aoIniciar={handleIniciar}
                aoFinalizar={handleFinalizar}
                carregando={carregando}
              />
            </Stack>

            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <HistoryIcon color="action" />

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Finalizados hoje
                  </Typography>
                </Stack>

                <Chip
                  size="small"
                  label={finalizados.length}
                  color="success"
                />
              </Stack>

              <HistoricoAtendimentos
                atendimentos={finalizados}
              />
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}