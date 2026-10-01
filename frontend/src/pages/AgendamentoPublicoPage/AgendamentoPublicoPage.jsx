import { useEffect, useState } from "react";

import CalendarMonthOutlinedIcon
    from "@mui/icons-material/CalendarMonthOutlined";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Stack,
    Typography,
} from "@mui/material";

import { listarSetoresPublicos }
    from "../../services/setorService";

import AgendamentoPublico
    from "../AgendamentoPublico/AgendamentoPublico";

import "./AgendamentoPublicoPage.css";

export default function AgendamentoPublicoPage() {
    const [setores, setSetores] = useState([]);
    const [carregandoSetores, setCarregandoSetores] = useState(true);
    const [erroSetores, setErroSetores] = useState("");

    useEffect(() => {
        async function carregarSetores() {
            try {
                setCarregandoSetores(true);
                setErroSetores("");

                setSetores(
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

    return (
        <Box className="public-page">
            <Box className="public-header">
                <Container maxWidth="lg">
                    <Box className="public-header-inner">
                        <Box
                            component="img"
                            className="public-header-brasao"
                            src="/brasao-mg.jpg"
                            alt="Brasão do Estado de Minas Gerais"
                        />

                        <Box className="public-header-copy">
                            <Typography
                                className="public-header-kicker"
                                variant="overline"
                            >
                                SIGA · Atendimento ao cidadão
                            </Typography>

                            <Typography variant="h5" fontWeight={700}>
                                Painel de Atendimento
                            </Typography>

                            <Typography variant="body2">
                                Superintendência Regional de Ensino
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="md" className="public-content">
                <Box className="public-introduction">
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography
                                variant="h3"
                                component="h1"
                                fontWeight={800}
                            >
                                Agende seu atendimento
                            </Typography>

                            <Typography color="text.secondary">
                                Escolha o setor, a data e o horário para
                                realizar seu atendimento.
                            </Typography>
                        </Box>

                        <Button
                            href="/"
                            variant="outlined"
                            startIcon={<CalendarMonthOutlinedIcon />}
                        >
                            Solicitar atendimento agora
                        </Button>
                    </Stack>
                </Box>

                {erroSetores && (
                    <Alert severity="error" className="success-message">
                        {erroSetores}
                    </Alert>
                )}

                <Card className="request-card">
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

                        <AgendamentoPublico
                            setores={setores}
                            carregandoSetores={carregandoSetores}
                        />
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
