import { useEffect, useState } from "react";

import ConfirmationNumberOutlinedIcon
    from "@mui/icons-material/ConfirmationNumberOutlined";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { cadastrarAtendimento } from "../../services/atendimentoService";
import { cadastrarCidadao } from "../../services/cidadaoService";
import { listarSetoresPublicos } from "../../services/setorService";

import "./AtendimentoPublico.css";


function AtendimentoPublico() {
    const [setores, setSetores] = useState([]);
    const [carregandoSetores, setCarregandoSetores] =
        useState(true);
    const [erroSetores, setErroSetores] = useState("");

    const [formulario, setFormulario] = useState({
        nome: "",
        cpf: "",
        telefone: "",
        tipoAtendimento: "",
        descricao: "",
        setorId: "",
    });

    const [solicitacaoConcluida, setSolicitacaoConcluida] =
        useState(false);

    const [enviando, setEnviando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState("");

    useEffect(() => {
        async function carregarSetores() {
            try {
                setCarregandoSetores(true);
                setErroSetores("");

                const dados = await listarSetoresPublicos();

                setSetores(dados);
            } catch (erro) {
                console.error(
                    "Erro ao carregar setores:",
                    erro
                );

                setErroSetores(
                    "Não foi possível carregar os setores disponíveis."
                );
            } finally {
                setCarregandoSetores(false);
            }
        }

        carregarSetores();
    }, []);

    function atualizarCampo(evento) {
        const { name, value } = evento.target;

        setFormulario((dadosAtuais) => ({
            ...dadosAtuais,
            [name]: value,
        }));
    }

    async function solicitarAtendimento(evento) {
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

            const cidadaoCriado = await cadastrarCidadao({
                nome: formulario.nome.trim(),
                cpf:
                    formulario.cpf.replace(/\D/g, "")
                    || null,
                telefone:
                    formulario.telefone.replace(/\D/g, "")
                    || null,
                email: null,
                masp: null,
            });

            console.log(
                "Resposta do cidadão:",
                cidadaoCriado
            );

            if (!cidadaoCriado?.id) {
                throw new Error(
                    "O backend cadastrou o cidadão, "
                    + "mas não retornou o ID."
                );
            }

            const dadosAtendimento = {
                cidadao_id: cidadaoCriado.id,
                setor_id: Number(formulario.setorId),
                assunto: formulario.tipoAtendimento,
                descricao:
                    formulario.descricao.trim()
                    || null,
                prioridade: "NORMAL",
            };

            console.log(
                "Dados enviados ao atendimento:",
                dadosAtendimento
            );

            const atendimentoCriado =
                await cadastrarAtendimento(
                    dadosAtendimento
                );

            console.log(
                "Atendimento criado:",
                atendimentoCriado
            );

            setSolicitacaoConcluida(true);

            setFormulario({
                nome: "",
                cpf: "",
                telefone: "",
                tipoAtendimento: "",
                descricao: "",
                setorId: "",
            });
        } catch (erro) {
            console.error(
                "Erro ao solicitar atendimento:",
                erro
            );

            setMensagemErro(
                erro.message
                || "Não foi possível registrar o atendimento."
            );
        } finally {
            setEnviando(false);
        }
    }

    return (
        <Box className="public-page">
            <Box className="public-header">
                <Container maxWidth="lg">
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                    >
                        Painel de Atendimento
                    </Typography>

                    <Typography variant="body2">
                        Superintendência Regional de Ensino
                    </Typography>
                </Container>
            </Box>

            <Container
                maxWidth="md"
                className="public-content"
            >
                <Box className="public-introduction">
                    <Typography
                        variant="h3"
                        component="h1"
                        fontWeight="bold"
                    >
                        Solicite seu atendimento
                    </Typography>

                    <Typography color="text.secondary">
                        Preencha os dados abaixo para entrar
                        na fila de atendimento.
                    </Typography>
                </Box>

                {solicitacaoConcluida && (
                    <Alert
                        severity="success"
                        className="success-message"
                    >
                        Solicitação registrada com sucesso!
                    </Alert>
                )}

                {mensagemErro && (
                    <Alert
                        severity="error"
                        className="success-message"
                    >
                        {mensagemErro}
                    </Alert>
                )}

                <Card className="request-card">
                    <CardContent>
                        <Box className="request-card-title">
                            <Box className="request-icon">
                                <ConfirmationNumberOutlinedIcon />
                            </Box>

                            <Box>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                >
                                    Dados para atendimento
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Os campos marcados são
                                    necessários para registrar
                                    sua solicitação.
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            component="form"
                            onSubmit={solicitarAtendimento}
                        >
                            <Stack spacing={3}>
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
                                        value={formulario.cpf}
                                        onChange={atualizarCampo}
                                        required
                                        fullWidth
                                    />

                                    <TextField
                                        label="Telefone"
                                        name="telefone"
                                        value={formulario.telefone}
                                        onChange={atualizarCampo}
                                        fullWidth
                                    />
                                </Box>

                                {carregandoSetores && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <CircularProgress
                                            size={20}
                                        />

                                        <Typography
                                            variant="body2"
                                        >
                                            Carregando setores...
                                        </Typography>
                                    </Box>
                                )}

                                {erroSetores && (
                                    <Alert severity="error">
                                        {erroSetores}
                                    </Alert>
                                )}

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
                                        <MenuItem
                                            key={setor.id}
                                            value={setor.id}
                                        >
                                            {setor.nome}
                                            {" "}
                                            ({setor.sigla})
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <FormControl
                                    fullWidth
                                    required
                                >
                                    <InputLabel>
                                        Tipo de atendimento
                                    </InputLabel>

                                    <Select
                                        label="Tipo de atendimento"
                                        name="tipoAtendimento"
                                        value={
                                            formulario
                                                .tipoAtendimento
                                        }
                                        onChange={atualizarCampo}
                                    >
                                        <MenuItem
                                            value="documentacao"
                                        >
                                            Entrega ou consulta
                                            de documentação
                                        </MenuItem>

                                        <MenuItem
                                            value="vida-escolar"
                                        >
                                            Vida escolar
                                        </MenuItem>

                                        <MenuItem
                                            value="servidor"
                                        >
                                            Assuntos relacionados
                                            a servidor
                                        </MenuItem>

                                        <MenuItem
                                            value="outros"
                                        >
                                            Outros assuntos
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label={
                                        "Descreva brevemente "
                                        + "sua solicitação"
                                    }
                                    name="descricao"
                                    value={formulario.descricao}
                                    onChange={atualizarCampo}
                                    multiline
                                    minRows={4}
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
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                <Typography
                    className="privacy-message"
                    variant="body2"
                    color="text.secondary"
                >
                    Seus dados serão utilizados exclusivamente
                    para organizar e realizar o atendimento solicitado.
                </Typography>
            </Container>
        </Box>
    );
}

export default AtendimentoPublico;