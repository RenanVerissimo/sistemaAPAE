import fs from "fs";
import path from "path";

function formatarNome(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function criarPastaPaciente(id, nome) {
  const nomeFormatado = formatarNome(nome);
  const pasta = path.join("uploads", `${id}_${nomeFormatado}`);

  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }

  return pasta;
}