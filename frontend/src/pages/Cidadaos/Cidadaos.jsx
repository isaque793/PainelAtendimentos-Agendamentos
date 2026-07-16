import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  cadastrarCidadao,
  excluirCidadao,
  listarCidadaos,
} from "../../api/cidadaoService";

const formularioInicial = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  masp: "",
};

function Cidadaos() {
  const [cidadaos, setCidadaos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  async function carregarCidadaos() {
    try {
      setCarregando(true);

      const dados = await listarCidadaos();
      setCidadaos(dados);
    } catch (erro) {
      mostrarMensagem(erro.message, "error");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCidadaos();
  }, []);

  function mostrarMensagem(texto, tipo) {
    setMensagem(texto);
    setTipoMensagem(tipo);
  }

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((formularioAnterior) => ({
      ...formularioAnterior,
      [name]: value,
    }));
  }

  function limparFormulario() {
    setFormulario(formularioInicial);
  }

  function prepararDados() {
    return {
      nome: formulario.nome.trim(),
      cpf: formulario.cpf.trim() || null,
      telefone: formulario.telefone.trim() || null,
      email: formulario.email.trim() || null,
      masp: formulario.masp.trim() || null,
    };
  }

  async function salvarCidadao(evento) {
    evento.preventDefault();

    if (!formulario.nome.trim()) {
      mostrarMensagem("Informe o nome do cidadão.", "warning");
      return;
    }

    if (!formulario.cpf.trim() && !formulario.masp.trim()) {
      mostrarMensagem(
        "Informe pelo menos o CPF ou o MASP.",
        "warning",
      );
      return;
    }

    try {
      setSalvando(true);

      const novoCidadao = await cadastrarCidadao(prepararDados());

      setCidadaos((listaAnterior) => [
        ...listaAnterior,
        novoCidadao,
      ]);

      limparFormulario();
      mostrarMensagem("Cidadão cadastrado com sucesso.", "success");
    } catch (erro) {
      mostrarMensagem(erro.message, "error");
    } finally {
      setSalvando(false);
    }
  }

  async function removerCidadao(cidadao) {
    const confirmou = window.confirm(
      `Deseja realmente excluir ${cidadao.nome}?`,
    );

    if (!confirmou) {
      return;
    }

    try {
      await excluirCidadao(cidadao.id);

      setCidadaos((listaAnterior) =>
        listaAnterior.filter((item) => item.id !== cidadao.id),
      );

      mostrarMensagem("Cidadão excluído com sucesso.", "success");
    } catch (erro) {
      mostrarMensagem(erro.message, "error");
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Cidadãos
          </Typography>

          <Typography color="text.secondary">
            Cadastre e consulte os cidadãos atendidos pelo sistema.
          </Typography>
        </Box>

        <Paper component="form" onSubmit={salvarCidadao} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Novo cidadão
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 2,
            }}
          >
            <TextField
              label="Nome completo"
              name="nome"
              value={formulario.nome}
              onChange={alterarCampo}
              required
              fullWidth
            />

            <TextField
              label="CPF"
              name="cpf"
              value={formulario.cpf}
              onChange={alterarCampo}
              fullWidth
            />

            <TextField
              label="MASP"
              name="masp"
              value={formulario.masp}
              onChange={alterarCampo}
              fullWidth
            />

            <TextField
              label="Telefone"
              name="telefone"
              value={formulario.telefone}
              onChange={alterarCampo}
              fullWidth
            />

            <TextField
              label="E-mail"
              name="email"
              type="email"
              value={formulario.email}
              onChange={alterarCampo}
              fullWidth
              sx={{
                gridColumn: {
                  xs: "auto",
                  md: "span 2",
                },
              }}
            />
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="flex-end"
            spacing={2}
            mt={3}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={limparFormulario}
              disabled={salvando}
            >
              Limpar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Cadastrar cidadão"}
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Cidadãos cadastrados
          </Typography>

          {carregando ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 5,
              }}
            >
              <CircularProgress />
            </Box>
          ) : cidadaos.length === 0 ? (
            <Alert severity="info">
              Nenhum cidadão cadastrado.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>MASP</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {cidadaos.map((cidadao) => (
                    <TableRow key={cidadao.id} hover>
                      <TableCell>{cidadao.nome}</TableCell>
                      <TableCell>{cidadao.cpf || "—"}</TableCell>
                      <TableCell>{cidadao.masp || "—"}</TableCell>
                      <TableCell>{cidadao.telefone || "—"}</TableCell>
                      <TableCell>{cidadao.email || "—"}</TableCell>

                      <TableCell align="right">
                        <Button
                          color="error"
                          size="small"
                          onClick={() => removerCidadao(cidadao)}
                        >
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>

      <Snackbar
        open={Boolean(mensagem)}
        autoHideDuration={5000}
        onClose={() => setMensagem("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={tipoMensagem}
          variant="filled"
          onClose={() => setMensagem("")}
        >
          {mensagem}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Cidadaos;