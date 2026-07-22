import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2>Menu</h2>

            <ul>
                <li>
                    <NavLink
                        to="/direcao"
                        end
                        className={({ isActive }) => (isActive ? "ativo" : "")}
                    >
                        🏠 Dashboard
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/direcao/cidadaos"
                        className={({ isActive }) => (isActive ? "ativo" : "")}
                    >
                        👤 Cidadãos
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/direcao/atendimentos"
                        className={({ isActive }) => (isActive ? "ativo" : "")}
                    >
                        📋 Atendimentos
                    </NavLink>
                </li>

                {/* Agendamentos ainda não tem página própria (previsto para
                    uma versão futura do sistema) — deixado visível, mas sem
                    link, para não sugerir uma função que ainda não existe. */}
                <li className="em-breve">
                    📅 Agendamentos <span>em breve</span>
                </li>

                <li>
                    <a href="/chamada" target="_blank" rel="noopener noreferrer">
                        📺 Painel de chamada (TV)
                    </a>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;
