/**
 * Formatação e máscara de documentos.
 *
 * Regra do projeto: o backend guarda CPF e MASP só com os dígitos.
 * A máscara existe apenas na tela — tanto para digitar quanto para
 * exibir. Toda vez que um valor é enviado para a API, ele passa por
 * `apenasDigitos`.
 */

export function apenasDigitos(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

/** Exibe o CPF como 000.000.000-00. */
export function formatarCpf(valor) {
  const digitos = apenasDigitos(valor);

  if (digitos.length !== 11) {
    return valor || "";
  }

  return digitos.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4"
  );
}

/**
 * Exibe o MASP no formato oficial de Minas Gerais: 7 dígitos de
 * matrícula + 1 dígito verificador (ex.: 1234567-8). MASPs com outra
 * quantidade de dígitos são mostrados como estão.
 */
export function formatarMasp(valor) {
  const digitos = apenasDigitos(valor);

  if (digitos.length !== 8) {
    return valor || "";
  }

  return `${digitos.slice(0, 7)}-${digitos.slice(7)}`;
}

/**
 * Máscara progressiva de CPF, aplicada enquanto a pessoa digita:
 * "144" → "144", "1441463" → "144.146.3", e assim por diante.
 */
export function mascararCpf(valor) {
  const digitos = apenasDigitos(valor).slice(0, 11);

  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** Máscara progressiva de MASP (1234567-8). */
export function mascararMasp(valor) {
  const digitos = apenasDigitos(valor).slice(0, 8);

  return digitos.replace(/(\d{7})(\d)/, "$1-$2");
}

/** Máscara de telefone: (31) 99999-8888 ou (31) 3999-8888. */
export function mascararTelefone(valor) {
  const digitos = apenasDigitos(valor).slice(0, 11);

  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digitos
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/**
 * Aplica a máscara certa dependendo do que a pessoa está digitando na
 * busca: só números com cara de CPF viram CPF, com cara de MASP viram
 * MASP, e qualquer coisa com letra é tratada como nome e fica intacta.
 */
export function mascararDocumentoOuNome(valor) {
  const texto = String(valor ?? "");

  if (/[^\d.\-\s]/.test(texto)) {
    return texto;
  }

  const digitos = apenasDigitos(texto);

  if (digitos.length > 8) {
    return mascararCpf(texto);
  }

  return mascararMasp(texto);
}

/**
 * Linha "CPF: ... · MASP: ..." usada nas listas. Prefere os campos já
 * formatados pelo backend e, se não vierem, formata aqui mesmo.
 */
export function resumoDocumentos(cidadao) {
  if (!cidadao) return "";

  const cpf = cidadao.cpf_formatado || formatarCpf(cidadao.cpf);
  const masp = cidadao.masp_formatado || formatarMasp(cidadao.masp);

  return [
    cpf ? `CPF: ${cpf}` : null,
    masp ? `MASP: ${masp}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
