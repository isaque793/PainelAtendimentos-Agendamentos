import { useCallback, useEffect, useRef, useState } from "react";

import ConfirmationNumberOutlinedIcon
    from "@mui/icons-material/ConfirmationNumberOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CheckCircleOutlinedIcon
    from "@mui/icons-material/CheckCircleOutlined";
import PersonSearchOutlinedIcon
    from "@mui/icons-material/PersonSearchOutlined";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    FormControlLabel,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";

import { cadastrarAtendimento }
    from "../../services/atendimentoService";

import {
    cadastrarCidadao,
    identificarCidadao,
} from "../../services/cidadaoService";

import { listarSetoresPublicos }
    from "../../services/setorService";

import {
    apenasDigitos,
    mascararCpf,
    mascararDocumentoOuNome,
    mascararMasp,
    mascararTelefone,
    resumoDocumentos,
} from "../../utils/formatacao";

import "./AtendimentoPublico.css";

const SEGUNDOS_ATE_RESETAR = 20;

const ASSUNTOS = [
    {
        valor: "documentacao",
        rotulo: "Entrega ou consulta de documentação",
    },
    { valor: "vida-escolar", rotulo: "Vida escolar" },
    { valor: "servidor", rotulo: "Assuntos relacionados a servidor" },
    { valor: "outros", rotulo: "Outros assuntos" },
];

const FORMULARIO_INICIAL = {
    nome: "",
    cpf: "",
    masp: "",
    telefone: "",
    tipoAtendimento: "",
    descricao: "",
    setorId: "",
    prioritario: false,
};

function AtendimentoPublico() {
    const [setores, setSetores] = useState([]);
    const [carregandoSetores, setCarregandoSetores] = useState(true);
    const [erroSetores, setErroSetores] = useState("");

    // aba 0 = primeiro cadastro; aba 1 = quem já tem cadastro.
    const [aba, setAba] = useState(0);

    const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

    const [termoIdentificacao, setTermoIdentificacao] = useState("");
    const [cidadaoIdentificado, setCidadaoIdentificado] =
        useState(null);
    const [identificando, setIdentificando] = useState(false);

    const [solicitacaoConcluida, setSolicitacaoConcluida] =
        useState(false);
    const [numeroSenhaGerada, setNumeroSenhaGerada] = useState("");

    const [enviando, setEnviando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState("");

    const timerResetRef = useRef(null);

    useEffect(() => {
        async function carregarSetores() {
            try {
                setCarregandoSetores(true);
                setErroSetores("");

                setSetores(
                    // O setor de Direção não é opção de atendimento —
                    // é usado só pelo login dos diretores.
                    (await listarSetoresPublicos()).filter(
                        (setor) => setor.perfil !== "DIRECAO"
                    )
                );
            } catch (erro) {
                console.error("Erro ao carregar setores:", erro);

                setErroSetores(
                    "Não foi possível carregar os setores disponíveis."
                );
            } finally {
                setCarregandoSetores(false);
            }
        }

        carregarSetores();
    }, []);

    const limparTudo = useCallback(() => {
        setFormulario(FORMULARIO_INICIAL);
        setTermoIdentificacao("");
        setCidadaoIdentificado(null);
        setMensagemErro("");
    }, []);

    // Reseta o totem sozinho depois de mostrar a confirmação por um
    // tempo — assim a tela fica pronta pro próximo cidadão sem que
    // ninguém precise tocar em nada.
    useEffect(() => {
        if (!solicitacaoConcluida) return undefined;

        timerResetRef.current = setTimeout(() => {
            setSolicitacaoConcluida(false);
            setNumeroSenhaGerada("");
            limparTudo();
        }, SEGUNDOS_ATE_RESETAR * 1000);

        return () => clearTimeout(timerResetRef.current);
    }, [solicitacaoConcluida, limparTudo]);

    function atualizarCampo(evento) {
        const { name, value } = evento.target;

        // Máscaras aplicadas na digitação: o que a pessoa vê é o
        // formato oficial; o que vai para a API são só os dígitos.
        const valorFormatado =
            name === "cpf"
                ? mascararCpf(value)
                : name === "masp"
                ? mascararMasp(value)
                : name === "telefone"
                ? mascararTelefone(value)
                : value;

        setFormulario((dadosAtuais) => ({
            ...dadosAtuais,
            [name]: valorFormatado,
        }));
    }

    function trocarAba(_evento, novaAba) {
        setAba(novaAba);
        limparTudo();
    }

    async function identificar(evento) {
        evento.preventDefault();

        try {
            setIdentificando(true);
            setMensagemErro("");

            const encontrado = await identificarCidadao(
                termoIdentificacao.trim()
            );

            setCidadaoIdentificado(encontrado);
        } catch (erro) {
            setCidadaoIdentificado(null);
            setMensagemErro(
                erro.message || "Não foi possível localizar o cadastro."
            );
        } finally {
            setIdentificando(false);
        }
    }

    async function entrarNaFila(evento) {
        evento.preventDefault();

        if (!formulario.setorId) {
            setMensagemErro(
                "Selecione o setor responsável pelo atendimento."
            );
            return;
        }

        try {
            setEnviando(true);
            setMensagemErro("");
            setSolicitacaoConcluida(false);

            // Na aba "já tenho cadastro" o cidadão já foi identificado;
            // na outra, cria-se o cadastro agora. Nos dois caminhos o
            // que segue adiante é só o id.
            const cidadao =
                cidadaoIdentificado
                || (await cadastrarCidadao({
                    nome: formulario.nome.trim(),
                    cpf: apenasDigitos(formulario.cpf) || null,
                    masp: apenasDigitos(formulario.masp) || null,
                    telefone:
                        apenasDigitos(formulario.telefone) || null,
                    email: null,
                }));

            if (!cidadao?.id) {
                throw new Error(
                    "O cadastro foi aceito, mas o sistema não "
                    + "retornou o identificador do cidadão."
                );
            }

            const atendimentoCriado = await cadastrarAtendimento({
                cidadao_id: cidadao.id,
                setor_id: Number(formulario.setorId),
                assunto: formulario.tipoAtendimento,
                descricao: formulario.descricao.trim() || null,
                prioridade: formulario.prioritario
                    ? "PRIORITARIO"
                    : "NORMAL",
            });

            setNumeroSenhaGerada(
                atendimentoCriado?.numero_senha || ""
            );
            setSolicitacaoConcluida(true);

            limparTudo();
        } catch (erro) {
            console.error("Erro ao solicitar atendimento:", erro);

            setMensagemErro(
                erro.message
                || "Não foi possível registrar o atendimento."
            );
        } finally {
            setEnviando(false);
        }
    }

    const camposDoAtendimento = (
        <>
            <TextField
                select
                fullWidth
                required
                label="Setor"
                name="setorId"
                value={formulario.setorId}
                onChange={atualizarCampo}
                disabled={carregandoSetores}
            >
                {setores.map((setor) => (
                    <MenuItem key={setor.id} value={setor.id}>
                        {setor.nome} ({setor.sigla})
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                fullWidth
                required
                label="Tipo de atendimento"
                name="tipoAtendimento"
                value={formulario.tipoAtendimento}
                onChange={atualizarCampo}
            >
                {ASSUNTOS.map((assunto) => (
                    <MenuItem
                        key={assunto.valor}
                        value={assunto.valor}
                    >
                        {assunto.rotulo}
                    </MenuItem>
                ))}
            </TextField>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={formulario.prioritario}
                        onChange={(evento) =>
                            setFormulario((dados) => ({
                                ...dados,
                                prioritario: evento.target.checked,
                            }))
                        }
                    />
                }
                label="Atendimento prioritário (pessoa idosa, gestante, lactante ou com deficiência)"
            />

            <TextField
                label="Descreva brevemente sua solicitação"
                name="descricao"
                value={formulario.descricao}
                onChange={atualizarCampo}
                multiline
                minRows={3}
                fullWidth
            />

            <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={
                    enviando
                    || carregandoSetores
                    || Boolean(erroSetores)
                }
            >
                {enviando
                    ? "Enviando solicitação..."
                    : "Entrar na fila de atendimento"}
            </Button>
        </>
    );

    return (
        <Box className="public-page">
            <Box className="public-header">
                <Container maxWidth="lg">
                    <Typography variant="h5" fontWeight={700}>
                        Painel de Atendimento
                    </Typography>

                    <Typography variant="body2">
                        Superintendência Regional de Ensino
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" className="public-content">
                <Box className="public-introduction">
                    <Typography variant="h3" component="h1" fontWeight={800}>
                        Solicite seu atendimento
                    </Typography>

                    <Typography color="text.secondary">
                        Preencha os dados abaixo para entrar na fila de
                        atendimento.
                    </Typography>
                </Box>

                {solicitacaoConcluida && (
                    <Alert
                        severity="success"
                        icon={<CheckCircleOutlinedIcon />}
                        className="success-message"
                    >
                        {numeroSenhaGerada
                            ? `Solicitação registrada! Sua senha é ${numeroSenhaGerada}. Aguarde ser chamado no painel.`
                            : "Solicitação registrada com sucesso!"}
                    </Alert>
                )}

                {mensagemErro && (
                    <Alert
                        severity="error"
                        className="success-message"
                        onClose={() => setMensagemErro("")}
                    >
                        {mensagemErro}
                    </Alert>
                )}

                {erroSetores && (
                    <Alert severity="error" className="success-message">
                        {erroSetores}
                    </Alert>
                )}

                <Card className="request-card">
                    <Tabs
                        value={aba}
                        onChange={trocarAba}
                        variant="fullWidth"
                        sx={{ borderBottom: 1, borderColor: "divider" }}
                    >
                        <Tab
                            icon={<BadgeOutlinedIcon />}
                            iconPosition="start"
                            label="Primeiro atendimento"
                        />

                        <Tab
                            icon={<PersonSearchOutlinedIcon />}
                            iconPosition="start"
                            label="Já tenho cadastro"
                        />
                    </Tabs>

                    <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                        {carregandoSetores && (
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                mb={3}
                            >
                                <CircularProgress size={20} />

                                <Typography variant="body2">
                                    Carregando setores...
                                </Typography>
                            </Stack>
                        )}

                        {aba === 1 && !cidadaoIdentificado && (
                            <Box component="form" onSubmit={identificar}>
                                <Stack spacing={2.5}>
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                        >
                                            Identifique-se
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Informe seu CPF, MASP ou nome
                                            completo. Vamos localizar seu
                                            cadastro para você entrar na
                                            fila sem preencher tudo de novo.
                                        </Typography>
                                    </Box>

                                    <TextField
                                        label="CPF, MASP ou nome completo"
                                        placeholder="000.000.000-00"
                                        value={termoIdentificacao}
                                        onChange={(evento) =>
                                            setTermoIdentificacao(
                                                mascararDocumentoOuNome(
                                                    evento.target.value
                                                )
                                            )
                                        }
                                        required
                                        fullWidth
                                        autoFocus
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={identificando}
                                    >
                                        {identificando
                                            ? "Procurando cadastro..."
                                            : "Localizar meu cadastro"}
                                    </Button>
                                </Stack>
                            </Box>
                        )}

                        {aba === 1 && cidadaoIdentificado && (
                            <Box
                                component="form"
                                onSubmit={entrarNaFila}
                            >
                                <Stack spacing={3}>
                                    <Box className="cidadao-confirmado">
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            flexWrap="wrap"
                                            gap={1}
                                        >
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Cadastro localizado
                                                </Typography>

                                                <Typography
                                                    variant="h6"
                                                    fontWeight={700}
                                                >
                                                    {cidadaoIdentificado.nome}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {resumoDocumentos(
                                                        cidadaoIdentificado
                                                    )}
                                                </Typography>
                                            </Box>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <Chip
                                                    size="small"
                                                    color="success"
                                                    label="Confirmado"
                                                />

                                                <Button
                                                    size="small"
                                                    onClick={() => {
                                                        setCidadaoIdentificado(
                                                            null
                                                        );
                                                        setTermoIdentificacao(
                                                            ""
                                                        );
                                                    }}
                                                >
                                                    Não sou eu
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Box>

                                    {camposDoAtendimento}
                                </Stack>
                            </Box>
                        )}

                        {aba === 0 && (
                            <Box component="form" onSubmit={entrarNaFila}>
                                <Stack spacing={3}>
                                    <Box className="request-card-title">
                                        <Box className="request-icon">
                                            <ConfirmationNumberOutlinedIcon />
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                            >
                                                Dados para atendimento
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Informe o CPF ou o MASP —
                                                pelo menos um dos dois é
                                                necessário.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <TextField
                                        label="Nome completo"
                                        name="nome"
                                        value={formulario.nome}
                                        onChange={atualizarCampo}
                                        required
                                        fullWidth
                                    />

                                    <Box className="form-row">
                                        <TextField
                                            label="CPF"
                                            name="cpf"
                                            placeholder="000.000.000-00"
                                            value={formulario.cpf}
                                            onChange={atualizarCampo}
                                            required={
                                                !apenasDigitos(
                                                    formulario.masp
                                                )
                                            }
                                            fullWidth
                                        />

                                        <TextField
                                            label="MASP (servidor)"
                                            name="masp"
                                            placeholder="1234567-8"
                                            value={formulario.masp}
                                            onChange={atualizarCampo}
                                            fullWidth
                                            helperText="Preencha se você for servidor."
                                        />
                                    </Box>

                                    <TextField
                                        label="Telefone"
                                        name="telefone"
                                        placeholder="(31) 99999-8888"
                                        value={formulario.telefone}
                                        onChange={atualizarCampo}
                                        fullWidth
                                    />

                                    {camposDoAtendimento}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                <Typography
                    className="privacy-message"
                    variant="body2"
                    color="text.secondary"
                >
                    Seus dados serão utilizados exclusivamente para
                    organizar e realizar o atendimento solicitado.
                </Typography>
            </Container>
        </Box>
    );
}

export default AtendimentoPublico;
