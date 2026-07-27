import { apiRequest } from "../api/api";

export function listarCidadaos() {
  return apiRequest("/cidadaos/");
}

export function buscarCidadaoPorId(id) {
  return apiRequest(`/cidadaos/${id}`);
}

export function buscarCidadaos(termo) {
  const parametros = new URLSearchParams({ termo });
  return apiRequest(`/cidadaos/buscar?${parametros.toString()}`);
}

export function cadastrarCidadao(dados) {
  return apiRequest("/cidadaos/", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

/**
 * "Login" do cidadão no totem: quem já tem cadastro informa CPF, MASP
 * ou nome e recebe de volta o próprio registro, podendo entrar na fila
 * outra vez sem refazer o cadastro.
 */
export function identificarCidadao(termo) {
  return apiRequest("/cidadaos/identificar", {
    method: "POST",
    body: JSON.stringify({ termo }),
  });
}

export function atualizarCidadao(id, dados) {
  return apiRequest(`/cidadaos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function excluirCidadao(id) {
  return apiRequest(`/cidadaos/${id}`, {
    method: "DELETE",
  });
}
