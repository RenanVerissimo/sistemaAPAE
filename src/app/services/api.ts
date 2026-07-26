const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

export interface StatusProfissionalPTS {
  pacienteId: number;
  pacienteNome: string;
  profissionalId: number;
  profissionalNome: string;
  especialidade?: string;
  registroProfissional?: string | null;
  statusProfPts: boolean | number;
}

export const getStatusProfissionaisPTS = async (): Promise<StatusProfissionalPTS[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profissionais/status-pts`);
    if (!response.ok) throw new Error("Erro ao buscar status PTS dos profissionais");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar status PTS dos profissionais:", error);
    return [];
  }
};

export interface RelatorioPTSData {
  aluno: any;
  profissional: any;
  campos: {
    historicoClinico?: string;
    objetivos?: string;
    tecnicas?: string;
    evolucao?: string;
    recomendacoes?: string;
  };
}

export const getRelatorioPTS = async (
  pacienteId: number,
  profissionalId: number
): Promise<RelatorioPTSData> => {
  const response = await fetch(
    `${API_BASE_URL}/registros-pts/${pacienteId}/${profissionalId}/relatorio`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar relatorio PTS");
  }

  const data = await response.json();

  return {
    ...data,
    campos: {
      historicoClinico: data.campos?.historicoClinico ?? "",
      objetivos: data.campos?.objetivos ?? "",
      tecnicas: data.campos?.tecnicas ?? "",
      evolucao: data.campos?.evolucao ?? "",
      recomendacoes: data.campos?.recomendacoes ?? "",
    },
  };
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


export async function atualizarSenhaProfissional(id: number, senha: string) {
  const res = await fetch(`${API_BASE_URL}/profissionais/${id}/senha`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senha }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erro ao atualizar senha");
  }
  return res.json();
}

// ==================== ATENDIMENTOS ====================

export const getAtendimentos = async (filtros: {
  paciente?: string;
  profissional?: string;
  especialidade?: string;
  dataInicio?: string;
  dataFim?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.paciente) params.append("paciente", filtros.paciente);
    if (filtros.profissional) params.append("profissional", filtros.profissional);
    if (filtros.especialidade) params.append("especialidade", filtros.especialidade);
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

export const deleteAtendimento = async (id: number, profissionalId: number) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/atendimentos/${id}?profissional_id=${profissionalId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || "Erro ao deletar atendimento");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao deletar atendimento:", error);
    throw error;
  }
};

// ==================== REGISTROS DE EVOLUCAO / PTS ====================

export interface RegistroEvolucao {
  id?: number;
  pacienteId: number;
  profissionalId: number;
  historicoClinico?: string | null;
  objetivosTratamento?: string | null;
  tecnicasProcedimentos?: string | null;
  evolucaoPaciente?: string | null;
  recomendacoesFinais?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const getRegistroEvolucao = async (
  pacienteId: number,
  profissionalId: number
): Promise<RegistroEvolucao | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/registros-evolucao/${pacienteId}?profissional_id=${profissionalId}`
    );
    if (!response.ok) throw new Error("Erro ao buscar registro de evolucao");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar registro de evolucao:", error);
    throw error;
  }
};

export const salvarRegistroEvolucao = async (
  pacienteId: number,
  data: {
    profissional_id: number;
    historicoClinico: string;
    objetivosTratamento: string;
    tecnicasProcedimentos: string;
    evolucaoPaciente: string;
    recomendacoesFinais: string;
  }
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/registros-evolucao/${pacienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao salvar registro de evolucao");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao salvar registro de evolucao:", error);
    throw error;
  }
};

// ==================== LAUDOS ====================

export interface Laudo {
  id: number;
  pacienteId: number;
  nomeArquivo: string;
  tamanho: number;
  tipo: string;
  observacao?: string | null;
  createdAt: string;
}

export const getLaudosPaciente = async (pacienteId: number): Promise<Laudo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/laudos/paciente/${pacienteId}`);
    if (!response.ok) throw new Error("Erro ao buscar laudos");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar laudos:", error);
    return [];
  }
};

export const enviarLaudoPaciente = async (
  pacienteId: number,
  file: File,
  observacao?: string
) => {
  try {
    const formData = new FormData();
    formData.append("pdf", file);
    if (observacao) formData.append("observacao", observacao);

    const response = await fetch(`${API_BASE_URL}/api/laudos/${pacienteId}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao enviar laudo");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao enviar laudo:", error);
    throw error;
  }
};

export const getUrlLaudo = (id: number, download = false) =>
  `${API_BASE_URL}/api/laudos/arquivo/${id}${download ? "?download=1" : ""}`;

export const excluirLaudo = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/laudos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao excluir laudo");
    return await response.json();
  } catch (error) {
    console.error("Erro ao excluir laudo:", error);
    throw error;
  }
};

// ==================== BACKUP ====================

export const executarBackupManual = async () => {
  const response = await fetch(`${API_BASE_URL}/backup/manual`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao executar backup manual");
  }

  return response.json();
};

export const login = async (email: string, senha: string) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  if (!response.ok) return null;
  return await response.json();
};
