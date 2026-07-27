/**
 * Leitura da sessão do servidor logado, guardada no sessionStorage sob
 * a chave "acessoServidor" pela tela de login (AcessoServidor.jsx).
 *
 * Centralizado aqui para não espalhar `JSON.parse(sessionStorage...)`
 * solto em cada página — um valor corrompido no storage não deve
 * quebrar a tela inteira, só resultar em "não logado".
 */

const CHAVE_SESSAO = "acessoServidor";

/** Devolve a sessão completa (setor_id, servidor_nome, perfil, token
 * etc.) ou null se não houver login válido. */
export function obterSessaoServidor() {
  try {
    const bruta = sessionStorage.getItem(CHAVE_SESSAO);

    if (!bruta) return null;

    const sessao = JSON.parse(bruta);

    return sessao?.access_token ? sessao : null;
  } catch {
    return null;
  }
}

export function estaLogado() {
  return obterSessaoServidor() !== null;
}

/** Perfil "DIRECAO" enxerga e relata todos os setores; qualquer outro
 * valor (incluindo ausência) é tratado como operador comum. */
export function ehDirecao() {
  return obterSessaoServidor()?.perfil === "DIRECAO";
}

export function encerrarSessaoServidor() {
  sessionStorage.removeItem(CHAVE_SESSAO);
}
