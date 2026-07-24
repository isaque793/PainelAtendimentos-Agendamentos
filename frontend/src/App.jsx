import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import AtendimentoPublico
    from "./pages/AtendimentoPublico/AtendimentoPublico";

import Dashboard
    from "./pages/Dashboard/Dashboard";

import InternalLayout
    from "./layouts/InternalLayout";

import Cidadaos 
    from "./pages/Cidadaos/Cidadaos";

import AtendimentoServidor
    from "./pages/AtendimentoServidor/AtendimentoServidor";

import PainelChamada
    from "./pages/PainelChamada/PainelChamada";

 import AcessoServidor
    from "./pages/AcessoServidor/AcessoServidor";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<AtendimentoPublico />}
                />

                <Route
                    path="/direcao"
                    element={
                        <InternalLayout>
                            <Dashboard />
                        </InternalLayout>
                    }
                />
                
                <Route
                    path="/direcao/cidadaos"
                    element={
                       <InternalLayout>
                          <Cidadaos />
                       </InternalLayout>
                    }
                />

                <Route
                   path="/direcao/atendimentos"
                   element={<AtendimentoServidor />}
                />

                <Route
                   path="/chamada"
                   element={<PainelChamada />}
                />

                <Route
                    path="/direcao/acesso"
                    element={<AcessoServidor />}
                />


                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;