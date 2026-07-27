import { NavLink, useNavigate } from "react-router-dom";

import DashboardOutlinedIcon
    from "@mui/icons-material/DashboardOutlined";

import SupportAgentOutlinedIcon
    from "@mui/icons-material/SupportAgentOutlined";

import AssessmentOutlinedIcon
    from "@mui/icons-material/AssessmentOutlined";

import TvOutlinedIcon from "@mui/icons-material/TvOutlined";

import OpenInNewOutlinedIcon
    from "@mui/icons-material/OpenInNewOutlined";

import LogoutOutlinedIcon
    from "@mui/icons-material/LogoutOutlined";

import LocalPoliceOutlinedIcon
    from "@mui/icons-material/LocalPoliceOutlined";

import { Avatar, Button, Stack, Tooltip, Typography } from "@mui/material";

import {
    ehDirecao,
    encerrarSessaoServidor,
    obterSessaoServidor,
} from "../../utils/sessao";

import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();
    const sessao = obterSessaoServidor();
    const direcao = ehDirecao();

    // A Direção não opera uma fila própria (não tem balcão de
    // atendimento) — o item "Atendimentos" só aparece pra quem
    // realmente convoca e atende cidadãos.
    const itens = [
        {
            rota: "/direcao",
            rotulo: "Painel de controle",
            icone: <DashboardOutlinedIcon fontSize="small" />,
            exato: true,
        },
        ...(direcao
            ? []
            : [
                  {
                      rota: "/direcao/atendimentos",
                      rotulo: "Atendimentos",
                      icone: <SupportAgentOutlinedIcon fontSize="small" />,
                  },
              ]),
        {
            rota: "/direcao/relatorios",
            rotulo: "Relatórios",
            icone: <AssessmentOutlinedIcon fontSize="small" />,
        },
    ];

    function sair() {
        encerrarSessaoServidor();
        navigate("/direcao/acesso", { replace: true });
    }

    return (
        <aside className="sidebar">
            <p className="sidebar-titulo">Menu</p>

            <nav>
                <ul>
                    {itens.map((item) => (
                        <li key={item.rota}>
                            <NavLink
                                to={item.rota}
                                end={item.exato}
                                className={({ isActive }) =>
                                    isActive ? "ativo" : ""
                                }
                            >
                                {item.icone}
                                <span>{item.rotulo}</span>
                            </NavLink>
                        </li>
                    ))}

                    <li>
                        {/* Abre em outra aba porque a TV normalmente fica
                            em um monitor separado da estação do servidor. */}
                        <a
                            href="/chamada"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <TvOutlinedIcon fontSize="small" />
                            <span>Painel de chamada (TV)</span>
                            <OpenInNewOutlinedIcon className="icone-externo" />
                        </a>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-servidor">
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar
                        sx={{
                            width: 34,
                            height: 34,
                            bgcolor: direcao ? "warning.main" : "primary.main",
                            fontSize: 14,
                        }}
                    >
                        {direcao ? (
                            <LocalPoliceOutlinedIcon fontSize="small" />
                        ) : (
                            (sessao?.servidor_nome || "?")
                                .trim()
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </Avatar>

                    <div style={{ minWidth: 0 }}>
                        <Tooltip title={sessao?.servidor_nome || ""}>
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                noWrap
                                sx={{ color: "#fff" }}
                            >
                                {sessao?.servidor_nome || "Servidor"}
                            </Typography>
                        </Tooltip>

                        <Typography variant="caption" color="#94a3b8">
                            {direcao ? "Direção" : sessao?.setor_nome}
                        </Typography>
                    </div>
                </Stack>

                <Button
                    fullWidth
                    size="small"
                    color="inherit"
                    startIcon={<LogoutOutlinedIcon fontSize="small" />}
                    onClick={sair}
                    sx={{
                        mt: 1.5,
                        color: "#cbd5e1",
                        justifyContent: "flex-start",
                    }}
                >
                    Sair
                </Button>
            </div>
        </aside>
    );
}

export default Sidebar;
