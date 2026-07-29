import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import AccessTimeOutlinedIcon
  from "@mui/icons-material/AccessTimeOutlined";

import CampaignOutlinedIcon
  from "@mui/icons-material/CampaignOutlined";

import HistoryOutlinedIcon
  from "@mui/icons-material/HistoryOutlined";

import MeetingRoomOutlinedIcon
  from "@mui/icons-material/MeetingRoomOutlined";

import VolumeOffOutlinedIcon
  from "@mui/icons-material/VolumeOffOutlined";

import VolumeUpOutlinedIcon
  from "@mui/icons-material/VolumeUpOutlined";

import { listarChamadaPublica }
  from "../../services/atendimentoService";

import "./PainelChamada.css";


const INTERVALO_ATUALIZACAO_MS = 4000;


function formatarHorario(data) {
  if (!data) {
    return "--:--";
  }

  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}


function formatarRelogio(data) {
  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


function formatarData(data) {
  return data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}


function obterDestino(chamada) {
  if (chamada?.numero_sala) {
    return chamada.numero_sala;
  }

  if (chamada?.setor) {
    return chamada.setor;
  }

  return "Atendimento";
}


function anunciarPorVoz(chamada) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const destino = obterDestino(chamada);

  const texto = `${chamada.nome}, dirija-se a ${destino}.`;

  const locucao = new SpeechSynthesisUtterance(texto);

  locucao.lang = "pt-BR";
  locucao.rate = 0.9;
  locucao.pitch = 1;
  locucao.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(locucao);
}


export default function PainelChamada() {
  const [chamadas, setChamadas] = useState([]);
  const [relogio, setRelogio] = useState(new Date());
  const [erro, setErro] = useState("");
  const [somAtivo, setSomAtivo] = useState(true);

  const ultimoIdAnunciadoRef = useRef(null);


  useEffect(() => {
    async function carregarChamadas() {
      try {
        const dados = await listarChamadaPublica();

        const listaRecebida = Array.isArray(dados)
          ? dados
          : [];

        setChamadas(listaRecebida);
        setErro("");

        const chamadaAtual = listaRecebida[0];

        if (
          somAtivo &&
          chamadaAtual &&
          chamadaAtual.id !== ultimoIdAnunciadoRef.current
        ) {
          anunciarPorVoz(chamadaAtual);

          ultimoIdAnunciadoRef.current =
            chamadaAtual.id;
        }
      } catch (error) {
        console.error(
          "Erro ao carregar o painel de chamadas:",
          error
        );

        setErro(
          error?.message ||
          "Não foi possível atualizar o painel."
        );
      }
    }

    carregarChamadas();

    const intervalo = setInterval(
      carregarChamadas,
      INTERVALO_ATUALIZACAO_MS
    );

    return () => clearInterval(intervalo);
  }, [somAtivo]);


  useEffect(() => {
    const intervalo = setInterval(() => {
      setRelogio(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);


  const [chamadaAtual, ...chamadasAnteriores] =
    chamadas;


  return (
    <Box className="painel-tv">
      <Box component="header" className="painel-tv-header">
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            className="painel-tv-titulo"
          >
            Painel de Atendimento
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            textTransform="capitalize"
          >
            {formatarData(relogio)}
          </Typography>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
        >
          <Tooltip
            title={
              somAtivo
                ? "Desativar som"
                : "Ativar som"
            }
          >
            <IconButton
              type="button"
              onClick={() => {
                setSomAtivo((estadoAtual) =>
                  !estadoAtual
                );
              }}
              className="botao-som"
              aria-label={
                somAtivo
                  ? "Desativar som"
                  : "Ativar som"
              }
            >
              {somAtivo
                ? <VolumeUpOutlinedIcon />
                : <VolumeOffOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Box className="painel-tv-relogio">
            <AccessTimeOutlinedIcon />

            <Typography
              component="span"
              fontWeight={800}
            >
              {formatarRelogio(relogio)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {erro && (
        <Alert
          severity="error"
          onClose={() => setErro("")}
        >
          {erro}
        </Alert>
      )}

      <Box component="main" className="painel-tv-conteudo">
        <Card
          className="card-chamada-atual"
          elevation={0}
          key={chamadaAtual?.id || "sem-chamada"}
        >
          <CardContent className="card-chamada-conteudo">
            {chamadaAtual ? (
              <>
                <Chip
                  icon={<CampaignOutlinedIcon />}
                  label="Chamando agora"
                  className="chip-chamando"
                />

                <Typography
                  component="p"
                  className="nome-chamada-atual"
                >
                  {chamadaAtual.nome}
                </Typography>

                <Box className="destino-chamada">
                  <MeetingRoomOutlinedIcon />

                  <Box>
                    <Typography
                      variant="body1"
                      className="destino-instrucao"
                    >
                      Dirija-se a
                    </Typography>

                    <Typography
                      component="p"
                      className="destino-nome"
                    >
                      {obterDestino(chamadaAtual)}
                    </Typography>
                  </Box>
                </Box>
              </>
            ) : (
              <Box className="painel-sem-chamada">
                <CampaignOutlinedIcon />

                <Typography
                  variant="h4"
                  fontWeight={800}
                >
                  Nenhuma chamada no momento
                </Typography>

                <Typography color="text.secondary">
                  Aguarde enquanto os atendimentos são
                  organizados.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card
          className="card-ultimas-chamadas"
          elevation={0}
        >
          <CardContent className="ultimas-chamadas-conteudo">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
              className="ultimas-chamadas-header"
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <HistoryOutlinedIcon color="action" />

                <Typography
                  variant="h5"
                  fontWeight={800}
                >
                  Últimas chamadas
                </Typography>
              </Stack>

              <Chip
                size="small"
                label={chamadasAnteriores.length}
              />
            </Stack>

            {chamadasAnteriores.length > 0 ? (
              <Stack
                spacing={1.5}
                className="lista-ultimas-chamadas"
              >
                {chamadasAnteriores.map(
                  (chamada, indice) => (
                    <Box
                      key={chamada.id}
                      className="item-ultima-chamada"
                    >
                      <Box className="item-ultima-chamada-topo">
                        <Typography
                          component="p"
                          className="nome-ultima-chamada"
                        >
                          {chamada.nome}
                        </Typography>

                        {indice === 0 && (
                          <Chip
                            label="Mais recente"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        mt={1}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.75}
                        >
                          <MeetingRoomOutlinedIcon
                            fontSize="small"
                            color="action"
                          />

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={600}
                          >
                            {obterDestino(chamada)}
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <AccessTimeOutlinedIcon
                            fontSize="small"
                            color="action"
                          />

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {formatarHorario(
                              chamada.chamado_em
                            )}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  )
                )}
              </Stack>
            ) : (
              <Box className="ultimas-chamadas-vazia">
                <HistoryOutlinedIcon />

                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                >
                  As últimas pessoas chamadas aparecerão
                  aqui.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box component="footer" className="painel-tv-footer">
        <Typography
          variant="body1"
          color="text.secondary"
        >
          Aguarde seu nome aparecer no painel e siga para
          a sala indicada.
        </Typography>

        <Chip
          size="small"
          variant="outlined"
          label="Atualização automática"
        />
      </Box>
    </Box>
  );
}