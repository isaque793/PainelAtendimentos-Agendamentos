// Configurável via .env do frontend (VITE_API_URL) — em desenvolvimento
// local cai em localhost:8000; em produção/Codespaces, defina VITE_API_URL
// apontando para o endereço público do backend.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function obterTokenAtual() {
  try {
    const acesso = JSON.parse(sessionStorage.getItem("acessoServidor"));
    return acesso?.access_token || null;
  } catch {
    return null;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = obterTokenAtual();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Sessão ausente ou expirada: limpa o login guardado e manda a
    // pessoa fazer login de novo, em vez de deixar a tela travada
    // mostrando um erro genérico.
    sessionStorage.removeItem("acessoServidor");

    if (!window.location.pathname.startsWith("/direcao/acesso")) {
      window.location.href = "/direcao/acesso";
    }

    throw new Error("Sessão expirada. Faça login novamente.");
  }

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

export { API_URL };
