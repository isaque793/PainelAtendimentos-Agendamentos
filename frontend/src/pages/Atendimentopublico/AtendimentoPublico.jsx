import { useState } from "react";

import { cadastrarCidadao } from "../../services/cidadaoService";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import ConfirmationNumberOutlinedIcon
    from "@mui/icons-material/ConfirmationNumberOutlined";

import "./AtendimentoPublico.css";

function AtendimentoPublico() {
    const [formulario, setFormulario] = useState({
        nome: "",
        cpf: "",
        telefone: "",
        tipoAtendimento: "",
        descricao: ""
    });

    const [solicitacaoConcluida, setSolicitacaoConcluida] =
        useState(false);

    const [enviando, setEnviando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState("");
    
    function atualizarCampo(evento) {
        const { name, value } = evento.target;

        setFormulario((dadosAtuais) => ({
            ...dadosAtuais,
            [name]: value
        }));
    }
    

    async function solicitarAtendimento(evento) {
    evento.preventDefault();

    try {
        setEnviando(true);
        setMensagemErro("");
        setSolicitacaoConcluida(false);

        await cadastrarCidadao({
            nome: formulario.nome.trim(),
            cpf: formulario.cpf.replace(/\D/g, ""),
            telefone: formulario.telefone.replace(/\D/g, "") || null,
            email: null,
            masp: null
        });

        setSolicitacaoConcluida(true);

        setFormulario({
            nome: "",
            cpf: "",
            telefone: "",
            tipoAtendimento: "",
            descricao: ""
        });
    } catch (erro) {
        setMensagemErro(erro.message);
    } finally {
        setEnviando(false);
    }
}

    return (
        <Box className="public-page">
            <Box className="public-header">
                <Container maxWidth="lg">
                    <Typography variant="h5" fontWeight="bold">
                        Painel de Atendimento 
                    </Typography>

                    <Typography variant="body2">
                        Superintendência Regional de Ensino
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" className="public-content">
                <Box className="public-introduction">
                    <Typography
                        variant="h3"
                        component="h1"
                        fontWeight="bold"
                    >
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
                        className="success-message"
                    >
                        Solicitação registrada! Em breve exibiremos aqui
                        sua senha e sua posição na fila.
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
                                    Os campos marcados são necessários para
                                    gerar sua senha.
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

                                <FormControl fullWidth required>
                                    <InputLabel>
                                        Tipo de atendimento
                                    </InputLabel>

                                    <Select
                                        label="Tipo de atendimento"
                                        name="tipoAtendimento"
                                        value={formulario.tipoAtendimento}
                                        onChange={atualizarCampo}
                                    >
                                        <MenuItem value="documentacao">
                                            Entrega ou consulta de documentação
                                        </MenuItem>

                                        <MenuItem value="vida-escolar">
                                            Vida escolar
                                        </MenuItem>

                                        <MenuItem value="servidor">
                                            Assuntos relacionados a servidor
                                        </MenuItem>

                                        <MenuItem value="outros">
                                            Outros assuntos
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Descreva brevemente sua solicitação"
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
                                   disabled={enviando}
>
                                   {enviando
                                      ? "Enviando solicitação..."
                                      : "Entrar na fila de atendimento"
                                    }
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
                    Seus dados serão utilizados exclusivamente para organizar
                    e realizar o atendimento solicitado.
                </Typography>
            </Container>
        </Box>
    );
}

export default AtendimentoPublico;