import { useEffect, useMemo, useState } from "react";

import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { listarAgendamentosMensais } from "../../services/agendamentoService";
import { ehDirecao, obterSessaoServidor } from "../../utils/sessao";

function formatarDataHora(valor) {
  return new Date(valor).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function nomeMes(mes) {
  return new Date(2024, mes - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
}

export default function AgendamentosServidor() {
  const sessao = obterSessaoServidor();
  const direcao = ehDirecao();
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const [setorId, setSetorId] = useState(direcao ? "" : String(sessao?.setor_id || ""));
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

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

  const anos = useMemo(() => [ano - 1, ano, ano + 1], [ano]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={800}>Agenda institucional</Typography>
          <Typography variant="h4" fontWeight={900}>Atendimentos agendados</Typography>
          <Typography color="text.secondary">Consulte os horários marcados para o setor no período selecionado.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Mês</InputLabel>
            <Select value={mes} label="Mês" onChange={(evento) => setMes(evento.target.value)}>
              {Array.from({ length: 12 }, (_, indice) => indice + 1).map((item) => <MenuItem key={item} value={item}>{nomeMes(item)}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Ano</InputLabel>
            <Select value={ano} label="Ano" onChange={(evento) => setAno(evento.target.value)}>
              {anos.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {carregando && <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>}
      {!carregando && !erro && agendamentos.length === 0 && (
        <Card variant="outlined"><CardContent sx={{ py: 8, textAlign: "center" }}><EventNoteOutlinedIcon color="disabled" sx={{ fontSize: 48 }} /><Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>Nenhum atendimento agendado</Typography><Typography color="text.secondary">Não existem horários marcados para este setor no mês selecionado.</Typography></CardContent></Card>
      )}
      {!carregando && agendamentos.length > 0 && (
        <Grid container spacing={2}>
          {agendamentos.map((agendamento) => (
            <Grid item xs={12} lg={6} key={agendamento.id}>
              <Card variant="outlined" sx={{ height: "100%", borderRadius: "12px" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="overline" color="primary" fontWeight={800}>{agendamento.protocolo}</Typography>
                      <Typography variant="h6" fontWeight={900} sx={{ overflowWrap: "anywhere" }}>{agendamento.assunto}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={800} color="success.dark" sx={{ whiteSpace: "nowrap" }}>{agendamento.status}</Typography>
                  </Stack>
                  <Stack spacing={1.2} sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start"><EventNoteOutlinedIcon color="action" fontSize="small" /><Box><Typography variant="caption" color="text.secondary">Data e horário</Typography><Typography variant="body2" fontWeight={700}>{formatarDataHora(agendamento.data_hora)}</Typography></Box></Stack>
                    <Stack direction="row" spacing={1} alignItems="flex-start"><PersonOutlineOutlinedIcon color="action" fontSize="small" /><Box><Typography variant="caption" color="text.secondary">Cidadão</Typography><Typography variant="body2" fontWeight={700}>{agendamento.cidadao.nome}</Typography><Typography variant="caption" color="text.secondary">CPF: {agendamento.cidadao.cpf_formatado || "Não informado"} · Telefone: {agendamento.cidadao.telefone || "Não informado"}</Typography></Box></Stack>
                    <Typography variant="body2" color="text.secondary">E-mail: {agendamento.cidadao.email || "Não informado"}</Typography>
                    <Typography variant="body2" color="text.secondary">Setor: {agendamento.setor.nome} ({agendamento.setor.sigla}) · Sala: {agendamento.setor.numero_sala}</Typography>
                    {agendamento.descricao && <Typography variant="body2" color="text.secondary">Observações: {agendamento.descricao}</Typography>}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
