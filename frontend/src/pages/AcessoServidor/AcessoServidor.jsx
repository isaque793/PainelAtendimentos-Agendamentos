import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  listarSetoresPublicos,
  validarAcessoSetor,
} from "../../services/setorService";


function AcessoServidor() {
  const navigate = useNavigate();

  const [setores, setSetores] = useState([]);
  const [carregandoSetores, setCarregandoSetores] =
    useState(true);

  const [formulario, setFormulario] = useState({
    servidorNome: "",
    servidorMasp: "",
    setorId: "",
    senha: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    async function carregarSetores() {
      try {
        setCarregandoSetores(true);
        setMensagemErro("");

        const dados = await listarSetoresPublicos();

        setSetores(dados);
      } catch (erro) {
        console.error(
          "Erro ao carregar setores:",
          erro
        );

        setMensagemErro(
          "Não foi possível carregar os setores."
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

  async function entrar(evento) {
    evento.preventDefault();

    try {
      setEnviando(true);
      setMensagemErro("");

      const acesso = await validarAcessoSetor({
        setor_id: Number(formulario.setorId),
        servidor_nome:
          formulario.servidorNome.trim(),
        servidor_masp:
          formulario.servidorMasp.trim(),
        senha: formulario.senha,
      });

      sessionStorage.setItem(
        "acessoServidor",
        JSON.stringify(acesso)
      );

      navigate("/direcao/atendimentos");
    } catch (erro) {
      console.error(
        "Erro ao validar acesso:",
        erro
      );

      setMensagemErro(
        erro.message
        || "Não foi possível validar o acesso."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f4f6f8",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <LockOutlinedIcon
                  sx={{ fontSize: 48 }}
                />
              </Box>

              <Box textAlign="center">
                <Typography
                  variant="h4"
                  fontWeight="bold"
                >
                  Acesso do servidor
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Informe seus dados e o setor
                  responsável pelo atendimento.
                </Typography>
              </Box>

              {mensagemErro && (
                <Alert severity="error">
                  {mensagemErro}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={entrar}
              >
                <Stack spacing={3}>
                  <TextField
                    label="Nome completo"
                    name="servidorNome"
                    value={formulario.servidorNome}
                    onChange={atualizarCampo}
                    required
                    fullWidth
                  />

                  <TextField
                    label="MASP"
                    name="servidorMasp"
                    value={formulario.servidorMasp}
                    onChange={atualizarCampo}
                    required
                    fullWidth
                  />

                  <TextField
                    select
                    label="Setor"
                    name="setorId"
                    value={formulario.setorId}
                    onChange={atualizarCampo}
                    required
                    fullWidth
                    disabled={carregandoSetores}
                  >
                    {setores.map((setor) => (
                      <MenuItem
                        key={setor.id}
                        value={setor.id}
                      >
                        {setor.nome} ({setor.sigla})
                      </MenuItem>
                    ))}
                  </TextField>

                  {carregandoSetores && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={20} />

                      <Typography variant="body2">
                        Carregando setores...
                      </Typography>
                    </Box>
                  )}

                  <TextField
                    label="Senha do setor"
                    name="senha"
                    type="password"
                    value={formulario.senha}
                    onChange={atualizarCampo}
                    required
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
                    }
                  >
                    {enviando
                      ? "Validando acesso..."
                      : "Entrar"}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default AcessoServidor;