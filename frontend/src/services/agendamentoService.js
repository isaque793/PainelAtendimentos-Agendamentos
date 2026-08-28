import { apiRequest } from "../api/api";

export function criarAgendamento(dados) {
  return apiRequest("/agendamentos/", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function listarAgendamentosMensais(ano, mes, setorId) {
  const parametros = new URLSearchParams({
    ano: String(ano),
    mes: String(mes),
  });

  if (setorId) {
    parametros.set("setor_id", String(setorId));
  }

  return apiRequest(`/agendamentos/mensal?${parametros.toString()}`);
}
