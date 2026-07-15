import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography
} from "@mui/material";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import "./Dashboard.css";

function Dashboard() {
    return (
        <main className="dashboard">
            <Box className="dashboard-header">
                <Box>
                    <Typography variant="h4" component="h2" fontWeight="bold">
                        Visão geral
                    </Typography>

                    <Typography color="text.secondary">
                        Acompanhe os atendimentos e agendamentos do sistema.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                >
                    Novo cidadão
                </Button>
            </Box>

            <Box className="cards-container">
                <Card className="dashboard-card">
                    <CardContent>
                        <Box className="card-title">
                            <Box className="card-icon">
                                <PeopleAltOutlinedIcon />
                            </Box>

                            <Typography color="text.secondary">
                                Cidadãos cadastrados
                            </Typography>
                        </Box>

                        <Typography variant="h4" fontWeight="bold">
                            128
                        </Typography>

                        <Typography variant="body2" color="success.main">
                            +8 neste mês
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="dashboard-card">
                    <CardContent>
                        <Box className="card-title">
                            <Box className="card-icon">
                                <CalendarMonthOutlinedIcon />
                            </Box>

                            <Typography color="text.secondary">
                                Agendamentos hoje
                            </Typography>
                        </Box>

                        <Typography variant="h4" fontWeight="bold">
                            12
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            4 ainda aguardando
                        </Typography>
                    </CardContent>
                </Card>

                <Card className="dashboard-card">
                    <CardContent>
                        <Box className="card-title">
                            <Box className="card-icon">
                                <AssignmentTurnedInOutlinedIcon />
                            </Box>

                            <Typography color="text.secondary">
                                Atendimentos concluídos
                            </Typography>
                        </Box>

                        <Typography variant="h4" fontWeight="bold">
                            8
                        </Typography>

                        <Typography variant="body2" color="success.main">
                            67% dos agendamentos
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Card className="appointments-card">
                <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                        Próximos atendimentos
                    </Typography>

                    <Typography color="text.secondary" marginBottom={3}>
                        Agendamentos previstos para hoje
                    </Typography>

                    <Stack spacing={2}>
                        <Box className="appointment-row">
                            <Box>
                                <Typography fontWeight="bold">
                                    João da Silva
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Atualização cadastral
                                </Typography>
                            </Box>

                            <Typography>09:30</Typography>

                            <Chip
                                label="Confirmado"
                                color="success"
                                size="small"
                            />
                        </Box>

                        <Box className="appointment-row">
                            <Box>
                                <Typography fontWeight="bold">
                                    Maria Oliveira
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Solicitação de atendimento
                                </Typography>
                            </Box>

                            <Typography>10:00</Typography>

                            <Chip
                                label="Aguardando"
                                color="warning"
                                size="small"
                            />
                        </Box>

                        <Box className="appointment-row">
                            <Box>
                                <Typography fontWeight="bold">
                                    Carlos Souza
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Entrega de documentação
                                </Typography>
                            </Box>

                            <Typography>10:30</Typography>

                            <Chip
                                label="Confirmado"
                                color="success"
                                size="small"
                            />
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </main>
    );
}

export default Dashboard;