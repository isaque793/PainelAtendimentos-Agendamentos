import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import {
  apenasDigitos,
  mascararDocumentoOuNome,
  resumoDocumentos,
} from "../../utils/formatacao";


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
  const [termo, setTermo] = useState("");
  const navigate = useNavigate();

  // A busca compara sempre só os dígitos do documento: assim funciona
  // tanto se o servidor digitar "144.146.336-48" quanto "14414633648".
  const termoNormalizado = termo.trim().toLowerCase();
  const digitosBuscados = apenasDigitos(termo);

  const atendimentosFiltrados = termoNormalizado
    ? atendimentos.filter((atendimento) => {
        const nome = (atendimento?.cidadao?.nome || "").toLowerCase();

        if (nome.includes(termoNormalizado)) {
          return true;
        }

        if (!digitosBuscados) {
          return false;
        }

        const cpf = apenasDigitos(atendimento?.cidadao?.cpf);
        const masp = apenasDigitos(atendimento?.cidadao?.masp);

        return (
          cpf.includes(digitosBuscados) || masp.includes(digitosBuscados)
        );
      })
    : atendimentos;

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

          <TextField
            size="small"
            fullWidth
            value={termo}
            onChange={(evento) =>
              setTermo(mascararDocumentoOuNome(evento.target.value))
            }
            placeholder="Buscar por nome, CPF ou MASP"
            InputProps={{
              startAdornment: <SearchOutlinedIcon fontSize="small" color="action" style={{ marginRight: 6 }} />,
            }}
          />

          <Divider />

          {atendimentosFiltrados.length === 0 ? (
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
                {atendimentos.length === 0
                  ? "Nenhum atendimento foi finalizado hoje."
                  : "Nenhum resultado para essa busca."}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {atendimentosFiltrados.map((atendimento) => {
                const nome =
                  atendimento?.cidadao?.nome ||
                  `Cidadão #${atendimento?.cidadao_id}`;

                return (
                  <Box
                    key={atendimento.id}
                    onClick={() => navigate(`/direcao/pessoa/${atendimento.cidadao_id}`)}
                    sx={{ cursor: "pointer" }}
                  >
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

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          noWrap
                        >
                          {resumoDocumentos(atendimento?.cidadao)}
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