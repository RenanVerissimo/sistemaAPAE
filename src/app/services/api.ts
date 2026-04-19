const API_BASE_URL = "http://192.168.32.108:3000";

// ==================== PACIENTES ====================

export const getAllPacientes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes`);
    if (!response.ok) throw new Error("Erro ao buscar pacientes");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return [];
  }
};

export const getQtdPacientes = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes/qtd`);
    if (!response.ok) throw new Error("Erro ao buscar quantidade de pacientes");
    const data = await response.json();
    return data.total;
  } catch (error) {
    console.error("Erro ao buscar quantidade de pacientes:", error);
    return 0;
  }
};

export const cadastrarPaciente = async (data: {
  nome: string;
  dataNasc: string;
  prontuario: string;
  cartaoSUS?: string;
  cpf?: string;
  descricao?: string;
  status?: "Ativo" | "Inativo";
  qtdConsultasRealizadas: number;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao cadastrar paciente");
    return await response.json();
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);
    throw error;
  }
};

export const atualizarPaciente = async (id: number, data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar paciente");
    return await response.json();
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);
    throw error;
  }
};

export const deletePaciente = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar paciente");
    return await response.json();
  } catch (error) {
    console.error("Erro ao deletar paciente:", error);
    throw error;
  }
};


// ==================== PROFISSIONAIS ====================

export const getAllProfissionais = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/profissionais`);
    if (!response.ok) throw new Error("Erro ao buscar profissionais");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return [];
  }
};

export const getQtdProfissionais = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profissionais/qtd`);
    if (!response.ok) throw new Error("Erro ao buscar quantidade de profissionais");
    const data = await response.json();
    return data.total;
  } catch (error) {
    console.error("Erro ao buscar quantidade de profissionais:", error);
    return 0;
  }
};

export const cadastrarProfissional = async (data: {
  nome: string;
  email: string;
  dataNasc: string;
  senha: string;
  especialidade: string;
  outraEspecialidade?: string;
  registroProfissional?: string;
  rolee: string;
  qtdAtendimentos: number;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profissionais`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao cadastrar profissional");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao cadastrar profissional:", error);
    throw error;
  }
};

export const atualizarProfissional = async (id: number, data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profissionais/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar profissional");
    return await response.json();
  } catch (error) {
    console.error("Erro ao atualizar profissional:", error);
    throw error;
  }
};

export const deleteProfissional = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profissionais/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar profissional");
    return await response.json();
  } catch (error) {
    console.error("Erro ao deletar profissional:", error);
    throw error;
  }
};


// ==================== ATENDIMENTOS ====================

export const getAtendimentos = async (filtros: {
  paciente?: string;
  profissional?: string;
  dataInicio?: string;
  dataFim?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.paciente) params.append("paciente", filtros.paciente);
    if (filtros.profissional) params.append("profissional", filtros.profissional);
    if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
    if (filtros.dataFim) params.append("dataFim", filtros.dataFim);

    const response = await fetch(`${API_BASE_URL}/atendimentos?${params.toString()}`);
    if (!response.ok) throw new Error("Erro ao buscar atendimentos");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error);
    return [];
  }
};

export const cadastrarAtendimento = async (data: {
  paciente_id: number;
  profissional_id: number;
  dataConsulta: string;
  descricao?: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/atendimentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao cadastrar atendimento");
    return await response.json();
  } catch (error) {
    console.error("Erro ao cadastrar atendimento:", error);
    throw error;
  }
};

export const atualizarAtendimento = async (id: number, data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar atendimento");
    return await response.json();
  } catch (error) {
    console.error("Erro ao atualizar atendimento:", error);
    throw error;
  }
};

export const deleteAtendimento = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar atendimento");
    return await response.json();
  } catch (error) {
    console.error("Erro ao deletar atendimento:", error);
    throw error;
  }
};