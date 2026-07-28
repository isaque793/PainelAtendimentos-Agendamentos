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
      borderColor: "divider",
      bgcolor: "background.paper",
      boxShadow: "0 3px 12px rgba(31, 41, 55, 0.06)",
    }}
  >
    <CardContent
      sx={{
        p: {
          xs: 2,
          md: 2.5,
        },
        "&:last-child": {
          pb: {
            xs: 2,
            md: 2.5,
          },
        },
      }}
    >
      <Stack spacing={2}>
        <TextField
          size="small"
          fullWidth
          value={termo}
          onChange={(evento) =>
            setTermo(
              mascararDocumentoOuNome(evento.target.value)
            )
          }
          placeholder="Buscar por nome, CPF ou MASP"
          InputProps={{
            startAdornment: (
              <SearchOutlinedIcon
                fontSize="small"
                color="action"
                sx={{ mr: 1 }}
              />
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              bgcolor: "background.default",
            },
          }}
        />

        <Divider />

        {atendimentosFiltrados.length === 0 ? (
          <Box
            sx={{
              minHeight: 240,
              display: "grid",
              placeItems: "center",
              px: 2,
            }}
          >
            <Stack
              spacing={1.25}
              alignItems="center"
              textAlign="center"
            >
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "action.hover",
                }}
              >
                <CheckCircleOutlinedIcon
                  sx={{
                    fontSize: 28,
                    color: "text.disabled",
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                {atendimentos.length === 0
                  ? "Nenhum atendimento foi finalizado hoje."
                  : "Nenhum resultado para essa busca."}
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {atendimentosFiltrados.map((atendimento) => {
              const nome =
                atendimento?.cidadao?.nome ||
                `Cidadão #${atendimento?.cidadao_id}`;

              return (
                <Box
                  key={atendimento.id}
                  onClick={() =>
                    navigate(
                      `/direcao/pessoa/${atendimento.cidadao_id}`
                    )
                  }
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",

                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: 4,
                      bgcolor: "success.main",
                    },

                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "success.light",
                      boxShadow:
                        "0 6px 16px rgba(31, 41, 55, 0.10)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="flex-start"
                    sx={{
                      p: 1.5,
                      pl: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "success.light",
                        color: "success.main",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleOutlinedIcon
                        fontSize="small"
                      />
                    </Box>

                    <Box
                      sx={{
                        flexGrow: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color="text.primary"
                        noWrap
                      >
                        {nome}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        noWrap
                        sx={{ mt: 0.35 }}
                      >
                        {atendimento?.assunto ||
                          "Assunto não informado"}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        noWrap
                        sx={{ mt: 0.2 }}
                      >
                        {resumoDocumentos(
                          atendimento?.cidadao
                        ) || "Sem documento cadastrado"}
                      </Typography>
                    </Box>

                    <Stack
                      spacing={0.4}
                      alignItems="flex-end"
                      flexShrink={0}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        {formatarHorario(
                          atendimento?.data_finalizacao
                        )}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="success.main"
                        fontWeight={800}
                      >
                        Concluído
                      </Typography>
                    </Stack>
                  </Stack>
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