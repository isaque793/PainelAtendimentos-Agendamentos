// Configurável via .env do frontend (VITE_API_URL) — em desenvolvimento
// local cai em localhost:8000; em produção/Codespaces, defina VITE_API_URL
// apontando para o endereço público do backend.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let mensagem = "Ocorreu um erro na comunicação com o servidor.";

    try {
      const erro = await response.json();
      mensagem = erro.detail || mensagem;
    } catch {
      // Mantém a mensagem padrão quando a resposta não contém JSON.
    }

    throw new Error(mensagem);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}