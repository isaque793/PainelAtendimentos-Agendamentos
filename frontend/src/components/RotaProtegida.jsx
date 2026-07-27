import { Navigate, useLocation } from "react-router-dom";

import { estaLogado } from "../utils/sessao";

/**
 * Envolve as rotas internas (/direcao/*) e exige uma sessão de
 * servidor válida antes de renderizar o conteúdo. Sem isso, qualquer
 * pessoa que soubesse a URL entrava direto no painel de controle sem
 * passar pelo login.
 *
 * Guarda o destino original em `state.next` para a tela de login poder
 * mandar a pessoa de volta pra onde ela tentou ir, em vez de sempre
 * cair no dashboard genérico.
 */
function RotaProtegida({ children }) {
  const localizacao = useLocation();

  if (!estaLogado()) {
    return (
      <Navigate
        to="/direcao/acesso"
        state={{ next: localizacao.pathname }}
        replace
      />
    );
  }

  return children;
}

export default RotaProtegida;
