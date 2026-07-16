const API_URL = "http://127.0.0.1:8000";

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