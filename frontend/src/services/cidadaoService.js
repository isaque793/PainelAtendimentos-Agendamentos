import { apiRequest } from "../api/api";

export function listarCidadaos() {
  return apiRequest("/cidadaos/");
}

export function cadastrarCidadao(dados) {
  return apiRequest("/cidadaos/", {
    method: "POST",
    body: JSON.stringify(dados),
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