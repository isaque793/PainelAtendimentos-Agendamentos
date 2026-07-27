import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import AtendimentoPublico
    from "./pages/AtendimentoPublico/AtendimentoPublico";

import Dashboard from "./pages/Dashboard/Dashboard";

import InternalLayout from "./layouts/InternalLayout";

import PessoaDetalhe from "./pages/PessoaDetalhe/PessoaDetalhe";

import AtendimentoServidor
    from "./pages/AtendimentoServidor/AtendimentoServidor";

import Relatorios from "./pages/Relatorios/Relatorios";

import PainelChamada from "./pages/PainelChamada/PainelChamada";

import AcessoServidor from "./pages/AcessoServidor/AcessoServidor";

import RotaProtegida from "./components/RotaProtegida";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Totem público — sem login. */}
                <Route path="/" element={<AtendimentoPublico />} />

                {/* TV da sala de espera — sem login. */}
                <Route path="/chamada" element={<PainelChamada />} />

                {/* Login do servidor — pré-requisito para tudo abaixo. */}
                <Route
                    path="/direcao/acesso"
                    element={<AcessoServidor />}
                />

                {/* Área interna — cada rota exige sessão válida. */}
                <Route
                    path="/direcao"
                    element={
                        <RotaProtegida>
                            <InternalLayout>
                                <Dashboard />
                            </InternalLayout>
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/direcao/pessoa/:cidadaoId"
                    element={
                        <RotaProtegida>
                            <InternalLayout>
                                <PessoaDetalhe />
                            </InternalLayout>
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/direcao/atendimentos"
                    element={
                        <RotaProtegida>
                            <InternalLayout>
                                <AtendimentoServidor />
                            </InternalLayout>
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/direcao/relatorios"
                    element={
                        <RotaProtegida>
                            <InternalLayout>
                                <Relatorios />
                            </InternalLayout>
                        </RotaProtegida>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
