import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import { buscarCidadaoPorId } from "../../services/cidadaoService";
import {
  formatarCpf,
  formatarMasp,
  mascararTelefone,
} from "../../utils/formatacao";
import { listarAtendimentosDoCidadao } from "../../services/atendimentoService";

import "./PessoaDetalhe.css";

function formatarData(data) {
  if (!data) return null;
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function corDoStatus(status) {
  switch (status) {
    case "FINALIZADO":
      return "success";
    case "CANCELADO":
      return "error";
    case "EM_ATENDIMENTO":
    case "CONVOCADO":
      return "info";
    default:
      return "warning";
  }
}

function Campo({ rotulo, valor }) {
  if (!valor) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {rotulo}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {valor}
      </Typography>
    </Box>
  );
}

export default function PessoaDetalhe() {
  const { cidadaoId } = useParams();

  const [cidadao, setCidadao] = useState(null);
  const [atendimentos, setAtendimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [dadosCidadao, dadosAtendimentos] = await Promise.all([
        buscarCidadaoPorId(cidadaoId),
        listarAtendimentosDoCidadao(cidadaoId),
      ]);
      setCidadao(dadosCidadao);
      setAtendimentos(Array.isArray(dadosAtendimentos) ? dadosAtendimentos : []);
    } catch (e) {
      setErro(e.message || "Não foi possível carregar os dados desta pessoa.");
    } finally {
      setCarregando(false);
    }
  }, [cidadaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="pessoa-detalhe">
      <Link to="/direcao" className="voltar">
        <ArrowBackOutlinedIcon fontSize="small" />
        Voltar ao painel de controle
      </Link>

      {carregando ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : erro ? (
        <Alert severity="error">{erro}</Alert>
      ) : (
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={800} mb={2}>
                {cidadao?.nome}
              </Typography>

              <Box className="pessoa-dados-grid">
                <Campo
                  rotulo="CPF"
                  valor={
                    cidadao?.cpf_formatado || formatarCpf(cidadao?.cpf)
                  }
                />
                <Campo
                  rotulo="MASP"
                  valor={
                    cidadao?.masp_formatado
                    || formatarMasp(cidadao?.masp)
                  }
                />
                <Campo
                  rotulo="Telefone"
                  valor={mascararTelefone(cidadao?.telefone)}
                />
                <Campo rotulo="E-mail" valor={cidadao?.email} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Registros de atendimento ({atendimentos.length})
              </Typography>

              {atendimentos.length === 0 ? (
                <Alert severity="info">
                  Nenhum atendimento registrado para esta pessoa ainda.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {atendimentos.map((atendimento) => (
                    <Box key={atendimento.id} className="atendimento-item">
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Typography variant="subtitle1" fontWeight={700}>
                          {atendimento.numero_senha ? `${atendimento.numero_senha} — ` : ""}
                          {atendimento.assunto || "Assunto não informado"}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          <Chip
                            size="small"
                            label={atendimento.prioridade}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={atendimento.status}
                            color={corDoStatus(atendimento.status)}
                          />
                        </Stack>
                      </Stack>

                      {atendimento.setor?.nome && (
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          Setor: {atendimento.setor.nome} ({atendimento.setor.sigla})
                        </Typography>
                      )}

                      {atendimento.descricao && (
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          Relato do cidadão: {atendimento.descricao}
                        </Typography>
                      )}

                      <Divider sx={{ my: 1.5 }} />

                      <Box className="atendimento-campos-grid">
                        <Campo
                          rotulo="Solicitado em"
                          valor={formatarData(atendimento.data_solicitacao)}
                        />
                        <Campo
                          rotulo="Convocado em"
                          valor={formatarData(atendimento.data_convocacao)}
                        />
                        <Campo
                          rotulo="Iniciado em"
                          valor={formatarData(atendimento.data_inicio)}
                        />
                        <Campo
                          rotulo="Finalizado em"
                          valor={formatarData(atendimento.data_finalizacao)}
                        />
                        <Campo
                          rotulo="Atendido por"
                          valor={
                            atendimento.servidor_nome
                              ? `${atendimento.servidor_nome} (MASP ${
                                  formatarMasp(
                                    atendimento.servidor_masp
                                  ) || "—"
                                })`
                              : null
                          }
                        />
                        <Campo rotulo="Sala" valor={atendimento.numero_sala} />
                      </Box>

                      {(atendimento.resultado || atendimento.observacoes) && (
                        <>
                          <Divider sx={{ my: 1.5 }} />
                          {atendimento.resultado && (
                            <Typography variant="body2" mt={0.5}>
                              <strong>Resultado do atendimento:</strong> {atendimento.resultado}
                            </Typography>
                          )}
                          {atendimento.observacoes && (
                            <Typography variant="body2" mt={0.5}>
                              <strong>Observações do servidor:</strong> {atendimento.observacoes}
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </div>
  );
}
