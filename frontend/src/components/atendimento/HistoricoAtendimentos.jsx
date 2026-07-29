import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AccessTimeOutlinedIcon
  from "@mui/icons-material/AccessTimeOutlined";
import BadgeOutlinedIcon
  from "@mui/icons-material/BadgeOutlined";
import DescriptionOutlinedIcon
  from "@mui/icons-material/DescriptionOutlined";
import SearchOutlinedIcon
  from "@mui/icons-material/SearchOutlined";

import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AppInfoCard from "../ui/AppInfoCard";

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

  const termoNormalizado = termo
    .trim()
    .toLowerCase();

  const digitosBuscados = apenasDigitos(termo);

  const atendimentosFiltrados = termoNormalizado
    ? atendimentos.filter((atendimento) => {
        const nome = (
          atendimento?.cidadao?.nome || ""
        ).toLowerCase();

        if (nome.includes(termoNormalizado)) {
          return true;
        }

        if (!digitosBuscados) {
          return false;
        }

        const cpf = apenasDigitos(
          atendimento?.cidadao?.cpf
        );

        const masp = apenasDigitos(
          atendimento?.cidadao?.masp
        );

        return (
          cpf.includes(digitosBuscados) ||
          masp.includes(digitosBuscados)
        );
      })
    : atendimentos;


  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        minHeight: 360,

        backgroundColor: "#FFFFFF",

        backgroundImage: `
          linear-gradient(
            145deg,
            #FFFFFF 0%,
            #FCFDFE 60%,
            #F8FAFC 100%
          )
        `,

        borderColor: "divider",
        borderRadius: "12px",

        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            md: 2.25,
          },

          "&:last-child": {
            pb: {
              xs: 2,
              md: 2.25,
            },
          },
        }}
      >
        <Stack spacing={1.25}>
          <TextField
            size="small"
            fullWidth
            value={termo}
            onChange={(evento) =>
              setTermo(
                mascararDocumentoOuNome(
                  evento.target.value
                )
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
                borderRadius: "8px",

                backgroundColor:
                  "rgba(248, 250, 252, 0.82)",
              },
            }}
          />

          <Box
            sx={{
              height: "1px",
              backgroundColor: "divider",
            }}
          />

          {atendimentosFiltrados.length === 0 ? (
            <Box
              sx={{
                minHeight: 240,

                display: "grid",
                placeItems: "center",

                px: 3,

                backgroundColor:
                  "rgba(248, 250, 252, 0.55)",

                border: "1px dashed",
                borderColor: "divider",
                borderRadius: "8px",
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
            <Stack spacing={1.25}>
              {atendimentosFiltrados.map(
                (atendimento) => {
                  const nome =
                    atendimento?.cidadao?.nome ||
                    `Cidadão #${atendimento?.cidadao_id}`;

                  const assunto =
                    atendimento?.assunto ||
                    "Assunto não informado";

                  const documentos =
                    resumoDocumentos(
                      atendimento?.cidadao
                    );

                  return (
                    <AppInfoCard
                      key={atendimento.id}
                      titulo={nome}
                      status="Concluído"
                      cor="success"
                      aoClicar={() =>
                        navigate(
                          `/direcao/pessoa/${atendimento.cidadao_id}`
                        )
                      }
                      detalhes={
                        <>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.6}
                          >
                            <DescriptionOutlinedIcon
                              fontSize="small"
                              color="action"
                            />

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={600}
                            >
                              {assunto}
                            </Typography>
                          </Stack>

                          {documentos && (
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.6}
                            >
                              <BadgeOutlinedIcon
                                fontSize="small"
                                color="action"
                              />

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {documentos}
                              </Typography>
                            </Stack>
                          )}

                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.6}
                          >
                            <AccessTimeOutlinedIcon
                              fontSize="small"
                              color="action"
                            />

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={600}
                              sx={{
                                fontVariantNumeric:
                                  "tabular-nums",
                              }}
                            >
                              {formatarHorario(
                                atendimento?.data_finalizacao
                              )}
                            </Typography>
                          </Stack>
                        </>
                      }
                    />
                  );
                }
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}