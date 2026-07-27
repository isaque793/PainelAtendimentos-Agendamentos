import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    MenuItem,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";

import AssessmentOutlinedIcon
    from "@mui/icons-material/AssessmentOutlined";
import DescriptionOutlinedIcon
    from "@mui/icons-material/DescriptionOutlined";
import CalendarMonthOutlinedIcon
    from "@mui/icons-material/CalendarMonthOutlined";
import DateRangeOutlinedIcon
    from "@mui/icons-material/DateRangeOutlined";

import { API_URL } from "../../api/api";
import { urlRelatorio } from "../../services/atendimentoService";
import { listarSetoresPublicos } from "../../services/setorService";
import { ehDirecao, obterSessaoServidor } from "../../utils/sessao";

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function nomeArquivoPadrao(tipo) {
    const hoje = new Date().toISOString().slice(0, 10);
    return `relatorio-atendimentos-${tipo}-${hoje}.xlsx`;
}

export default function Relatorios() {
    const sessao = useMemo(() => obterSessaoServidor(), []);
    const direcao = ehDirecao();

    const hoje = new Date();

    const [tipo, setTipo] = useState("mensal");
    const [ano, setAno] = useState(hoje.getFullYear());
    const [mes, setMes] = useState(hoje.getMonth() + 1);
    const [dataReferencia, setDataReferencia] = useState(
        hoje.toISOString().slice(0, 10)
    );

    // Só a Direção escolhe o setor — para os demais perfis o backend
    // sempre usa o próprio setor, então a interface nem mostra a opção.
    const [setorId, setSetorId] = useState("todos");
    const [setores, setSetores] = useState([]);

    useEffect(() => {
        if (!direcao) return;

        listarSetoresPublicos()
            .then((lista) =>
                setSetores(
                    (Array.isArray(lista) ? lista : []).filter(
                        (setor) => setor.perfil !== "DIRECAO"
                    )
                )
            )
            .catch(() => setSetores([]));
    }, [direcao]);

    const [gerando, setGerando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const anosDisponiveis = useMemo(() => {
        const atual = hoje.getFullYear();
        return [atual, atual - 1, atual - 2];
    }, [hoje]);

    async function gerarRelatorio() {
        const token = sessao?.access_token;

        if (!token) {
            setErro("Faça login novamente para emitir o relatório.");
            return;
        }

        try {
            setGerando(true);
            setErro("");
            setSucesso("");

            const url = urlRelatorio({
                tipo,
                ano,
                mes,
                dataReferencia,
                setorId:
                    direcao && setorId !== "todos"
                        ? setorId
                        : undefined,
            });

            const resposta = await fetch(`${API_URL}${url}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!resposta.ok) {
                let mensagem = "O servidor recusou a emissão do relatório.";

                try {
                    const corpo = await resposta.json();
                    mensagem = corpo.detail || mensagem;
                } catch {
                    // mantém a mensagem padrão
                }

                throw new Error(mensagem);
            }

            const dispositionCabecalho = resposta.headers.get(
                "content-disposition"
            );

            const nomeCorrespondido = dispositionCabecalho?.match(
                /filename\*=UTF-8''([^;]+)/
            );

            const nomeArquivo = nomeCorrespondido
                ? decodeURIComponent(nomeCorrespondido[1])
                : nomeArquivoPadrao(tipo);

            const blob = await resposta.blob();
            const objetoUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = objetoUrl;
            link.download = nomeArquivo;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(objetoUrl);

            setSucesso("Relatório gerado e baixado com sucesso.");
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);

            setErro(
                error.message
                || "Não foi possível gerar o relatório."
            );
        } finally {
            setGerando(false);
        }
    }

    return (
        <Container maxWidth="md" disableGutters>
            <Stack spacing={3}>
                <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <AssessmentOutlinedIcon color="primary" fontSize="large" />

                        <Typography variant="h4" fontWeight={800}>
                            Relatórios
                        </Typography>
                    </Stack>

                    <Typography color="text.secondary" mt={0.5}>
                        {direcao
                            ? "Gere a planilha de atendimentos de um setor específico ou de todos juntos."
                            : "Gere a planilha de atendimentos do seu setor."}
                    </Typography>
                </Box>

                {erro && (
                    <Alert severity="error" onClose={() => setErro("")}>
                        {erro}
                    </Alert>
                )}

                {sucesso && (
                    <Alert
                        severity="success"
                        onClose={() => setSucesso("")}
                    >
                        {sucesso}
                    </Alert>
                )}

                <Card>
                    <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    mb={1}
                                >
                                    Período
                                </Typography>

                                <ToggleButtonGroup
                                    exclusive
                                    value={tipo}
                                    onChange={(_evento, novoValor) => {
                                        if (novoValor) setTipo(novoValor);
                                    }}
                                    fullWidth
                                >
                                    <ToggleButton value="mensal">
                                        <CalendarMonthOutlinedIcon
                                            fontSize="small"
                                            sx={{ mr: 1 }}
                                        />
                                        Mensal
                                    </ToggleButton>

                                    <ToggleButton value="semanal">
                                        <DateRangeOutlinedIcon
                                            fontSize="small"
                                            sx={{ mr: 1 }}
                                        />
                                        Semanal
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            {tipo === "mensal" ? (
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={2}
                                >
                                    <TextField
                                        select
                                        fullWidth
                                        label="Mês"
                                        value={mes}
                                        onChange={(evento) =>
                                            setMes(Number(evento.target.value))
                                        }
                                    >
                                        {MESES.map((nome, indice) => (
                                            <MenuItem
                                                key={nome}
                                                value={indice + 1}
                                            >
                                                {nome}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        select
                                        fullWidth
                                        label="Ano"
                                        value={ano}
                                        onChange={(evento) =>
                                            setAno(Number(evento.target.value))
                                        }
                                    >
                                        {anosDisponiveis.map((valor) => (
                                            <MenuItem key={valor} value={valor}>
                                                {valor}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>
                            ) : (
                                <TextField
                                    type="date"
                                    label="Qualquer dia da semana desejada"
                                    value={dataReferencia}
                                    onChange={(evento) =>
                                        setDataReferencia(evento.target.value)
                                    }
                                    helperText="O relatório traz a semana inteira (segunda a domingo) que contém essa data."
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}

                            {direcao && (
                                <TextField
                                    select
                                    fullWidth
                                    label="Abrangência"
                                    value={setorId}
                                    onChange={(evento) =>
                                        setSetorId(evento.target.value)
                                    }
                                >
                                    <MenuItem value="todos">
                                        Todos os setores (consolidado)
                                    </MenuItem>

                                    {setores.map((setor) => (
                                        <MenuItem
                                            key={setor.id}
                                            value={String(setor.id)}
                                        >
                                            {setor.nome} ({setor.sigla})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<DescriptionOutlinedIcon />}
                                onClick={gerarRelatorio}
                                disabled={gerando}
                            >
                                {gerando
                                    ? "Gerando planilha..."
                                    : "Gerar e baixar planilha (Excel)"}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Container>
    );
}
