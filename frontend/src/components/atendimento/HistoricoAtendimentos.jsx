import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HistoryIcon from "@mui/icons-material/History";


function formatarHorario(data) {
  if (!data) {
    return "--:--";
  }

  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}


export default function HistoricoAtendimentos({
  atendimentos = [],
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        minHeight: 360,
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          
          <Divider />

          {atendimentos.length === 0 ? (
            <Box
              sx={{
                minHeight: 240,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Nenhum atendimento foi finalizado hoje.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {atendimentos.map((atendimento) => {
                const nome =
                  atendimento?.cidadao?.nome ||
                  `Cidadão #${atendimento?.cidadao_id}`;

                return (
                  <Box key={atendimento.id}>
                    <Stack
                      direction="row"
                      spacing={1.25}
                      alignItems="center"
                      py={1}
                    >
                      <CheckCircleOutlinedIcon
                        color="success"
                        fontSize="small"
                      />

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          noWrap
                        >
                          {nome}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {atendimento?.assunto ||
                            "Assunto não informado"}
                        </Typography>
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatarHorario(
                          atendimento?.data_finalizacao
                        )}
                      </Typography>
                    </Stack>

                    <Divider />
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}