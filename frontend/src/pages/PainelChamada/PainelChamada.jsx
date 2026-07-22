import { useEffect, useState } from "react";

import { listarChamadaPublica } from "../../services/atendimentoService";

import "./PainelChamada.css";

const INTERVALO_ATUALIZACAO_MS = 4000;

const ROTULO_STATUS = {
    CONVOCADO: "Dirija-se ao guichê",
    EM_ATENDIMENTO: "Em atendimento",
};

function formatarHora(data) {
    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function PainelChamada() {
    const [chamadas, setChamadas] = useState([]);
    const [relogio, setRelogio] = useState(new Date());
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregar() {
            try {
                const dados = await listarChamadaPublica();
                setChamadas(dados);
                setErro("");
            } catch (e) {
                setErro(e.message);
            }
        }

        carregar();
        const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS);
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        const intervaloRelogio = setInterval(() => setRelogio(new Date()), 1000);
        return () => clearInterval(intervaloRelogio);
    }, []);

    const [atual, ...anteriores] = chamadas;

    return (
        <div className="painel-chamada">
            <div className="painel-chamada-header">
                <h1>Painel de Chamada — Sala de Espera</h1>
                <span className="relogio">{formatarHora(relogio)}</span>
            </div>

            {erro && <p style={{ color: "#f87171" }}>{erro}</p>}

            {atual ? (
                <div className="chamada-atual">
                    <div className="rotulo">
                        {ROTULO_STATUS[atual.status] || "Chamando"}
                    </div>
                    <div className="nome">{atual.nome}</div>
                    {atual.guiche && (
                        <div className="guiche">Guichê: {atual.guiche}</div>
                    )}
                </div>
            ) : (
                <div className="chamada-vazia">
                    Nenhuma chamada no momento.
                </div>
            )}

            {anteriores.length > 0 && (
                <div className="lista-anteriores">
                    <h2>Chamadas anteriores</h2>
                    {anteriores.map((item) => (
                        <div key={item.id} className="linha-anterior">
                            <span>{item.nome}</span>
                            <span className="guiche-tag">
                                {item.guiche
                                    ? `Guichê ${item.guiche}`
                                    : ROTULO_STATUS[item.status]}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PainelChamada;
