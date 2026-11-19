
const os = require("os");
const fs = require("fs");
const path = require("path");

const ARQUIVO_IP = path.join(__dirname, "ultimo-ip.txt");
const PORTA_FRONTEND = 5173;

function obterIP() {
  const redes = os.networkInterfaces();
  const candidatos = [];

  for (const [nome, enderecos] of Object.entries(redes)) {
    for (const rede of enderecos || []) {
      if (rede.family === "IPv4" && !rede.internal) {
        candidatos.push({ nome, ip: rede.address });
      }
    }
  }

  // Prioriza as interfaces Wi-Fi ou Ethernet.
  const principal = candidatos.find(
    ({ nome }) =>
      /wi-fi|wifi|ethernet|wlan/i.test(nome) &&
      !/virtual|vethernet|vmware|vbox|bluetooth/i.test(nome)
  );

  return principal?.ip || candidatos[0]?.ip || null;
}

function verificarMudancaIP() {
  const ipAtual = obterIP();

  if (!ipAtual) {
    console.log("Não foi possível identificar o IP da rede.");
    return;
  }

  const ipAnterior = fs.existsSync(ARQUIVO_IP)
    ? fs.readFileSync(ARQUIVO_IP, "utf8").trim()
    : null;

  console.log("\n========== SISTEMA APAE ==========");

  if (ipAnterior && ipAnterior !== ipAtual) {
    console.log("⚠️ O ENDEREÇO IP MUDOU!");
    console.log("IP anterior:", ipAnterior);
    console.log("IP atual:   ", ipAtual);
  } else if (!ipAnterior) {
    console.log("Primeiro registro do IP do servidor.");
  } else {
    console.log("O endereço IP não foi alterado.");
  }

  console.log("\nEndereço do sistema:");
  console.log(`http://${ipAtual}:${PORTA_FRONTEND}`);
  console.log("==================================\n");

  fs.writeFileSync(ARQUIVO_IP, ipAtual);
}

verificarMudancaIP();
