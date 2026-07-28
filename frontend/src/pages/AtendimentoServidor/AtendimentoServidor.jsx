import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeaderInstitucional
  from "../../components/layout/HeaderInstitucional";

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

import { obterSessaoServidor } from "../../utils/sessao";

// A fila é compartilhada por todo o setor, mas a atualização automática
// é só pra quem já está logado (evita bater na API sem necessidade).
const INTERVALO_ATUALIZACAO_MS = 8000;

export default function AtendimentoServidor() {
  const navigate = useNavigate();

  const acessoServidor = useMemo(() => obterSessaoServidor(), []);
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
    async function carregarPainel(mostrarCarregando = true) {
      if (!setorId) {
        navigate("/direcao/acesso");
        return;
      }

      try {
        if (mostrarCarregando) {
          setCarregando(true);
        }
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

        // Com mais de um servidor logado no mesmo setor, cada tela só
        // deve mostrar como "meu atendimento atual" o que o PRÓPRIO
        // servidor logado (pelo MASP guardado na sessão) está tocando —
        // nunca simplesmente o primeiro item em andamento no setor
        // inteiro, senão um servidor vê (e pode mexer) no atendimento
        // que outro colega está conduzindo.
        const listaEmAtendimento = Array.isArray(emAtendimento)
          ? emAtendimento
          : [];

        const meuAtendimento =
          listaEmAtendimento.find(
            (item) => item.servidor_masp === acessoServidor?.servidor_masp
          ) || null;

        setAtendimentoAtual(meuAtendimento);

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
        if (mostrarCarregando) {
          setCarregando(false);
        }
      }
    },
    [navigate, setorId, acessoServidor?.servidor_masp]
  );

  useEffect(() => {
    carregarPainel();
  }, [carregarPainel]);

  // Atualização automática silenciosa: mantém a fila em dia sem exigir
  // que o servidor fique clicando em "atualizar" o tempo todo.
  useEffect(() => {
    if (!setorId) return;

    const intervalo = setInterval(() => {
      carregarPainel(false);
    }, INTERVALO_ATUALIZACAO_MS);

    return () => clearInterval(intervalo);
  }, [carregarPainel, setorId]);

  async function handleChamar(atendimento) {
    try {
      setCarregando(true);
      setErro("");

      await convocarAtendimento(atendimento.id, {});

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
      width: "100%",
      minHeight: "100vh",
      py: {
        xs: 2,
        md: 3,
      },
      px: {
        xs: 1.5,
        sm: 2,
        md: 3,
      },
    }}
  >
    <Container
  maxWidth={false}
  disableGutters
  sx={{
    maxWidth: "1800px",
    mx: "auto",
  }}
>
  <Stack spacing={3}>
    <HeaderInstitucional
      setorNome={acessoServidor?.setor_nome}
      servidorNome={acessoServidor?.servidor_nome}
      servidorMasp={acessoServidor?.servidor_masp}
      ultimaAtualizacao={ultimaAtualizacao}
      carregando={carregando}
      aoAtualizar={() => carregarPainel()}
    />

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
