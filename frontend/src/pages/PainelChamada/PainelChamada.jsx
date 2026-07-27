import { useEffect, useRef, useState } from "react";

import { listarChamadaPublica } from "../../services/atendimentoService";

import "./PainelChamada.css";

const INTERVALO_ATUALIZACAO_MS = 4000;

const ROTULO_STATUS = {
    CONVOCADO: "Dirija-se à sala",
    EM_ATENDIMENTO: "Em atendimento",
};

function formatarHora(data) {
    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function anunciarPorVoz(chamada) {
    if (!("speechSynthesis" in window)) return;

    const partes = [chamada.nome];

    if (chamada.numero_senha) {
        partes.push(`senha ${chamada.numero_senha}`);
    }

    if (chamada.numero_sala) {
        partes.push(`dirija-se à ${chamada.numero_sala}`);
    } else if (chamada.setor) {
        partes.push(`dirija-se ao setor ${chamada.setor}`);
    }

    const texto = partes.join(", ");

    const locucao = new SpeechSynthesisUtterance(texto);
    locucao.lang = "pt-BR";
    locucao.rate = 0.95;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(locucao);
}

function PainelChamada() {
    const [chamadas, setChamadas] = useState([]);
    const [relogio, setRelogio] = useState(new Date());
    const [erro, setErro] = useState("");
    const [somAtivo, setSomAtivo] = useState(true);

    const ultimoIdAnunciadoRef = useRef(null);

    useEffect(() => {
        async function carregar() {
            try {
                const dados = await listarChamadaPublica();
                setChamadas(dados);
                setErro("");

                const [chamadaAtual] = dados;

                // Só anuncia por voz quando o item no topo (a chamada
                // mais recente) muda — evita repetir o mesmo anúncio a
                // cada atualização automática da tela.
                if (
                    somAtivo &&
                    chamadaAtual &&
                    chamadaAtual.id !== ultimoIdAnunciadoRef.current
                ) {
                    anunciarPorVoz(chamadaAtual);
                    ultimoIdAnunciadoRef.current = chamadaAtual.id;
                }
            } catch (e) {
                setErro(e.message);
            }
        }

        carregar();
        const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS);
        return () => clearInterval(intervalo);
    }, [somAtivo]);

    useEffect(() => {
        const intervaloRelogio = setInterval(() => setRelogio(new Date()), 1000);
        return () => clearInterval(intervaloRelogio);
    }, []);

    const [atual, ...anteriores] = chamadas;

    return (
        <div className="painel-chamada">
            <div className="painel-chamada-header">
                <h1>Painel de Chamada — Sala de Espera</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                        type="button"
                        onClick={() => setSomAtivo((atual) => !atual)}
                        style={{
                            background: "transparent",
                            border: "1px solid currentColor",
                            borderRadius: 8,
                            color: "inherit",
                            cursor: "pointer",
                            padding: "6px 12px",
                            fontSize: 14,
                        }}
                    >
                        {somAtivo ? "🔊 Som ativado" : "🔇 Som desativado"}
                    </button>
                    <span className="relogio">{formatarHora(relogio)}</span>
                </div>
            </div>

            {erro && <p style={{ color: "#f87171" }}>{erro}</p>}

            {atual ? (
                <div className="chamada-atual">
                    <div className="rotulo">
                        {ROTULO_STATUS[atual.status] || "Chamando"}
                    </div>
                    <div className="nome">{atual.nome}</div>
                    {atual.numero_senha && (
                        <div className="guiche">Senha: {atual.numero_senha}</div>
                    )}
                    {(atual.numero_sala || atual.setor) && (
                        <div className="guiche">
                            {atual.numero_sala || atual.setor}
                        </div>
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
                            <span>
                                {item.numero_senha
                                    ? `${item.numero_senha} — ${item.nome}`
                                    : item.nome}
                            </span>
                            <span className="guiche-tag">
                                {item.numero_sala
                                    ? item.numero_sala
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
