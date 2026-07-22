import { apiRequest } from "../api/api";


export function cadastrarAtendimento(dados) {
  return apiRequest("/atendimentos/", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function listarFilaAtendimentos() {
  return apiRequest("/atendimentos/fila");
}

export function listarAtendimentosAguardando() {
  return apiRequest("/atendimentos/aguardando");
}

export function listarAtendimentosEmAndamento() {
  return apiRequest("/atendimentos/em-atendimento");
}

export function listarAtendimentosFinalizados() {
  return apiRequest("/atendimentos/finalizados");
}

export function buscarAtendimentoPorId(atendimentoId) {
  return apiRequest(`/atendimentos/${atendimentoId}`);
}

export function convocarAtendimento(
  atendimentoId,
  servidorResponsavel
) {
  return apiRequest(
    `/atendimentos/${atendimentoId}/convocar`,
    {
      method: "PATCH",
      body: JSON.stringify({
        servidor_responsavel: servidorResponsavel,
      }),
    }
  );
}

export function iniciarAtendimento(
  atendimentoId,
  servidorResponsavel
) {
  return apiRequest(
    `/atendimentos/${atendimentoId}/iniciar`,
    {
      method: "PATCH",
      body: JSON.stringify({
        servidor_responsavel: servidorResponsavel,
      }),
    }
  );
}

export function finalizarAtendimento(
  atendimentoId,
  resultado,
  observacoes
) {
  return apiRequest(
    `/atendimentos/${atendimentoId}/finalizar`,
    {
      method: "PATCH",
      body: JSON.stringify({
        resultado,
        observacoes: observacoes || null,
      }),
    }
  );
}



export function cancelarAtendimento(
  atendimentoId,
  observacoes
) {
  return apiRequest(
    `/atendimentos/${atendimentoId}/cancelar`,
    {
      method: "PATCH",
      body: JSON.stringify({
        observacoes,
      }),
    }
  );
}

export function listarChamadaPublica() {
  return apiRequest("/atendimentos/chamada-publica");
}