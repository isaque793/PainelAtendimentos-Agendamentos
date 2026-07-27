import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import PeopleAltOutlinedIcon
    from "@mui/icons-material/PeopleAltOutlined";
import AssignmentTurnedInOutlinedIcon
    from "@mui/icons-material/AssignmentTurnedInOutlined";
import HourglassEmptyOutlinedIcon
    from "@mui/icons-material/HourglassEmptyOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SupportAgentOutlinedIcon
    from "@mui/icons-material/SupportAgentOutlined";
import DeleteOutlineOutlinedIcon
    from "@mui/icons-material/DeleteOutlineOutlined";
import ChevronRightOutlinedIcon
    from "@mui/icons-material/ChevronRightOutlined";

import {
    buscarCidadaos,
    excluirCidadao,
    listarCidadaos,
} from "../../services/cidadaoService";

import {
    listarAtendimentosAguardando,
    listarAtendimentosFinalizados,
} from "../../services/atendimentoService";

import {
    mascararDocumentoOuNome,
    resumoDocumentos,
} from "../../utils/formatacao";

import { ehDirecao, obterSessaoServidor } from "../../utils/sessao";

import "./Dashboard.css";

function formatarData(data) {
    if (!data) return "--/--/---- --:--";

    return new Date(data).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function CardResumo({ icone, rotulo, valor, apoio, aoClicar }) {
    return (
        <Card
            className="dashboard-card"
            onClick={aoClicar}
            sx={aoClicar ? { cursor: "pointer" } : undefined}
        >
            <CardContent>
                <Box className="card-title">
                    <Box className="card-icon">{icone}</Box>

                    <Typography color="text.secondary" variant="body2">
                        {rotulo}
                    </Typography>
                </Box>

                <Typography variant="h4" fontWeight={800} mt={1}>
                    {valor}
                </Typography>

                <Typography
                    variant="body2"
                    color={aoClicar ? "primary" : "text.secondary"}
                    mt={0.5}
                >
                    {apoio}
                </Typography>
            </CardContent>
        </Card>
    );
}

function Dashboard() {
    const navigate = useNavigate();

    // A exclusão de cadastro é uma ação destrutiva e protegida por
    // login — como o Dashboard agora está atrás de RotaProtegida, a
    // sessão sempre existe aqui, mas o utilitário lida bem mesmo se
    // não existir.
    const sessaoServidor = useMemo(() => obterSessaoServidor(), []);
    const direcao = ehDirecao();

    const podeExcluir = Boolean(sessaoServidor?.access_token);

    const [listaCidadaos, setListaCidadaos] = useState([]);
    const [aguardando, setAguardando] = useState([]);
    const [totalFinalizados, setTotalFinalizados] = useState(0);
    const [carregandoResumo, setCarregandoResumo] = useState(true);

    const [termoBusca, setTermoBusca] = useState("");
    const [resultadosBusca, setResultadosBusca] = useState([]);
    const [tituloResultados, setTituloResultados] = useState("");
    const [buscando, setBuscando] = useState(false);
    const [buscaFeita, setBuscaFeita] = useState(false);
    const [erroBusca, setErroBusca] = useState("");

    const [cidadaoParaExcluir, setCidadaoParaExcluir] = useState(null);
    const [excluindo, setExcluindo] = useState(false);
    const [aviso, setAviso] = useState("");

    const carregarResumo = useCallback(async () => {
        try {
            setCarregandoResumo(true);

            const [cidadaos, fila, finalizados] = await Promise.all([
                listarCidadaos(),
                listarAtendimentosAguardando(),
                listarAtendimentosFinalizados(),
            ]);

            setListaCidadaos(Array.isArray(cidadaos) ? cidadaos : []);
            setAguardando(Array.isArray(fila) ? fila : []);
            setTotalFinalizados(
                Array.isArray(finalizados) ? finalizados.length : 0
            );
        } catch {
            // Falha ao carregar o resumo não deve travar o resto da tela.
        } finally {
            setCarregandoResumo(false);
        }
    }, []);

    useEffect(() => {
        carregarResumo();
    }, [carregarResumo]);

    async function pesquisar(evento) {
        evento.preventDefault();

        const termo = termoBusca.trim();

        if (!termo) return;

        try {
            setBuscando(true);
            setBuscaFeita(true);
            setErroBusca("");
            setTituloResultados(`Resultados para "${termo}"`);

            const resultados = await buscarCidadaos(termo);

            setResultadosBusca(
                Array.isArray(resultados) ? resultados : []
            );
        } catch (erro) {
            setResultadosBusca([]);
            setErroBusca(erro.message || "Falha ao buscar.");
        } finally {
            setBuscando(false);
        }
    }

    function mostrarTodosOsCidadaos() {
        setTermoBusca("");
        setErroBusca("");
        setBuscando(false);
        setBuscaFeita(true);
        setTituloResultados("Todos os cidadãos cadastrados");
        setResultadosBusca(listaCidadaos);

        document
            .getElementById("resultados-busca")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function confirmarExclusao() {
        if (!cidadaoParaExcluir) return;

        try {
            setExcluindo(true);

            const resposta = await excluirCidadao(
                cidadaoParaExcluir.id
            );

            const removidos = resposta?.atendimentos_removidos || 0;

            setAviso(
                `Cadastro de ${cidadaoParaExcluir.nome} excluído`
                + (removidos
                    ? ` junto com ${removidos} atendimento(s) do histórico.`
                    : ".")
            );

            // Tira da lista aberta na hora, para a tela não continuar
            // mostrando alguém que já não existe mais.
            setResultadosBusca((atuais) =>
                atuais.filter(
                    (item) => item.id !== cidadaoParaExcluir.id
                )
            );

            setCidadaoParaExcluir(null);

            await carregarResumo();
        } catch (erro) {
            setErroBusca(
                erro.message || "Não foi possível excluir o cadastro."
            );
            setCidadaoParaExcluir(null);
        } finally {
            setExcluindo(false);
        }
    }

    return (
        <>
            <Box className="dashboard-header">
                <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="h4" component="h2">
                            Visão geral
                        </Typography>

                        {direcao && (
                            <Chip
                                size="small"
                                color="warning"
                                label="Direção — todos os setores"
                            />
                        )}
                    </Stack>

                    <Typography color="text.secondary" mt={0.5}>
                        {direcao
                            ? "Acompanhe os atendimentos de todos os setores e consulte registros por cidadão."
                            : "Acompanhe os atendimentos do seu setor e consulte registros por cidadão."}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={
                        direcao
                            ? <AssignmentTurnedInOutlinedIcon />
                            : <SupportAgentOutlinedIcon />
                    }
                    onClick={() =>
                        navigate(
                            direcao
                                ? "/direcao/relatorios"
                                : "/direcao/atendimentos"
                        )
                    }
                >
                    {direcao ? "Relatórios" : "Painel de Atendimentos"}
                </Button>
            </Box>

            <Box component="form" onSubmit={pesquisar} sx={{ mb: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                        fullWidth
                        value={termoBusca}
                        onChange={(evento) =>
                            setTermoBusca(
                                mascararDocumentoOuNome(
                                    evento.target.value
                                )
                            )
                        }
                        placeholder="Busque por CPF, MASP ou nome do cidadão"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlinedIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={buscando}
                        sx={{ px: 4, whiteSpace: "nowrap" }}
                    >
                        {buscando ? "Buscando..." : "Buscar"}
                    </Button>
                </Stack>

                {buscaFeita && (
                    <Card id="resultados-busca" sx={{ mt: 1.5 }}>
                        <CardContent sx={{ py: 2 }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1}
                            >
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    {tituloResultados}
                                </Typography>

                                <Chip
                                    size="small"
                                    label={`${resultadosBusca.length} registro(s)`}
                                />
                            </Stack>

                            <Divider />

                            {buscando ? (
                                <Box className="centralizado">
                                    <CircularProgress size={22} />
                                </Box>
                            ) : erroBusca ? (
                                <Alert
                                    severity="error"
                                    sx={{ mt: 2 }}
                                    onClose={() => setErroBusca("")}
                                >
                                    {erroBusca}
                                </Alert>
                            ) : resultadosBusca.length === 0 ? (
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                    mt={2}
                                >
                                    {termoBusca
                                        ? `Nenhum cidadão encontrado para "${termoBusca}".`
                                        : "Nenhum cidadão cadastrado ainda."}
                                </Typography>
                            ) : (
                                <List dense sx={{ mt: 0.5 }}>
                                    {resultadosBusca.map((cidadao) => (
                                        <ListItem
                                            key={cidadao.id}
                                            disableGutters
                                            secondaryAction={
                                                <Tooltip
                                                    title={
                                                        podeExcluir
                                                            ? "Excluir cadastro e histórico"
                                                            : "Entre com o acesso do servidor para poder excluir"
                                                    }
                                                >
                                                    {/* <span> porque o Tooltip
                                                        não dispara em botão
                                                        desabilitado. */}
                                                    <span>
                                                        <IconButton
                                                            edge="end"
                                                            color="error"
                                                            disabled={!podeExcluir}
                                                            onClick={() =>
                                                                setCidadaoParaExcluir(
                                                                    cidadao
                                                                )
                                                            }
                                                        >
                                                            <DeleteOutlineOutlinedIcon />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            }
                                        >
                                            <ListItemButton
                                                onClick={() =>
                                                    navigate(
                                                        `/direcao/pessoa/${cidadao.id}`
                                                    )
                                                }
                                            >
                                                <ListItemText
                                                    primary={cidadao.nome}
                                                    secondary={
                                                        resumoDocumentos(cidadao)
                                                        || "Sem documento cadastrado"
                                                    }
                                                    primaryTypographyProps={{
                                                        fontWeight: 600,
                                                    }}
                                                />

                                                <ChevronRightOutlinedIcon
                                                    fontSize="small"
                                                    color="disabled"
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Box>

            <Box className="cards-container">
                <CardResumo
                    icone={<PeopleAltOutlinedIcon />}
                    rotulo="Cidadãos cadastrados"
                    valor={
                        carregandoResumo ? "—" : listaCidadaos.length
                    }
                    apoio="Clique para ver todos"
                    aoClicar={mostrarTodosOsCidadaos}
                />

                <CardResumo
                    icone={<AssignmentTurnedInOutlinedIcon />}
                    rotulo="Atendimentos concluídos"
                    valor={carregandoResumo ? "—" : totalFinalizados}
                    apoio="Total já finalizado no sistema"
                />

                <CardResumo
                    icone={<HourglassEmptyOutlinedIcon />}
                    rotulo="Aguardando na fila"
                    valor={carregandoResumo ? "—" : aguardando.length}
                    apoio="Pessoas ainda não chamadas"
                />
            </Box>

            <Card className="appointments-card">
                <CardContent>
                    <Typography variant="h6">Fila atual</Typography>

                    <Typography color="text.secondary" mb={2.5}>
                        Cidadãos aguardando atendimento agora
                    </Typography>

                    {carregandoResumo ? (
                        <Box className="centralizado">
                            <CircularProgress size={26} />
                        </Box>
                    ) : aguardando.length === 0 ? (
                        <Alert severity="info">
                            Ninguém aguardando no momento.
                        </Alert>
                    ) : (
                        <Stack spacing={1.5}>
                            {aguardando.slice(0, 6).map((atendimento) => (
                                <Box
                                    key={atendimento.id}
                                    className="appointment-row"
                                    onClick={() =>
                                        navigate(
                                            `/direcao/pessoa/${atendimento.cidadao_id}`
                                        )
                                    }
                                >
                                    <Box>
                                        <Typography fontWeight={700}>
                                            {atendimento.cidadao?.nome
                                                || `Cidadão #${atendimento.cidadao_id}`}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {atendimento.numero_senha
                                                ? `${atendimento.numero_senha} · `
                                                : ""}
                                            {atendimento.assunto
                                                || "Assunto não informado"}
                                        </Typography>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {formatarData(
                                            atendimento.data_solicitacao
                                        )}
                                    </Typography>

                                    <Chip
                                        label={
                                            atendimento.prioridade
                                                === "PRIORITARIO"
                                                ? "Prioritário"
                                                : "Aguardando"
                                        }
                                        color={
                                            atendimento.prioridade
                                                === "PRIORITARIO"
                                                ? "error"
                                                : "warning"
                                        }
                                        size="small"
                                    />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={Boolean(cidadaoParaExcluir)}
                onClose={() =>
                    !excluindo && setCidadaoParaExcluir(null)
                }
            >
                <DialogTitle>Excluir cadastro?</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        O cadastro de{" "}
                        <strong>{cidadaoParaExcluir?.nome}</strong>{" "}
                        será apagado junto com todo o histórico de
                        atendimentos dessa pessoa. Esta ação não pode
                        ser desfeita.
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setCidadaoParaExcluir(null)}
                        disabled={excluindo}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={confirmarExclusao}
                        disabled={excluindo}
                    >
                        {excluindo ? "Excluindo..." : "Excluir"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={Boolean(aviso)}
                autoHideDuration={5000}
                onClose={() => setAviso("")}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert severity="success" onClose={() => setAviso("")}>
                    {aviso}
                </Alert>
            </Snackbar>
        </>
    );
}

export default Dashboard;
