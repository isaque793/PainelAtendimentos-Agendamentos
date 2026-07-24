import { apiRequest } from "../api/api";

export function listarSetoresPublicos() {
  return apiRequest("/setores/publicos");
}

export function validarAcessoSetor(dados) {
  return apiRequest("/setores/acesso", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}