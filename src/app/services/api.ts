const API_BASE_URL = "http://192.168.32.108:3000";

//const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000`;

// ==================== PACIENTES ====================

export async function getAllPacientes() {
  const response = await fetch(`${API_BASE_URL}/pacientes`);
  if (!response.ok) throw new Error("Erro ao buscar pacientes");
  return response.json();
}


export async function getQtdPacientes(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/pacientes/qtd`);

  if (!response.ok) {
    throw new Error("Erro ao buscar quantidade de profissionais");
  }

  const data = await response.json();
  return data.total;
}


export async function cadastrarPaciente(data: {
  nome: string;
  dataNasc: string;
  prontuario: string;
  cartaoSUS?: string;
  cpf?: string;
  descricao?: string;
  status?: "Ativo" | "Inativo";
  qtdConsultasRealizadas: number;
}) {
  const response = await fetch(`${API_BASE_URL}/pacientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Erro ao cadastrar paciente");
  return response.json();
}

export async function deletePaciente(id: number) {
  const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Erro ao deletar paciente");
  return response.json();
}

export async function atualizarPaciente(id: number, data: any) {
  const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Erro ao atualizar paciente");
  return response.json();
}



// ==================== PROFISSIONAIS ====================

export async function getAllProfissionais() {
  const response = await fetch(`${API_BASE_URL}/profissionais`);

  if (!response.ok) throw new Error("Erro ao buscar profissionais");
  return response.json();
}

export async function getQtdProfissionais(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/profissionais/qtd`);

  if (!response.ok) {
    throw new Error("Erro ao buscar quantidade de profissionais");
  }

  const data = await response.json();
  return data.total;
}


export async function cadastrarProfissional(data: {
  nome: string;
  email: string;
  dataNasc: string;
  senha: string;
  especialidade: string;
  outraEspecialidade?: string;
  registroProfissional?: string;
  rolee: string;
  qtdAtendimentos: number;
}) {
  const response = await fetch(`${API_BASE_URL}/profissionais`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro ao cadastrar profissional");
  }

  return response.json();
}

export async function atualizarProfissional(id: number, data: any) {
  const response = await fetch(`${API_BASE_URL}/profissionais/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Erro ao atualizar profissional");
  return response.json();
}

export async function deleteProfissional(id: number) {
  const response = await fetch(`${API_BASE_URL}/profissionais/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Erro ao deletar profissional");
  return response.json();
}


export async function getRelatorios() {
  console.log("getRelatorios chamado");
  return []; // retorna array vazio por enquanto
}

export async function saveRelatorio(data: any) {
  console.log("saveRelatorio chamado:", data);
  return { success: true };
}

export async function updateRelatorio(id: number, data: any) {
  console.log("updateRelatorio chamado:", id, data);
  return { success: true };
}

export async function deleteRelatorio(id: number) {
  console.log("deleteRelatorio chamado:", id);
  return { success: true };
}

// ==================== ATENDIMENTOS ====================

export async function getAtendimentos(filtros: {
  paciente?: string;
  profissional?: string;
  dataInicio?: string;
  dataFim?: string;
}) {
  const params = new URLSearchParams();
  if (filtros.paciente) params.append("paciente", filtros.paciente);
  if (filtros.profissional) params.append("profissional", filtros.profissional);
  if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
  if (filtros.dataFim) params.append("dataFim", filtros.dataFim);

  const response = await fetch(`${API_BASE_URL}/atendimentos?${params.toString()}`);
  if (!response.ok) throw new Error("Erro ao buscar atendimentos");
  return response.json();
}

export async function cadastrarAtendimento(data: {
  paciente_id: number;
  profissional_id: number;
  dataConsulta: string;
  descricao?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/atendimentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Erro ao cadastrar atendimento");
  return response.json();
}

export async function atualizarAtendimento(id: number, data: any) {
  const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Erro ao atualizar atendimento");
  return response.json();
}

export async function deleteAtendimento(id: number) {
  const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao deletar atendimento");
  return response.json();
}