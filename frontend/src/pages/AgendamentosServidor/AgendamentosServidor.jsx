import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
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

const NOMES_DIAS = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];

function formatarHora(valor) {
  return new Date(valor).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function nomeMes(mes) {
  return new Date(2024, mes - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
}

function mesmaData(valor, ano, mes, dia) {
  const data = new Date(valor);
  return data.getFullYear() === ano && data.getMonth() + 1 === mes && data.getDate() === dia;
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

  async function iniciar(agendamento) {
    try {
      setIniciandoId(agendamento.id);
      setErro("");
      const atendimento = await iniciarAgendamento(agendamento.id);
      setAviso("Atendimento iniciado. Abrindo o painel operacional...");
      navigate("/direcao/atendimentos", { state: { atendimentoId: atendimento.id } });
    } catch (error) {
      setErro(error.message || "Não foi possível iniciar este atendimento.");
    } finally {
      setIniciandoId(null);
    }
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minWidth: 0 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "flex-end" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <EventNoteOutlinedIcon color="primary" />
            <Typography variant="overline" color="primary" fontWeight={900} letterSpacing={1.2}>Agenda institucional</Typography>
          </Stack>
          <Stack direction="row" alignItems="baseline" spacing={1.25} flexWrap="wrap">
            <Typography component="h1" sx={{ fontSize: { xs: "2.2rem", md: "3.35rem" }, lineHeight: 0.95, fontWeight: 950, color: "#123F72", textTransform: "uppercase", letterSpacing: -1 }}>{nomeMes(mes)}</Typography>
            <Typography component="span" sx={{ fontSize: { xs: "2.2rem", md: "3.35rem" }, lineHeight: 0.95, fontWeight: 800, color: "#7C8795", letterSpacing: -1 }}>{ano}</Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Atendimentos marcados para o setor no mês selecionado.</Typography>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Mês</InputLabel>
            <Select value={mes} label="Mês" onChange={(evento) => setMes(evento.target.value)}>
              {Array.from({ length: 12 }, (_, indice) => indice + 1).map((item) => <MenuItem key={item} value={item}>{nomeMes(item)}</MenuItem>)}
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
      {!carregando && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>{agendamentos.length} {agendamentos.length === 1 ? "agendamento" : "agendamentos"} no período.</Typography>}

      <Box sx={{ border: "1px solid #AEB7C2", backgroundColor: "#FFF", overflow: "hidden", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)" }}>
        {carregando ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 620 }}><CircularProgress /></Stack>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: { xs: 1040, md: 0 } }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", backgroundColor: "#59616A", color: "#FFF", borderBottom: "2px solid #3E464E" }}>
                {NOMES_DIAS.map((dia) => <Box key={dia} sx={{ py: 1.1, px: 0.5, textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.55)" }}><Typography sx={{ fontSize: { xs: "0.65rem", md: "0.78rem" }, fontWeight: 900, letterSpacing: 0.25 }}>{dia}</Typography></Box>)}
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
                {dias.map((dia, indice) => {
                  const doDia = dia ? agendamentos.filter((item) => mesmaData(item.data_hora, ano, mes, dia)) : [];
                  const hoje = dia === agora.getDate() && mes === agora.getMonth() + 1 && ano === agora.getFullYear();
                  return (
                    <Box key={`${ano}-${mes}-${dia || `vazio-${indice}`}`} sx={{ minHeight: { xs: 155, md: 185 }, p: { xs: 0.8, md: 1.15 }, borderRight: "1px solid #B7BEC6", borderBottom: "1px solid #B7BEC6", backgroundColor: dia ? "#FFF" : "#F4F5F6", position: "relative" }}>
                      {dia && <>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography sx={{ fontSize: { xs: "1rem", md: "1.25rem" }, lineHeight: 1, fontWeight: hoje ? 950 : 700, color: hoje ? "#0B63B6" : "#273444" }}>{dia}</Typography>
                          {doDia.length > 0 && <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 800 }}>{doDia.length} {doDia.length === 1 ? "marcado" : "marcados"}</Typography>}
                        </Stack>
                        <Stack spacing={0.7}>
                          {doDia.map((agendamento) => (
                            <Box key={agendamento.id} sx={{ p: 0.7, borderLeft: "3px solid #1268A7", borderTop: "1px solid #D4D9DE", borderRight: "1px solid #D4D9DE", borderBottom: "1px solid #D4D9DE", backgroundColor: "#F7FAFC", minWidth: 0 }}>
                              <Typography variant="caption" sx={{ display: "block", fontSize: "0.68rem", fontWeight: 900, color: "#153E67", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formatarHora(agendamento.data_hora)} · {agendamento.cidadao.nome}</Typography>
                              <Typography variant="caption" sx={{ display: "block", mt: 0.15, fontSize: "0.65rem", color: "#5D6875", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agendamento.assunto}</Typography>
                              {agendamento.status === "AGENDADO" ? <Button fullWidth size="small" variant="outlined" startIcon={<PlayArrowOutlinedIcon sx={{ fontSize: "0.82rem !important" }} />} onClick={() => iniciar(agendamento)} disabled={iniciandoId === agendamento.id} sx={{ mt: 0.65, minWidth: 0, minHeight: 23, py: 0, px: 0.45, borderRadius: "3px", fontSize: "0.58rem", lineHeight: 1, whiteSpace: "nowrap" }}>{iniciandoId === agendamento.id ? "Abrindo" : "Iniciar atendimento"}</Button> : <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.6, fontSize: "0.6rem", fontWeight: 800 }}>{agendamento.status}</Typography>}
                            </Box>
                          ))}
                        </Stack>
                      </>}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar open={Boolean(aviso)} autoHideDuration={2500} onClose={() => setAviso("")} message={aviso} />
    </Box>
  );
}
