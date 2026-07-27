import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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

import { apenasDigitos, mascararMasp } from "../../utils/formatacao";


function AcessoServidor() {
  const navigate = useNavigate();
  const localizacao = useLocation();

  // Quando o RotaProtegida redireciona pra cá, ele guarda em
  // state.next a página que a pessoa tentou acessar — depois do login
  // ela volta pra lá, em vez de sempre cair no dashboard genérico.
  const destinoAposLogin = localizacao.state?.next || "/direcao";

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

    // O MASP é digitado com a máscara oficial (1234567-8), mas segue
    // para a API só com os dígitos — é assim que ele está no cadastro.
    const valorFormatado =
      name === "servidorMasp" ? mascararMasp(value) : value;

    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: valorFormatado,
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
        servidor_masp: apenasDigitos(formulario.servidorMasp),
        senha: formulario.senha,
      });

      sessionStorage.setItem(
        "acessoServidor",
        JSON.stringify(acesso)
      );

      navigate(destinoAposLogin, { replace: true });
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
        backgroundColor: "background.default",
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
                    placeholder="1234567-8"
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
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ width: "100%" }}
                        >
                          <span>
                            {setor.nome} ({setor.sigla})
                          </span>

                          {setor.perfil === "DIRECAO" && (
                            <Chip
                              label="Direção"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ ml: "auto" }}
                            />
                          )}
                        </Stack>
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
