import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import {
  iniciarAgendamento,
  listarAgendamentosMensais,
} from "../../services/agendamentoService";
import { ehDirecao, obterSessaoServidor } from "../../utils/sessao";

const NOMES_DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatarHora(valor) {
  return new Date(valor).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mesmaData(valor, ano, mes, dia) {
  const data = new Date(valor);
  return data.getFullYear() === ano
    && data.getMonth() + 1 === mes
    && data.getDate() === dia;
}

export default function AgendamentosServidor() {
  const navigate = useNavigate();
  const sessao = obterSessaoServidor();
  const direcao = ehDirecao();
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const [setorId, setSetorId] = useState(direcao ? "" : String(sessao?.setor_id || ""));
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [iniciandoId, setIniciandoId] = useState(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro("");
        setAgendamentos(await listarAgendamentosMensais(ano, mes, setorId));
      } catch (error) {
        setErro(error.message || "Não foi possível carregar os agendamentos.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [ano, mes, setorId]);

  const dias = useMemo(() => {
    const primeiroDia = new Date(ano, mes - 1, 1).getDay();
    const totalDias = new Date(ano, mes, 0).getDate();
    const celulas = Array.from({ length: primeiroDia }, () => null);
    for (let dia = 1; dia <= totalDias; dia += 1) celulas.push(dia);
    while (celulas.length % 7 !== 0) celulas.push(null);
    return celulas;
  }, [ano, mes]);

  const anos = useMemo(() => [ano - 1, ano, ano + 1], [ano]);
  const totalDoMes = agendamentos.length;

  async function iniciar(agendamento) {
    try {
      setIniciandoId(agendamento.id);
      setErro("");
      const atendimento = await iniciarAgendamento(agendamento.id);
      navigate("/direcao/atendimentos", {
        state: { atendimentoId: atendimento.id },
      });
    } catch (error) {
      setErro(error.message || "Não foi possível iniciar este atendimento.");
    } finally {
      setIniciandoId(null);
    }
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minWidth: 0 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={800}>Agenda institucional</Typography>
          <Typography variant="h4" fontWeight={900}>Atendimentos agendados</Typography>
          <Typography color="text.secondary">Calendário mensal do setor, com início direto do atendimento.</Typography>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Mês</InputLabel>
            <Select value={mes} label="Mês" onChange={(evento) => setMes(evento.target.value)}>
              {Array.from({ length: 12 }, (_, indice) => indice + 1).map((item) => <MenuItem key={item} value={item}>{new Date(2024, item - 1, 1).toLocaleDateString("pt-BR", { month: "long" })}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 95 }}>
            <InputLabel>Ano</InputLabel>
            <Select value={ano} label="Ano" onChange={(evento) => setAno(evento.target.value)}>
              {anos.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {erro && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro("")}>{erro}</Alert>}
      {!carregando && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>{totalDoMes} {totalDoMes === 1 ? "agendamento encontrado" : "agendamentos encontrados"} no período.</Typography>}

      <Card variant="outlined" sx={{ overflow: "hidden", borderRadius: "12px" }}>
        {carregando ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 560 }}><CircularProgress /></Stack>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: { xs: 900, md: 0 } }}>
              <Grid container columns={7} sx={{ borderBottom: "1px solid", borderColor: "divider", backgroundColor: "#F8FAFC" }}>
                {NOMES_DIAS.map((dia) => <Grid item xs={1} key={dia} sx={{ p: 1.25, textAlign: "center", borderRight: "1px solid", borderColor: "divider" }}><Typography variant="caption" fontWeight={900} color="text.secondary">{dia}</Typography></Grid>)}
              </Grid>
              <Grid container columns={7}>
                {dias.map((dia, indice) => {
                  const doDia = dia ? agendamentos.filter((item) => mesmaData(item.data_hora, ano, mes, dia)) : [];
                  const hoje = dia === agora.getDate() && mes === agora.getMonth() + 1 && ano === agora.getFullYear();
                  return (
                    <Grid item xs={1} key={`${ano}-${mes}-${dia || `vazio-${indice}`}`} sx={{ minHeight: { xs: 145, md: 170 }, p: 0.75, borderRight: "1px solid", borderBottom: "1px solid", borderColor: "divider", backgroundColor: dia ? "#FFFFFF" : "#F8FAFC" }}>
                      {dia && <>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75, px: 0.35 }}>
                          <Typography variant="body2" fontWeight={hoje ? 900 : 700} color={hoje ? "primary.main" : "text.primary"}>{dia}</Typography>
                          {doDia.length > 0 && <Typography variant="caption" fontWeight={800} color="primary.main">{doDia.length}</Typography>}
                        </Stack>
                        <Stack spacing={0.65}>
                          {doDia.map((agendamento) => (
                            <Box key={agendamento.id} sx={{ p: 0.75, border: "1px solid", borderColor: "#BFDBFE", borderRadius: "7px", backgroundColor: "#EFF6FF", minWidth: 0 }}>
                              <Typography variant="caption" fontWeight={900} color="primary.dark" sx={{ display: "block", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formatarHora(agendamento.data_hora)} · {agendamento.cidadao.nome}</Typography>
                              <Typography variant="caption" display="block" color="text.secondary" sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agendamento.assunto}</Typography>
                              <Button fullWidth size="small" variant="contained" color="primary" startIcon={<PlayArrowOutlinedIcon sx={{ fontSize: "0.9rem !important" }} />} onClick={() => iniciar(agendamento)} disabled={iniciandoId === agendamento.id} sx={{ mt: 0.55, minWidth: 0, minHeight: 23, px: 0.45, fontSize: "0.58rem", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {iniciandoId === agendamento.id ? "Abrindo..." : "Iniciar"}
                              </Button>
                            </Box>
                          ))}
                        </Stack>
                      </>}
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Box>
        )}
      </Card>

      <Snackbar open={Boolean(aviso)} autoHideDuration={4000} onClose={() => setAviso("")} message={aviso} />
    </Box>
  );
}
