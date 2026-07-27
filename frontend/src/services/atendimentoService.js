import { apiRequest } from "../api/api";


export function cadastrarAtendimento(dados) {
  return apiRequest("/atendimentos/", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// setorId é opcional em todas as listagens abaixo: quando informado (tela
// do operador em um setor específico), filtra a fila daquele setor; quando
// omitido (Dashboard da direção), traz a visão geral do sistema inteiro.

export function listarFilaAtendimentos(setorId) {
  const parametros = setorId ? `?setor_id=${setorId}` : "";
  return apiRequest(`/atendimentos/fila${parametros}`);
}

export function listarAtendimentosAguardando(setorId) {
  const parametros = setorId ? `?setor_id=${setorId}` : "";
  return apiRequest(`/atendimentos/aguardando${parametros}`);
}

export function listarAtendimentosEmAndamento(setorId) {
  const parametros = setorId ? `?setor_id=${setorId}` : "";
  return apiRequest(`/atendimentos/em-atendimento${parametros}`);
}

export function listarAtendimentosFinalizados(setorId) {
  const parametros = setorId ? `?setor_id=${setorId}` : "";
  return apiRequest(`/atendimentos/finalizados${parametros}`);
}

export function listarAtendimentosDoCidadao(cidadaoId) {
  const parametros = new URLSearchParams({ cidadao_id: cidadaoId });
  return apiRequest(`/atendimentos/?${parametros.toString()}`);
}

export function buscarAtendimentoPorId(atendimentoId) {
  return apiRequest(`/atendimentos/${atendimentoId}`);
}

// convocar/iniciar recebem o corpo já pronto (objeto) e apenas o repassam —
// quem monta o payload é a tela que conhece o contrato de cada schema
// (AtendimentoConvocar exige servidor_nome/servidor_masp/setor_id;
// AtendimentoIniciar não exige nenhum campo).

export function convocarAtendimento(atendimentoId, dados) {
  return apiRequest(
    `/atendimentos/${atendimentoId}/convocar`,
    {
      method: "PATCH",
      body: JSON.stringify(dados),
    }
  );
}

export function iniciarAtendimento(atendimentoId, dados = {}) {
  return apiRequest(
    `/atendimentos/${atendimentoId}/iniciar`,
    {
      method: "PATCH",
      body: JSON.stringify(dados),
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

/**
 * Monta a URL do relatório em Excel (mensal ou semanal). O download em
 * si é feito na tela, via fetch com o token no header — o endpoint é
 * protegido, então não dá para simplesmente linkar o endereço.
 *
 * ``opcoes.setorId`` só tem efeito para quem está logado como Direção;
 * para os demais perfis o backend ignora esse parâmetro e usa sempre o
 * próprio setor do token.
 */
export function urlRelatorio({ tipo, ano, mes, dataReferencia, setorId }) {
  const parametros = new URLSearchParams({ tipo });

  if (tipo === "semanal") {
    if (dataReferencia) parametros.set("data_referencia", dataReferencia);
  } else {
    if (ano) parametros.set("ano", ano);
    if (mes) parametros.set("mes", mes);
  }

  if (setorId) parametros.set("setor_id", setorId);

  return `/atendimentos/relatorio.xlsx?${parametros.toString()}`;
}
