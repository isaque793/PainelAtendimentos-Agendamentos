import { useMemo, useState } from "react";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { criarAgendamento } from "../../services/agendamentoService";
import { mascararCpf, mascararTelefone, apenasDigitos } from "../../utils/formatacao";

const ASSUNTOS = [
  { valor: "documentacao", rotulo: "Entrega ou consulta de documentação" },
  { valor: "vida-escolar", rotulo: "Vida escolar" },
  { valor: "servidor", rotulo: "Assuntos relacionados a servidor" },
  { valor: "outros", rotulo: "Outros assuntos" },
];

const HORARIOS = Array.from({ length: 18 }, (_, indice) => {
  const minutos = 8 * 60 + indice * 30;
  const hora = String(Math.floor(minutos / 60)).padStart(2, "0");
  const minuto = String(minutos % 60).padStart(2, "0");
  return `${hora}:${minuto}`;
});

const FORMULARIO_INICIAL = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  setorId: "",
  data: "",
  horario: "",
  assunto: "",
  descricao: "",
};

function dataMinima() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function AgendamentoPublico({
  setores,
  carregandoSetores,
}) {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmado, setConfirmado] = useState(null);

  const setoresAtivos = useMemo(
    () => setores.filter((setor) => setor.perfil !== "DIRECAO"),
    [setores]
  );

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    const valorFormatado =
      name === "cpf"
        ? mascararCpf(value)
        : name === "telefone"
        ? mascararTelefone(value)
        : value;

    setFormulario((atual) => ({ ...atual, [name]: valorFormatado }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");

    if (!formulario.setorId || !formulario.data || !formulario.horario) {
      setErro("Selecione o setor, a data e o horário do atendimento.");
      return;
    }

    try {
      setEnviando(true);
      const resposta = await criarAgendamento({
        nome: formulario.nome.trim(),
        cpf: apenasDigitos(formulario.cpf),
        telefone: apenasDigitos(formulario.telefone),
        email: formulario.email.trim() || null,
        setor_id: Number(formulario.setorId),
        data_hora: `${formulario.data}T${formulario.horario}:00`,
        assunto: formulario.assunto,
        descricao: formulario.descricao.trim() || null,
      });
      setConfirmado(resposta);
      setFormulario(FORMULARIO_INICIAL);
    } catch (error) {
      setErro(error.message || "Não foi possível registrar o agendamento.");
    } finally {
      setEnviando(false);
    }
  }

  if (confirmado) {
    return (
      <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ py: 4 }}>
        <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 58 }} />
        <Typography variant="h5" fontWeight={800}>Agendamento confirmado</Typography>
        <Typography color="text.secondary">
          Guarde o protocolo abaixo e compareça ao setor escolhido no dia e horário marcados.
        </Typography>
        <Box sx={{ p: 2, border: "1px solid", borderColor: "success.light", borderRadius: "8px", backgroundColor: "#F0FDF4" }}>
          <Typography variant="caption" color="text.secondary">Protocolo</Typography>
          <Typography variant="h5" fontWeight={900} color="success.dark">{confirmado.protocolo}</Typography>
        </Box>
        <Button variant="outlined" onClick={() => setConfirmado(null)}>Novo agendamento</Button>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={enviar}>
      <Stack spacing={2.25}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventAvailableOutlinedIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>Agende seu atendimento</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Escolha diretamente o setor da SRE, o dia e o horário disponíveis.
          </Typography>
        </Box>

        {erro && <Alert severity="error">{erro}</Alert>}

        <Typography variant="subtitle2" fontWeight={800} color="text.secondary">1. Dados do atendimento</Typography>
        <TextField select fullWidth required label="Setor onde deseja ser atendido" name="setorId" value={formulario.setorId} onChange={atualizarCampo} disabled={carregandoSetores}>
          {setoresAtivos.map((setor) => <MenuItem key={setor.id} value={setor.id}>{setor.nome} ({setor.sigla})</MenuItem>)}
        </TextField>
        <TextField select fullWidth required label="Serviço ou assunto" name="assunto" value={formulario.assunto} onChange={atualizarCampo}>
          {ASSUNTOS.map((assunto) => <MenuItem key={assunto.valor} value={assunto.valor}>{assunto.rotulo}</MenuItem>)}
        </TextField>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField fullWidth required type="date" label="Data do atendimento" name="data" value={formulario.data} onChange={atualizarCampo} InputLabelProps={{ shrink: true }} inputProps={{ min: dataMinima() }} InputProps={{ startAdornment: <CalendarMonthOutlinedIcon color="action" sx={{ mr: 1 }} /> }} />
          <TextField select fullWidth required label="Horário" name="horario" value={formulario.horario} onChange={atualizarCampo}>
            {HORARIOS.map((horario) => <MenuItem key={horario} value={horario}>{horario}</MenuItem>)}
          </TextField>
        </Stack>

        <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ pt: 1 }}>2. Dados do cidadão</Typography>
        <TextField fullWidth required label="Nome completo" name="nome" value={formulario.nome} onChange={atualizarCampo} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField fullWidth required label="CPF" name="cpf" value={formulario.cpf} onChange={atualizarCampo} inputProps={{ maxLength: 14 }} />
          <TextField fullWidth required label="Telefone" name="telefone" value={formulario.telefone} onChange={atualizarCampo} inputProps={{ maxLength: 15 }} />
        </Stack>
        <TextField fullWidth type="email" label="E-mail (opcional)" name="email" value={formulario.email} onChange={atualizarCampo} />
        <TextField fullWidth multiline minRows={3} label="Informações adicionais (opcional)" name="descricao" value={formulario.descricao} onChange={atualizarCampo} />
        <Button type="submit" variant="contained" size="large" disabled={enviando || carregandoSetores}>
          {enviando ? "Confirmando agendamento..." : "Confirmar agendamento"}
        </Button>
      </Stack>
    </Box>
  );
}
